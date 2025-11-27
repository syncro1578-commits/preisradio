'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ProductSimilarProps {
  productId: string;
}

export default function ProductSimilar({ productId }: ProductSimilarProps) {
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimilar();
  }, [productId]);

  const loadSimilar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_BASE}/products/${productId}/similar/`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits similaires');
      }

      const data = await response.json();
      setSimilar(data.results || []);
    } catch (err) {
      console.error('Error loading similar products:', err);
      setError('Impossible de charger les produits similaires');
    } finally {
      setLoading(false);
    }
  };

  if (loading || error || similar.length === 0) {
    return null;
  }

  const getLowestPrice = (product: any) => {
    if (!product.prices || product.prices.length === 0) {
      return null;
    }
    return Math.min(...product.prices.map((p: any) => p.price));
  };

  return (
    <div className="mt-12 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Produits similaires
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Les clients intéressés par ce produit ont aussi regardé ces articles
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((product) => {
          const lowestPrice = getLowestPrice(product);
          const availableRetailers = product.prices
            ? product.prices.filter((p: any) => p.stock_status === 'in_stock').length
            : 0;

          return (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600">
                {/* Image */}
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-800">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title || 'Product'}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <svg
                        className="h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {product.category}
                  </span>

                  {/* Title */}
                  <h3 className="mt-3 line-clamp-2 font-semibold text-gray-900 dark:text-white">
                    {product.title}
                  </h3>

                  {/* Price & Stock */}
                  <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <div>
                      {lowestPrice !== null ? (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            À partir de
                          </p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {lowestPrice.toFixed(2)} €
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Prix non disponible
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {availableRetailers} vendeur{availableRetailers > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Voir →
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
