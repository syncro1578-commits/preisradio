'use client';

import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PriceComparisonProps {
  currentProduct: Product;
}

export default function PriceComparison({ currentProduct }: PriceComparisonProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProduct.gtin) {
      loadPriceComparison();
    } else {
      setLoading(false);
    }
  }, [currentProduct.gtin]);

  const loadPriceComparison = async () => {
    if (!currentProduct.gtin) return;

    try {
      setLoading(true);
      const response = await api.getProductsByGtin(currentProduct.gtin);

      // Filtrer pour avoir uniquement un produit par retailer
      const uniqueRetailers = new Map<string, Product>();
      response.results.forEach((product) => {
        const retailer = product.retailer || 'unknown';
        if (!uniqueRetailers.has(retailer) || uniqueRetailers.get(retailer)!.price > product.price) {
          uniqueRetailers.set(retailer, product);
        }
      });

      setProducts(Array.from(uniqueRetailers.values()));
    } catch (error) {
      console.error('Error loading price comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Ne rien afficher si on a moins de 2 produits (pas de comparaison possible)
  if (products.length < 2) {
    return null;
  }

  // Trouver le prix le plus bas
  const sortedPrices = [...products].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0]?.price;

  const getRetailerInfo = (retailer?: string) => {
    if (retailer === 'saturn') {
      return {
        name: 'Saturn',
        color: 'bg-red-600',
        borderColor: 'border-red-600',
        textColor: 'text-red-600',
        logo: '🪐'
      };
    } else if (retailer === 'mediamarkt') {
      return {
        name: 'MediaMarkt',
        color: 'bg-red-700',
        borderColor: 'border-red-700',
        textColor: 'text-red-700',
        logo: '📺'
      };
    }
    return {
      name: 'Händler',
      color: 'bg-gray-600',
      borderColor: 'border-gray-600',
      textColor: 'text-gray-600',
      logo: '🏪'
    };
  };

  return (
    <div className="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          💰 Comparaison des prix
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Comparez les prix du même produit chez différents retailers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sortedPrices.map((product) => {
          const retailerInfo = getRetailerInfo(product.retailer);
          const isBestPrice = product.price === lowestPrice;
          const hasDiscount = product.old_price && product.old_price > product.price;

          return (
            <div
              key={product.id}
              className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all ${
                isBestPrice
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50'
              }`}
            >
              {/* Badge meilleur prix */}
              {isBestPrice && (
                <div className="absolute -right-12 top-4 rotate-45 bg-green-500 px-12 py-1 text-center text-xs font-bold text-white">
                  MEILLEUR PRIX
                </div>
              )}

              {/* Logo et nom du retailer */}
              <div className="mb-4 flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full ${retailerInfo.color} px-4 py-2 text-sm font-bold text-white`}>
                  <span className="text-lg">{retailerInfo.logo}</span>
                  <span>{retailerInfo.name}</span>
                </span>
              </div>

              {/* Prix */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Prix actuel</p>
                <div className="flex items-baseline gap-3">
                  <p className={`text-4xl font-bold ${isBestPrice ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {product.price.toFixed(2)} {product.currency}
                  </p>
                  {hasDiscount && product.old_price && (
                    <p className="text-lg text-gray-500 line-through dark:text-gray-400">
                      {product.old_price.toFixed(2)} {product.currency}
                    </p>
                  )}
                </div>

                {/* Badge de réduction */}
                {product.discount && (
                  <p className="mt-2 inline-block rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                    {product.discount}
                  </p>
                )}
              </div>

              {/* Bouton d'achat */}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-lg ${
                  isBestPrice
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Acheter chez {retailerInfo.name}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* Informations supplémentaires */}
              {product.scraped_at && (
                <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                  Mis à jour: {new Date(product.scraped_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Économie potentielle */}
      {products.length === 2 && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
          <p className="text-center text-sm font-medium text-blue-900 dark:text-blue-100">
            💡 Économisez jusqu'à{' '}
            <span className="font-bold">
              {(Math.max(...products.map(p => p.price)) - lowestPrice).toFixed(2)} {products[0].currency}
            </span>
            {' '}en choisissant le meilleur prix !
          </p>
        </div>
      )}
    </div>
  );
}
