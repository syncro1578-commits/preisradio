'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

interface Retailer {
  id: number
  name: string
  slug: string
  website: string
  logo: string | null
}

interface Price {
  id: number
  retailer: Retailer
  price: number
  currency: string
  stock_status: string
  url: string | null
  last_checked: string
}

interface Product {
  id: number
  ean: string
  name: string
  description: string
  category: string
  image: string | null
  prices: Price[]
  created_at: string
  updated_at: string
}

export default function ProductDetail() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${API_URL}/api/products/${params.id}/`
        )
        setProduct(response.data)
        setError(null)
      } catch (err) {
        setError('Erreur lors du chargement du produit')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  if (error || !product) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Produit non trouvé'}
      </div>
    )
  }

  const sortedPrices = [...product.prices].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price)
  )
  const minPrice = sortedPrices[0]
  const maxPrice = sortedPrices[sortedPrices.length - 1]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400">Pas d&apos;image disponible</div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">EAN: {product.ean}</p>

          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {minPrice && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Meilleur prix</p>
              <p className="text-4xl font-bold text-green-600">
                €{minPrice.price}
              </p>
              {maxPrice && minPrice.id !== maxPrice.id && (
                <p className="text-sm text-gray-600 mt-2">
                  jusqu&apos;à €{maxPrice.price}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500">
            {product.prices.length} {product.prices.length === 1 ? 'prix' : 'prix'} disponible(s)
          </p>
        </div>
      </div>

      {/* Prices Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Comparaison des Prix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Détaillant</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Dernière mise à jour</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrices.map((price) => (
                <tr key={price.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold">{price.retailer.name}</p>
                      <p className="text-xs text-gray-500">{price.retailer.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-lg font-bold text-green-600">
                      €{price.price}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        price.stock_status === 'in_stock'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {price.stock_status === 'in_stock' ? 'En stock' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {new Date(price.last_checked).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {price.url && (
                      <a
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Voir
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
