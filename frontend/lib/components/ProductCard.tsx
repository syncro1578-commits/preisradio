import Link from 'next/link'

interface Product {
  id: number
  ean: string
  name: string
  category: string
  image: string | null
  min_price: number | null
  max_price: number | null
  price_count: number
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400">Pas d&apos;image</div>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">{product.category}</p>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">EAN: {product.ean}</p>
          <div className="mt-4 flex justify-between items-end">
            <div>
              {product.min_price && (
                <div>
                  <p className="text-xs text-gray-500">À partir de</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{product.min_price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {product.price_count} {product.price_count === 1 ? 'prix' : 'prix'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
