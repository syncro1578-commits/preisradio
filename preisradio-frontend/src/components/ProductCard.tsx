import Link from 'next/link';
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
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600">
        {/* Image du produit */}
        <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-800">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-32 sm:h-40 md:h-48 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg
                className="h-20 w-20"
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

        {/* Catégorie & Retailer */}
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {product.category}
          </span>
          <span className={`inline-block rounded-full ${retailerInfo.bgColor} px-3 py-1 text-xs font-medium ${retailerInfo.textColor}`}>
            {retailerInfo.name}
          </span>
        </div>

        {/* Nom du produit */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
          {product.title}
        </h3>

        {/* Description courte */}
        {product.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        )}

        {/* Prix et disponibilité */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Preis
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentPrice.toFixed(2)} {product.currency}
              </p>
              {hasDiscount && oldPrice && (
                <p className="text-sm text-gray-500 line-through dark:text-gray-400">
                  {oldPrice.toFixed(2)} {product.currency}
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
              Details ansehen →
            </p>
          </div>
        </div>

        {/* Badge de réduction */}
        {hasDiscount && product.discount && (
          <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
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
            <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
              Neu
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
