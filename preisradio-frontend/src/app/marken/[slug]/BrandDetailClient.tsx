'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

interface BrandDetailClientProps {
  slug: string;
  initialProducts: Product[];
  initialBrandName: string;
}

export default function BrandDetailClient({
  slug,
  initialProducts,
  initialBrandName
}: BrandDetailClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [brandName, setBrandName] = useState<string>(initialBrandName);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

  // Only fetch if no initial data
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadBrandProducts();
    }
  }, [slug, initialProducts]);

  const loadBrandProducts = async () => {
    try {
      setLoading(true);

      const decodedSlug = decodeURIComponent(slug);

      // First, get all brands to find the exact brand name
      const brandsResponse = await api.getBrands({ page_size: 1000 });
      const allBrands = brandsResponse.results || [];

      // Find the matching brand by slug
      const matchingBrand = allBrands.find(b => {
        const brandSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return brandSlug === normalizedSlug;
      });

      if (matchingBrand) {
        setBrandName(matchingBrand);

        // Fetch products using the exact brand name via brand parameter
        const response = await api.getProductsFromBothRetailers({
          brand: matchingBrand,
          page_size: 100,
        });

        setProducts(response?.results || []);
      } else {
        // Fallback to formatted slug
        setBrandName(decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).toLowerCase());
      }
    } catch (err) {
      console.error('Error loading brand products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les produits
  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedRetailer && product.retailer !== selectedRetailer) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') {
      const dateA = a.scraped_at ? new Date(a.scraped_at).getTime() : 0;
      const dateB = b.scraped_at ? new Date(b.scraped_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Extraire les catégories et retailers uniques
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const retailers = Array.from(new Set(products.map((p) => p.retailer).filter(Boolean))).sort();

  // Calculer les stats
  const stats = {
    totalProducts: products.length,
    avgPrice: products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0,
    minPrice: products.length > 0 ? Math.min(...products.map(p => p.price)) : 0,
    maxPrice: products.length > 0 ? Math.max(...products.map(p => p.price)) : 0,
    categories: categories.length,
    retailers: retailers.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumbs */}
        {brandName && (
          <Breadcrumbs
            items={[
              { label: 'Marken', href: '/marken' },
              { label: brandName }
            ]}
          />
        )}

        {/* Hero Header */}
        <div className="mb-6 md:mb-10 mt-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 border border-white/30">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-xs md:text-sm font-bold text-white">
                  Premium Marke
                </span>
              </div>

              <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg">
                {brandName || 'Marke'}
              </h1>
              <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl">
                Entdecken Sie alle Produkte von {brandName} bei unseren Partner-Händlern und finden Sie die besten Angebote
              </p>

              {/* Quick Actions */}
              {products.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSortBy('price_asc')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Günstigste zuerst
                  </button>
                  <button
                    onClick={() => setSortBy('newest')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Neueste zuerst
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="mt-6 text-base font-medium text-gray-600 dark:text-gray-400">
                Produkte werden geladen...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Bitte warten Sie einen Moment
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-12 md:p-16 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center mb-6">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Keine Produkte gefunden
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Diese Marke hat derzeit keine Produkte in unserer Datenbank. Schauen Sie später wieder vorbei oder durchsuchen Sie andere Marken.
            </p>
            <Link
              href="/marken"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Alle Marken durchsuchen
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards - Responsive Grid */}
            <div className="mb-8 md:mb-12 grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Produkte
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  {stats.totalProducts}
                </p>
              </div>

              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Kategorien
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                  {stats.categories}
                </p>
              </div>

              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Händler
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                  {stats.retailers}
                </p>
              </div>

              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Ø Preis
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
                  {stats.avgPrice.toFixed(0)}€
                </p>
              </div>

              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Minimum
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  {stats.minPrice.toFixed(0)}€
                </p>
              </div>

              <div className="group rounded-2xl bg-white p-4 md:p-5 shadow-lg dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Maximum
                  </p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                  {stats.maxPrice.toFixed(0)}€
                </p>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* Sidebar Filters */}
              <aside className="mb-6 lg:col-span-1 lg:mb-0">
                <div className="rounded-2xl bg-white p-5 md:p-6 shadow-xl dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 sticky top-20">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Filter
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedRetailer('');
                        setSortBy('newest');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Zurücksetzen
                    </button>
                  </div>

                  {/* Sort */}
                  <div className="mb-5 pb-5 border-b border-gray-200 dark:border-zinc-800">
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sortieren nach
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 font-medium focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all cursor-pointer"
                    >
                      <option value="newest">⏰ Neueste zuerst</option>
                      <option value="price_asc">💰 Preis: Niedrig → Hoch</option>
                      <option value="price_desc">💎 Preis: Hoch → Niedrig</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  {categories.length > 1 && (
                    <div className="mb-5 pb-5 border-b border-gray-200 dark:border-zinc-800">
                      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Kategorie
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 font-medium focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all cursor-pointer"
                      >
                        <option value="">📦 Alle Kategorien</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Retailer Filter */}
                  {retailers.length > 1 && (
                    <div className="mb-0">
                      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Händler
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                          <input
                            type="radio"
                            name="retailer"
                            value=""
                            checked={selectedRetailer === ''}
                            onChange={(e) => setSelectedRetailer(e.target.value)}
                            className="h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            Alle Händler
                          </span>
                        </label>
                        {retailers.map((retailer) => {
                          const retailerNames: Record<string, string> = {
                            'saturn': 'Saturn',
                            'mediamarkt': 'MediaMarkt',
                            'otto': 'Otto',
                            'kaufland': 'Kaufland'
                          };
                          const retailerColors: Record<string, string> = {
                            'saturn': 'red-500',
                            'mediamarkt': 'red-600',
                            'otto': 'blue-500',
                            'kaufland': 'green-600'
                          };
                          const displayName = retailer ? (retailerNames[retailer] || retailer) : retailer;
                          const color = retailer ? (retailerColors[retailer] || 'gray-400') : 'gray-400';
                          const hoverBg = retailer === 'saturn' || retailer === 'mediamarkt' ? 'red-50 dark:hover:bg-red-900/10' :
                                         retailer === 'otto' ? 'blue-50 dark:hover:bg-blue-900/10' :
                                         retailer === 'kaufland' ? 'green-50 dark:hover:bg-green-900/10' :
                                         'gray-50 dark:hover:bg-zinc-800/50';
                          return (
                            <label key={retailer} className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-${hoverBg} transition-colors cursor-pointer group`}>
                              <input
                                type="radio"
                                name="retailer"
                                value={retailer}
                                checked={selectedRetailer === retailer}
                                onChange={(e) => setSelectedRetailer(e.target.value)}
                                className="h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                              />
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full bg-${color}`}></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                  {displayName}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'} gefunden
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Rasteransicht</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
