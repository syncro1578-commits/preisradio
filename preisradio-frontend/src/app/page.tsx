'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Charger les produits
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      });

      setProducts(response?.results || []);
    } catch (err) {
      setError('Fehler beim Laden der Produkte');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  // Extraire les catégories uniques des produits
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
            Preise vergleichen & Geld sparen
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Finden Sie die besten Angebote für Elektronik, Haushaltsgeräte und mehr.
            Vergleichen Sie Preise von Top-Händlern in Deutschland.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Produkt suchen (z.B. iPhone, Samsung TV, MacBook)..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-6 py-4 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-8 py-4 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Suchen
              </button>
            </div>
          </form>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
              }`}
            >
              Alle Kategorien
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Produkte</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {products.length}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Verfügbar zum Vergleich
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kategorien</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Verschiedene Bereiche
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900">
                <svg
                  className="h-8 w-8 text-purple-600 dark:text-purple-300"
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
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Preise</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {products.reduce((acc, p) => acc + (p.prices?.length || 0), 0)}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Aktuell verglichen
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Produkte werden geladen...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-8 text-center dark:bg-red-950">
            <svg
              className="mx-auto h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-red-900 dark:text-red-100">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Produkte gefunden
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Versuchen Sie, Ihre Suchkriterien anzupassen oder fügen Sie Produkte zur Datenbank hinzu.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory ? `${selectedCategory}` : 'Alle Produkte'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {products.length} {products.length === 1 ? 'Produkt' : 'Produkte'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Popular Categories Section */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Beliebte Kategorien
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: 'Smartphones', icon: '📱', count: products.filter(p => p.category === 'Smartphones').length },
              { name: 'Laptops', icon: '💻', count: products.filter(p => p.category === 'Ordinateurs portables').length },
              { name: 'Audio', icon: '🎧', count: products.filter(p => p.category === 'Audio').length },
              { name: 'Fernseher', icon: '📺', count: products.filter(p => p.category === 'Télévisions').length },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/kategorien`}
                className="group rounded-xl bg-white p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-zinc-900"
              >
                <div className="mb-3 text-4xl">{cat.icon}</div>
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cat.count} Produkte
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Warum PrixRadio?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Schneller Vergleich
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vergleichen Sie Preise von mehreren Händlern in Sekunden
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Geld sparen
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Finden Sie immer den besten Preis und sparen Sie bares Geld
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <svg
                  className="h-8 w-8 text-purple-600 dark:text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Vertrauenswürdig
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nur seriöse und bekannte Händler in unserem Vergleich
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
