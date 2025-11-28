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
  if (products.length === 0) return null;

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

      {/* Desktop Grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-[280px] snap-start">
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
    </section>
  );
}
