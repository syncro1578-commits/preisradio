'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const getRetailerInfo = (retailer?: string) => {
    if (retailer === 'saturn') {
      return { name: 'Saturn', logo: '/retailers/saturn.png' };
    } else if (retailer === 'mediamarkt') {
      return { name: 'MediaMarkt', logo: '/retailers/mediamarkt.png' };
    } else if (retailer === 'otto') {
      return { name: 'Otto', logo: '/retailers/otto.png' };
    } else if (retailer === 'kaufland') {
      return { name: 'Kaufland', logo: '/retailers/kaufland.png' };
    }
    return { name: 'Händler', logo: null };
  };

  const retailerInfo = getRetailerInfo(product.retailer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 dark:bg-zinc-800/90 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:gap-8 md:p-8">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-zinc-800">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-4"
                unoptimized={product.image.startsWith('http')}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {/* Retailer logo */}
            <div className="mb-3 h-8">
              {retailerInfo.logo ? (
                <Image
                  src={retailerInfo.logo}
                  alt={retailerInfo.name}
                  width={100}
                  height={32}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span className="inline-block rounded-full bg-gray-600 px-3 py-1 text-xs font-medium text-white">
                  {retailerInfo.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h2>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {product.category && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-200">
                  {product.category}
                </span>
              )}
              {product.brand && (
                <span className="rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm font-medium text-purple-800 dark:text-purple-200">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6">
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Prix actuel</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price.toFixed(2)}
                </p>
                <p className="text-xl text-blue-600 dark:text-blue-400">{product.currency}</p>
              </div>
              {product.old_price && product.old_price > product.price && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Prix original: <span className="line-through">{product.old_price.toFixed(2)}€</span>
                  {product.discount && (
                    <span className="ml-2 font-semibold text-red-600 dark:text-red-400">
                      {product.discount}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                  {product.description}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-auto flex gap-3">
              <Link
                href={`/product/${product.id}`}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Voir les détails
              </Link>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 text-center font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                Acheter maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
