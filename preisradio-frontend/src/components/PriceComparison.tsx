'use client';

import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Image from 'next/image';
import { getRetailerInfo } from '@/lib/retailerUtils';

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


  return (
    <div className="mb-8 rounded-xl bg-white p-4 md:p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">💰</span>
          Preisvergleich
        </h2>
        <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Vergleichen Sie Preise bei verschiedenen Händlern
        </p>
      </div>

      <div className="space-y-3">
        {sortedPrices.map((product) => {
          const retailerInfo = getRetailerInfo(product.retailer);
          const isBestPrice = product.price === lowestPrice;
          const hasDiscount = product.old_price && product.old_price > product.price;
          const savings = isBestPrice && products.length >= 2
            ? Math.max(...products.map(p => p.price)) - lowestPrice
            : 0;

          return (
            <div
              key={product.id}
              className={`relative overflow-hidden rounded-lg border-2 p-3 md:p-4 transition-all hover:shadow-md ${
                isBestPrice
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Retailer Info */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full ${retailerInfo.color} px-2 md:px-3 py-1 text-xs md:text-sm font-bold text-white whitespace-nowrap`}>
                    {retailerInfo.logo && (
                      <Image
                        src={retailerInfo.logo}
                        alt={retailerInfo.name}
                        width={50}
                        height={16}
                        className="h-3 w-auto object-contain brightness-0 invert"
                      />
                    )}
                    <span className="hidden sm:inline">{retailerInfo.name}</span>
                  </span>

                  {/* Badge bester Preis */}
                  {isBestPrice && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">BESTER PREIS</span>
                      <span className="sm:hidden">BEST</span>
                    </span>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && product.discount && (
                    <span className="hidden md:inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {product.discount}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <p className={`text-xl md:text-2xl font-bold ${isBestPrice ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {product.price.toFixed(2)}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">€</span>
                  </div>
                  {hasDiscount && product.old_price && (
                    <p className="text-xs text-gray-500 line-through dark:text-gray-400">
                      {product.old_price.toFixed(2)} €
                    </p>
                  )}
                </div>

                {/* Buy Button */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 rounded-lg ${
                    isBestPrice
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white transition-all hover:shadow-lg flex-shrink-0`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="hidden sm:inline">Kaufen</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Savings indicator for best price */}
              {isBestPrice && savings > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Sie sparen {savings.toFixed(2)} € gegenüber dem teuersten Angebot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
