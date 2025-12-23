import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Prix actuel
  const currentPrice = product.price;
  const oldPrice = product.old_price;
  const hasDiscount = oldPrice && oldPrice > currentPrice;

  // Déterminer le nom et les couleurs du retailer
  const getRetailerInfo = (retailer?: string) => {
    if (retailer === 'saturn') {
      return { name: 'Saturn', bgColor: 'bg-red-600', textColor: 'text-white' };
    } else if (retailer === 'mediamarkt') {
      return { name: 'MediaMarkt', bgColor: 'bg-red-700', textColor: 'text-white' };
    } else if (retailer === 'otto') {
      return { name: 'Otto', bgColor: 'bg-blue-600', textColor: 'text-white' };
    }
    return { name: 'Händler', bgColor: 'bg-gray-600', textColor: 'text-white' };
  };

  const retailerInfo = getRetailerInfo(product.retailer);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-3 sm:p-4 transition-all hover:shadow-xl hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600">
        {/* Image du produit - Taille adaptée pour mobile */}
        <div className="relative mb-2 sm:mb-3 aspect-square w-full overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-800">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-1 sm:p-2 transition-transform duration-300 group-hover:scale-105"
              unoptimized={product.image.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg
                className="h-12 w-12 sm:h-16 sm:w-16"
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

        {/* Retailer badge only - optimized for mobile */}
        <div className="mb-1 sm:mb-2">
          <span className={`inline-block rounded-full ${retailerInfo.bgColor} px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${retailerInfo.textColor}`}>
            {retailerInfo.name}
          </span>
        </div>

        {/* Nom du produit - optimized for mobile */}
        <h3 className="mb-2 line-clamp-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white min-h-[2rem] sm:min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Prix - simplified for mobile */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {currentPrice.toFixed(2)}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{product.currency}</p>
            </div>
            {hasDiscount && oldPrice && (
              <p className="text-[10px] sm:text-xs text-gray-500 line-through dark:text-gray-400">
                {oldPrice.toFixed(2)}€
              </p>
            )}
          </div>
        </div>

        {/* Badge de réduction */}
        {hasDiscount && product.discount && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow-md">
            {product.discount}
          </div>
        )}

        {/* Badge "Neu" si produit récent */}
        {!hasDiscount && product.scraped_at && (() => {
          const scrapedDate = new Date(product.scraped_at);
          const daysSinceScraping = Math.floor(
            (Date.now() - scrapedDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceScraping < 7 ? (
            <div className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow-md">
              Neu
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
