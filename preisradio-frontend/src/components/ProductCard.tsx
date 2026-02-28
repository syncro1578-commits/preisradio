import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { getRetailerInfo } from '@/lib/retailerUtils';

interface ProductCardProps {
  product: Product;
  isBestPrice?: boolean;
}

export default function ProductCard({ product, isBestPrice }: ProductCardProps) {
  const currentPrice = product.price || 0;
  const oldPrice = product.old_price;
  const hasDiscount = oldPrice && oldPrice > currentPrice && currentPrice > 0;

  const retailerInfo = getRetailerInfo(product.retailer);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white p-1.5 sm:p-3 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600 animate-fadeIn">
        {/* Product image — smaller on desktop */}
        <div className="relative mb-1 sm:mb-2 aspect-[4/3] w-full overflow-hidden rounded-md sm:rounded-lg bg-white dark:bg-zinc-800">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title || 'Product'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-0.5 sm:p-2 mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
              unoptimized={product.image?.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg
                className="h-8 w-8 sm:h-12 sm:w-12"
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

        {/* Retailer logo */}
        <div className="mb-0.5 sm:mb-1 h-3 sm:h-5">
          {retailerInfo.logo ? (
            <Image
              src={retailerInfo.logo}
              alt={retailerInfo.name}
              width={80}
              height={24}
              className="h-full w-auto object-contain"
            />
          ) : (
            <span className="inline-block rounded-full bg-gray-600 px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[10px] font-medium text-white">
              {retailerInfo.name}
            </span>
          )}
        </div>

        {/* Product title */}
        <h3 className="mb-0.5 sm:mb-1 line-clamp-3 text-[9px] sm:text-[11px] font-bold text-gray-900 dark:text-white leading-snug">
          {product.title || 'Produkt'}
        </h3>

        {/* SKU / Article number */}
        {product.sku && (
          <p className="mb-1 text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 truncate">
            Art.-Nr.: {product.sku}
          </p>
        )}

        {/* Price section */}
        <div className="mt-auto pt-1 sm:pt-2 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <p className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {currentPrice.toFixed(2)}€
            </p>
            {hasDiscount && oldPrice && (
              <p className="text-[8px] sm:text-xs text-gray-400 line-through dark:text-gray-500">
                {oldPrice.toFixed(2)}€
              </p>
            )}
          </div>
        </div>

        {/* Badge "Meilleur Prix" */}
        {isBestPrice && (
          <div className="absolute left-1 top-1 sm:left-2 sm:top-2 rounded sm:rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-1 sm:px-2.5 py-0.5 shadow-lg animate-bounce-subtle">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <svg className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[7px] sm:text-[10px] font-bold text-white">Bester Preis</span>
            </div>
          </div>
        )}

        {/* Discount badge */}
        {!isBestPrice && product.discount && (
          <div className="absolute right-1 top-1 sm:right-2 sm:top-2 rounded-full bg-red-500 px-1 sm:px-2 py-0.5 text-[8px] sm:text-xs font-semibold text-white shadow-md">
            {product.discount}
          </div>
        )}

        {/* "Neu" badge */}
        {!isBestPrice && !product.discount && product.scraped_at && (() => {
          const scrapedDate = new Date(product.scraped_at);
          const daysSinceScraping = Math.floor(
            (Date.now() - scrapedDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceScraping < 7 ? (
            <div className="absolute right-1 top-1 sm:right-2 sm:top-2 rounded-full bg-green-500 px-1 sm:px-2 py-0.5 text-[8px] sm:text-xs font-semibold text-white shadow-md">
              Neu
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
