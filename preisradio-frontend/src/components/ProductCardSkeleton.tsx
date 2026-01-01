export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:bg-zinc-900 dark:border-zinc-800 animate-pulse">
      {/* Image skeleton */}
      <div className="relative mb-2 sm:mb-3 aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-zinc-800" />

      {/* Retailer logo skeleton */}
      <div className="mb-1 sm:mb-2 h-6 sm:h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />

      {/* Title skeleton */}
      <div className="mb-2 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
      </div>

      {/* Price skeleton */}
      <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-baseline justify-between">
          <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
