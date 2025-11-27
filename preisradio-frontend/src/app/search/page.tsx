'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  });
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

  useEffect(() => {
    loadProducts();
  }, [query, selectedCategory, selectedRetailer]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getProductsFromBothRetailers({
        search: searchQuery || query || undefined,
        category: selectedCategory || undefined,
        page_size: 200,
      });

      let results = response?.results || [];

      // Filtrer par retailer si selectionne
      if (selectedRetailer) {
        results = results.filter(p => p.retailer === selectedRetailer);
      }

      // Filtrer par plage de prix
      if (priceRange.min) {
        results = results.filter(p => p.price >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        results = results.filter(p => p.price <= parseFloat(priceRange.max));
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
    } catch (err) {
      setError('Fehler beim Laden der Suchergebnisse');
      console.error('Error loading search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleApplyFilters = () => {
    loadProducts();
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedRetailer('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
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
                  onClick={loadProducts}
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
                    {products.length} {products.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
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
