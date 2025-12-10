'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ProductSimilarProps {
  productId: string;
}

export default function ProductSimilar({ productId }: ProductSimilarProps) {
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimilar();
  }, [productId]);

  const loadSimilar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getSimilarProducts(productId);
      setSimilar(response.results || []);
    } catch (err) {
      console.error('Error loading similar products:', err);
      setError('Fehler beim Laden ähnlicher Produkte');
    } finally {
      setLoading(false);
    }
  };

  if (loading || error || similar.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ähnliche Produkte
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Kunden, die dieses Produkt angesehen haben, schauten sich auch diese Artikel an
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((product) => {
          const currentPrice = product.price;
          const oldPrice = product.old_price;
          const hasDiscount = oldPrice && oldPrice > currentPrice;

          return (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600 flex flex-col">
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-50 dark:bg-zinc-800">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
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

                  {/* Price */}
                  <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Preis
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {currentPrice.toFixed(2)} {product.currency}
                        </p>
                        {hasDiscount && oldPrice && (
                          <p className="text-xs text-gray-500 line-through dark:text-gray-400">
                            {oldPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {product.brand && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.brand}
                        </p>
                      )}
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Ansehen →
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badge de réduction */}
                {hasDiscount && product.discount && (
                  <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    {product.discount}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
