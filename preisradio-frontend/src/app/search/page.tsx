'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const retailerParam = searchParams.get('retailer') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam);
  const [selectedRetailer, setSelectedRetailer] = useState<string>(retailerParam);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  });
  const [selectedDiscount, setSelectedDiscount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1);
  }, [query, categoryParam, brandParam, retailerParam, selectedCategory, selectedBrand, selectedRetailer]);

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

  const loadProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(page);

      const response = await api.getProductsFromBothRetailers({
        search: searchQuery || query || undefined,
        category: selectedCategory || categoryParam || undefined,
        brand: selectedBrand || brandParam || undefined,
        retailer: selectedRetailer || retailerParam || undefined, // Pass retailer to API
        page: page,
        page_size: pageSize,
      });

      let results = response?.results || [];

      // Filtrer par plage de prix (client-side)
      if (priceRange.min) {
        results = results.filter(p => p.price >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        results = results.filter(p => p.price <= parseFloat(priceRange.max));
      }

      // Filtrer par rabatt minimum (client-side)
      if (selectedDiscount) {
        const minDiscount = parseFloat(selectedDiscount);
        results = results.filter(p => {
          if (!p.discount) return false;
          const discountValue = parseFloat(p.discount.replace('%', ''));
          return discountValue >= minDiscount;
        });
      }

      // Trier
      if (sortBy === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'newest') {
        results.sort((a, b) => {
          const dateA = a.scraped_at ? new Date(a.scraped_at).getTime() : 0;
          const dateB = b.scraped_at ? new Date(b.scraped_at).getTime() : 0;
          return dateB - dateA;
        });
      }

      setProducts(results);
      setTotalCount(response?.count || 0);
    } catch (err) {
      setError('Fehler beim Laden der Suchergebnisse');
      console.error('Error loading search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadProducts(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedRetailer('');
    setPriceRange({ min: '', max: '' });
    setSelectedDiscount('');
    setSortBy('newest');
    setCurrentPage(1);
    loadProducts(1);
  };

  // Extraire les categories uniques
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  // Extraire les marques uniques
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();

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

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Produkt suchen..."
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Suchen
              </button>
            </div>
          </form>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="mb-8 lg:col-span-1 lg:mb-0">
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

              {/* Sort */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sortieren nach
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setTimeout(() => loadProducts(), 0);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="newest">Neueste</option>
                  <option value="price_asc">Preis aufsteigend</option>
                  <option value="price_desc">Preis absteigend</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.slice(0, 20).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marke
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="">Alle Marken</option>
                    {brands.slice(0, 20).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Retailer Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Haendler
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retailer"
                      value=""
                      checked={selectedRetailer === ''}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alle</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retailer"
                      value="saturn"
                      checked={selectedRetailer === 'saturn'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Saturn</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retailer"
                      value="mediamarkt"
                      checked={selectedRetailer === 'mediamarkt'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">MediaMarkt</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="retailer"
                      value="otto"
                      checked={selectedRetailer === 'otto'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Otto</span>
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preisspanne (EUR)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Discount Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rabatt mindestens
                </label>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Alle Produkte</option>
                  <option value="5">5% oder mehr</option>
                  <option value="10">10% oder mehr</option>
                  <option value="15">15% oder mehr</option>
                  <option value="20">20% oder mehr</option>
                  <option value="30">30% oder mehr</option>
                  <option value="50">50% oder mehr</option>
                </select>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Filter anwenden
              </button>
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > pageSize && (
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
