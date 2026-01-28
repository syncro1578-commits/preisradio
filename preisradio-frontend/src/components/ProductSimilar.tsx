'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <div className="mt-12 rounded-xl bg-white p-4 sm:p-8 shadow-lg dark:bg-zinc-900">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Ähnliche Produkte
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Kunden, die dieses Produkt angesehen haben, schauten sich auch diese Artikel an
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        {similar.map((product) => {
          const currentPrice = product.price;
          const oldPrice = product.old_price;
          const hasDiscount = oldPrice && oldPrice > currentPrice;

          return (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600 flex flex-col h-full">
                {/* Image - Adaptée pour mobile */}
                <div className="relative h-24 sm:h-40 lg:h-48 w-full overflow-hidden bg-gray-50 dark:bg-zinc-800">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-1 sm:p-2 lg:p-4 transition-transform group-hover:scale-105"
                      unoptimized={product.image.startsWith('http')}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <svg
                        className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
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

                {/* Content - Simplifié pour mobile */}
                <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-1">
                  {/* Category Badge - Caché sur mobile */}
                  <span className="hidden sm:inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                    {product.category}
                  </span>

                  {/* Title - Réduit sur mobile */}
                  <h3 className="line-clamp-2 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-auto">
                    {product.title}
                  </h3>

                  {/* Price - Simplifié sur mobile */}
                  <div className="mt-2 sm:mt-3 border-t border-gray-100 pt-2 sm:pt-3 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          Preis
                        </p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-sm sm:text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400">
                            {currentPrice.toFixed(2)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">
                            {product.currency}
                          </p>
                        </div>
                        {hasDiscount && oldPrice && (
                          <p className="text-[9px] sm:text-xs text-gray-500 line-through dark:text-gray-400">
                            {oldPrice.toFixed(2)}€
                          </p>
                        )}
                      </div>

                      {/* Brand et bouton - Cachés sur mobile */}
                      <div className="text-right hidden sm:block">
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
                </div>

                {/* Badge de réduction - Plus petit sur mobile */}
                {hasDiscount && product.discount && (
                  <div className="absolute right-1 top-1 sm:right-2 sm:top-2 rounded-full bg-red-500 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-semibold text-white">
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
