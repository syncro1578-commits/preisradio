'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import AdSenseDisplay from '@/components/AdSenseDisplay';
import AdSenseInFeed from '@/components/AdSenseInFeed';
import AdSenseMultiplex from '@/components/AdSenseMultiplex';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const retailerParam = searchParams.get('retailer') || '';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const discountParam = searchParams.get('discount') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const loadCategoriesAndBrands = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.getCategories({ page_size: 200 }),
        api.getBrands({ page_size: 200 })
      ]);

      setCategories(categoriesRes.results || []);
      setBrands(brandsRes.results || []);
    } catch (err) {
      console.error('Error loading categories and brands:', err);
    }
  }, []);

  const loadProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(page);

      // Build API params - backend now handles filtering and sorting
      const params: any = {
        page: page,
        page_size: pageSize,
      };

      if (query) params.search = query;
      if (categoryParam) params.category = categoryParam;
      if (brandParam) params.brand = brandParam;
      if (retailerParam) params.retailer = retailerParam;
      if (minPriceParam) params.min_price = minPriceParam;
      if (maxPriceParam) params.max_price = maxPriceParam;
      if (sortParam) params.sort = sortParam;

      const response = await api.getProductsFromBothRetailers(params);

      let results = response?.results || [];
      let count = response?.count || 0;

      // Discount filter still needs to be client-side (backend doesn't support it yet)
      // When discount filter is active, we need to adjust totalCount
      if (discountParam) {
        const minDiscount = parseFloat(discountParam);
        results = results.filter(p => {
          if (!p.discount) return false;
          const discountValue = parseFloat(p.discount.replace('%', ''));
          return discountValue >= minDiscount;
        });
        // Important: Use filtered results count, not API count
        // This disables true pagination when discount filter is active
        count = results.length;
      }

      setProducts(results);
      setTotalCount(count);
    } catch (err) {
      setError('Fehler beim Laden der Suchergebnisse');
      console.error('Error loading search results:', err);
    } finally {
      setLoading(false);
    }
  }, [query, categoryParam, brandParam, retailerParam, minPriceParam, maxPriceParam, sortParam, discountParam, pageSize]);

  // Load categories and brands once on mount
  useEffect(() => {
    loadCategoriesAndBrands();
  }, [loadCategoriesAndBrands]);

  // Synchronize state with URL params
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1);
  }, [loadProducts]);

  // Update document title, canonical URL and JSON-LD
  useEffect(() => {
    if (query) {
      document.title = `Suchergebnisse für "${query}" | Preisradio`;
    } else {
      document.title = 'Suche | Preisradio';
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`;

    // Add JSON-LD for search results
    let script = document.querySelector('#search-jsonld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'search-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      name: query ? `Suchergebnisse für ${query}` : 'Produktsuche',
      url: `${baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 10).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.title,
            url: `${baseUrl}/product/${product.id}`,
            image: product.image,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: product.currency
            }
          }
        }))
      }
    };

    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const scriptEl = document.querySelector('#search-jsonld');
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, [query, products]);

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`/search?${newParams.toString()}`, { scroll: false });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    updateURL({ [filterName]: value });
  };

  const handleResetFilters = () => {
    router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`, { scroll: false });
  };

  // Count active filters
  const activeFiltersCount = [categoryParam, brandParam, retailerParam, minPriceParam, maxPriceParam, discountParam].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zurueck zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Suchergebnisse
          </h1>
          {query && (
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Suche nach: <span className="font-semibold">{query}</span>
            </p>
          )}
        </div>

        {/* AdSense Display - After Header */}
        <AdSenseDisplay
          adSlot="1502312871"
          className="mb-8"
        />

        {/* Mobile Filters Button - Fixed at bottom */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="fixed bottom-4 left-4 right-4 lg:hidden z-40 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-600">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Drawer Panel */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transform transition-transform animate-slideUp shadow-2xl">
              {/* Drawer content will be here */}
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Filtres
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filter content */}
                <SearchFilters
                  sortParam={sortParam}
                  categoryParam={categoryParam}
                  brandParam={brandParam}
                  retailerParam={retailerParam}
                  minPriceParam={minPriceParam}
                  maxPriceParam={maxPriceParam}
                  discountParam={discountParam}
                  categories={categories}
                  brands={brands}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  isMobile={true}
                  showResetButton={false}
                />

                {/* Footer with Apply button */}
                <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 pt-6 pb-4 border-t border-gray-200 dark:border-zinc-800 flex gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Zurücksetzen
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-[2] rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    {totalCount} {totalCount === 1 ? 'Ergebnis' : 'Ergebnisse'} anzeigen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Filter
                </h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Zuruecksetzen
                </button>
              </div>

              <SearchFilters
                sortParam={sortParam}
                categoryParam={categoryParam}
                brandParam={brandParam}
                retailerParam={retailerParam}
                minPriceParam={minPriceParam}
                maxPriceParam={maxPriceParam}
                discountParam={discountParam}
                categories={categories}
                brands={brands}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                isMobile={false}
                showResetButton={false}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Suche laeuft...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 p-8 text-center dark:bg-red-950">
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
                  {error}
                </h3>
                <button
                  onClick={() => loadProducts()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Erneut versuchen
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-12 text-center dark:bg-zinc-900">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Keine Ergebnisse gefunden
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Versuchen Sie eine andere Suchanfrage oder passen Sie die Filter an.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCount} {totalCount === 1 ? 'Ergebnis' : 'Ergebnisse'} insgesamt
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <React.Fragment key={product.id}>
                      <ProductCard product={product} />
                      {/* InFeed Ad every 6 products */}
                      {(index + 1) % 6 === 0 && index < products.length - 1 && (
                        <div className="col-span-2 lg:col-span-3">
                          <AdSenseInFeed
                            adSlot="6399181253"
                            layoutKey="-fb+5w+4e-db+86"
                            className="my-4"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Pagination
                    Note: When discount filter is active, pagination shows current page results only
                    because discount filtering happens client-side after API call.
                    To enable full pagination with discount, backend support would be needed.
                */}
                {totalCount > pageSize && !discountParam && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => loadProducts(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
                    >
                      ← Zurueck
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, index) => {
                        const pageNum = index + 1;
                        // Show first 3 pages, last 3 pages, and pages around current
                        const isVisible =
                          pageNum <= 3 ||
                          pageNum > Math.ceil(totalCount / pageSize) - 3 ||
                          Math.abs(pageNum - currentPage) <= 1;

                        if (!isVisible) {
                          if (index === 3) {
                            return (
                              <span key="dots" className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => loadProducts(pageNum)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => loadProducts(currentPage + 1)}
                      disabled={currentPage * pageSize >= totalCount}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
                    >
                      Weiter →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* AdSense Multiplex - Before Footer */}
        <AdSenseMultiplex className="mt-12" />
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
