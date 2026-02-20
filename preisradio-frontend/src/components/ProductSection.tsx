'use client';

import { useRef } from 'react';
import ProductCard from './ProductCard';
import AdSenseInFeed from './AdSenseInFeed';
import { Product } from '@/lib/types';

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  viewAllLink?: string;
  icon?: string;
}

export default function ProductSection({
  title,
  description,
  products,
  icon = '📦'
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {icon} {title}
        </h2>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 md:p-12 text-center dark:bg-zinc-800">
          <p className="text-gray-600 dark:text-gray-400">Keine Produkte verfügbar</p>
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
            aria-label="Scroll left"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
            aria-label="Scroll right"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {products.map((product, index) => (
              <>
                <div
                  key={product.id}
                  className="flex-none w-[150px] sm:w-[280px] md:w-[240px] lg:w-[260px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
                {/* Insert In-Feed ad after every 8th product */}
                {(index + 1) % 8 === 0 && index < products.length - 1 && (
                  <div
                    key={`ad-${index}`}
                    className="flex-none w-[150px] sm:w-[280px] md:w-[240px] lg:w-[260px] snap-start"
                  >
                    <AdSenseInFeed
                      adSlot="6399181253"
                      layoutKey="-d4+0+1r-2b-1u"
                      className="h-full"
                    />
                  </div>
                )}
              </>
            ))}
          </div>

        </div>
      )}
    </section>
  );
}
