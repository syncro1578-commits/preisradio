'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  viewAllLink: string;
  icon?: string;
}

export default function ProductSection({
  title,
  description,
  products,
  viewAllLink,
  icon = '📦'
}: ProductSectionProps) {

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {icon} {title}
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <Link
          href={viewAllLink}
          className="hidden sm:flex items-center text-sm md:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Alle ansehen
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center dark:bg-zinc-800">
          <p className="text-gray-600 dark:text-gray-400">Keine Produkte verfügbar</p>
        </div>
      ) : (
        <>
          {/* Desktop Horizontal Scroll - consistent across all screen sizes */}
          <div className="w-full">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {products.map((product) => (
                <div key={product.id} className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Mobile "View All" Button */}
            <div className="mt-4 text-center">
              <Link
                href={viewAllLink}
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Alle {title} ansehen
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
