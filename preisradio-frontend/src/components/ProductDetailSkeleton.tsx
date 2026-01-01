export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumbs skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-32" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-40" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="aspect-square w-full bg-gray-200 dark:bg-zinc-800 rounded-2xl" />

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-4/5" />
          </div>

          {/* Badges skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full" />
          </div>

          {/* Price skeleton */}
          <div className="rounded-2xl bg-gray-100 dark:bg-zinc-800 p-6">
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded w-32 mb-4" />
            <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
          </div>

          {/* Related links skeleton */}
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-10 w-40 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-10 w-36 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Similar products skeleton */}
      <div className="mt-12">
        <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
