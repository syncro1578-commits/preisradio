'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Brand } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MarkenPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);

      // Récupérer tous les produits en utilisant la pagination
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 500; // Load 500 products per request

      while (hasMore) {
        const response = await api.getProductsFromBothRetailers({
          page: page,
          page_size: pageSize,
        });

        const products = response?.results || [];
        allProducts = allProducts.concat(products);

        // Check if there are more pages
        hasMore = response?.next !== null && products.length === pageSize;
        page++;
      }

      const products = allProducts;

      // Grouper les produits par marque
      const brandMap = new Map<string, Product[]>();

      products.forEach((product) => {
        if (product.brand) {
          const brandName = product.brand;
          if (!brandMap.has(brandName)) {
            brandMap.set(brandName, []);
          }
          brandMap.get(brandName)?.push(product);
        }
      });

      // Créer les objets Brand avec les statistiques
      const brandsArray: Brand[] = Array.from(brandMap.entries()).map(([name, products]) => {
        const retailers = Array.from(new Set(products.map(p => p.retailer).filter(Boolean)));
        const categories = Array.from(new Set(products.map(p => p.category)));
        const prices = products.map(p => p.price);

        return {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          productsCount: products.length,
          retailers: retailers as string[],
          categories,
          averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        };
      });

      // Trier par nombre de produits
      brandsArray.sort((a, b) => b.productsCount - a.productsCount);

      setBrands(brandsArray);
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les marques par recherche
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors group"
          >
            <svg
              className="h-4 w-4 group-hover:-translate-x-1 transition-transform"
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
            Zurück zur Startseite
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {filteredBrands.length} {filteredBrands.length === 1 ? 'Marke' : 'Marken'} gefunden
            </span>
          </div>

          <h1 className="mb-3 md:mb-4 text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Alle Marken entdecken
          </h1>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400 px-4">
            Durchsuchen Sie Produkte von führenden Marken bei Saturn, MediaMarkt, Otto und Kaufland
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 md:mb-12">
          <div className="mx-auto max-w-2xl px-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder="Marke suchen... (z.B. Samsung, Apple, LG)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full rounded-xl border-2 border-gray-200 bg-white pl-12 pr-4 py-3 md:py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-base font-medium text-gray-600 dark:text-gray-400">
                Marken werden geladen...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Dies kann einen Moment dauern
              </p>
            </div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-12 md:p-16 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Keine Marken gefunden
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Versuchen Sie eine andere Suchanfrage oder durchsuchen Sie alle verfügbaren Marken.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Alle Marken anzeigen
            </button>
          </div>
        ) : (
          <>
            {/* Brands Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredBrands.map((brand, index) => {
                // Gradient variations
                const gradients = [
                  'from-blue-600 to-purple-600',
                  'from-purple-600 to-pink-600',
                  'from-green-600 to-teal-600',
                  'from-orange-600 to-red-600',
                  'from-indigo-600 to-blue-600',
                  'from-pink-600 to-rose-600',
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link
                    key={brand.slug}
                    href={`/marken/${encodeURIComponent(brand.slug)}`}
                    className="group relative overflow-hidden rounded-2xl bg-white p-5 md:p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-transparent"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                    {/* Top Badge */}
                    {index < 3 && (
                      <div className="absolute right-3 top-3 z-10">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r ${gradient} text-xs font-black text-white shadow-lg ring-2 ring-white dark:ring-zinc-900`}>
                          {index + 1}
                        </div>
                      </div>
                    )}

                    {/* Brand Name Box */}
                    <div className="relative mb-4 md:mb-5">
                      <div className={`flex h-20 md:h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-4 dark:from-zinc-800 dark:to-zinc-900 shadow-inner group-hover:shadow-lg transition-shadow border border-gray-200 dark:border-zinc-700`}>
                        <span className={`text-base md:text-lg lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient} text-center line-clamp-2 group-hover:scale-110 transition-transform`}>
                          {brand.name}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="relative mb-3 md:mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                          {brand.productsCount}
                        </span>
                      </div>
                      {brand.retailers.length > 0 && (
                        <div className="flex items-center gap-1">
                          {brand.retailers.slice(0, 3).map((retailer, idx) => (
                            <div
                              key={idx}
                              className={`h-2 w-2 rounded-full ${
                                retailer === 'saturn' ? 'bg-red-500' :
                                retailer === 'mediamarkt' ? 'bg-red-600' :
                                retailer === 'otto' ? 'bg-blue-500' :
                                retailer === 'kaufland' ? 'bg-green-600' :
                                'bg-gray-400'
                              }`}
                              title={retailer}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Categories Pills */}
                    <div className="relative flex flex-wrap gap-1 mb-3">
                      {brand.categories.slice(0, 2).map((category, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {category.length > 10 ? category.substring(0, 10) + '...' : category}
                        </span>
                      ))}
                      {brand.categories.length > 2 && (
                        <span className="inline-block rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{brand.categories.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Hover Arrow */}
                    <div className="relative flex items-center justify-center text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-200 dark:border-zinc-800">
                      <span>Produkte ansehen</span>
                      <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
