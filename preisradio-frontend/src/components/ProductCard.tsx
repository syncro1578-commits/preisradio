import Link from 'next/link';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Trouver le prix le plus bas
  const lowestPrice = product.prices && product.prices.length > 0
    ? Math.min(...product.prices.map(p => p.price))
    : null;

  // Compter les détaillants disponibles
  const availableRetailers = product.prices
    ? product.prices.filter(p => p.stock_status === 'in_stock').length
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-600">
        {/* Image du produit */}
        <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-800">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
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

        {/* Catégorie */}
        <div className="mb-2">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {product.category}
          </span>
        </div>

        {/* Nom du produit */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
          {product.name}
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
            {lowestPrice !== null ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ab
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {lowestPrice.toFixed(2)} €
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Preis nicht verfügbar
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {availableRetailers} {availableRetailers > 1 ? 'Händler' : 'Händler'}
            </p>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Vergleichen →
            </p>
          </div>
        </div>

        {/* Badge "Neu" si produit récent */}
        {(() => {
          const createdDate = new Date(product.created_at);
          const daysSinceCreation = Math.floor(
            (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceCreation < 7 ? (
            <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
              Neu
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
