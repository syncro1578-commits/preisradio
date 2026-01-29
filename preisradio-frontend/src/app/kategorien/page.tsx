'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export default function KategorienPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  useEffect(() => {
    loadCategories();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    // Add JSON-LD for categories
    let script = document.querySelector('#categories-jsonld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'categories-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Produktkategorien',
      description: 'Alle Produktkategorien von Saturn, MediaMarkt und Otto',
      url: `${baseUrl}/kategorien`,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Kategorien',
            item: `${baseUrl}/kategorien`
          }
        ]
      }
    };

    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const scriptEl = document.querySelector('#categories-jsonld');
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.getCategories({
        search: searchQuery,
        page: currentPage,
        page_size: itemsPerPage,
      });

      setCategories(response.results);
      setTotalPages(response.total_pages);
      setTotalCount(response.count);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  function getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Laptops': '💻',
      'Gaming': '🎮',
      'Handys': '📱',
      'Kopfhörer': '🎧',
      'Fernseher': '📺',
      'Tablets': '📱',
      'Smartwatches': '⌚',
      'Kameras': '📷',
      'Waschmaschinen': '🧺',
      'Kühlschränke': '❄️',
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    return '📦';
  }

  function getCategoryDescription(category: string): string {
    return 'Entdecken Sie unsere Produkte in dieser Kategorie';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {totalCount} Kategorien verfügbar
            </span>
          </div>

          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Alle Produktkategorien
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4">
            Finden Sie die besten Angebote in unseren {totalCount} Kategorien von Saturn, MediaMarkt, Otto und Kaufland
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-6 sm:mt-8 max-w-2xl px-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Kategorien durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full rounded-xl border-2 border-gray-200 bg-white pl-12 pr-4 py-3 sm:py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Kategorien werden geladen...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category, index) => {
                const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const icon = getCategoryIcon(category.name);

                // Gradient variations for visual interest
                const gradients = [
                  'from-blue-500 via-blue-600 to-purple-600',
                  'from-purple-500 via-pink-500 to-red-500',
                  'from-green-500 via-teal-500 to-blue-500',
                  'from-orange-500 via-red-500 to-pink-500',
                  'from-indigo-500 via-purple-500 to-pink-500',
                  'from-cyan-500 via-blue-500 to-indigo-500',
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link
                    key={category.name}
                    href={`/kategorien/${slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-transparent"
                  >
                    {/* Animated gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                    {/* Large background icon */}
                    <div className="absolute -right-4 -top-4 text-7xl sm:text-8xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 group-hover:scale-110 transform">
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="relative">
                      {/* Icon Badge */}
                      <div className={`mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl sm:text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                      </div>

                      {/* Category Name */}
                      <h3 className="mb-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
                        {category.name}
                      </h3>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {category.count}
                        </span>

                        {/* Retailer indicators */}
                        <div className="flex gap-1">
                          {category.saturn_count && category.saturn_count > 0 && (
                            <div className="h-2 w-2 rounded-full bg-red-500" title="Saturn"></div>
                          )}
                          {category.mediamarkt_count && category.mediamarkt_count > 0 && (
                            <div className="h-2 w-2 rounded-full bg-red-600" title="MediaMarkt"></div>
                          )}
                          {category.otto_count && category.otto_count > 0 && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" title="Otto"></div>
                          )}
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div className="mt-3 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Produkte ansehen</span>
                        <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Zurück</span>
                </button>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm sm:text-base">
                  <span>{currentPage}</span>
                  <span className="opacity-70">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                >
                  <span className="hidden sm:inline">Weiter</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}