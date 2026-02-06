'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

interface CategoryDetailClientProps {
  slug: string;
  initialProducts: Product[];
  initialCategoryName: string;
  totalProductsCount?: number;
}

export default function CategoryDetailClient({
  slug,
  initialProducts,
  initialCategoryName,
  totalProductsCount = 0
}: CategoryDetailClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categoryName, setCategoryName] = useState<string>(initialCategoryName);
  const [totalCount, setTotalCount] = useState<number>(totalProductsCount);
  const [loading, setLoading] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  });
  const [selectedDiscount, setSelectedDiscount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

  // Only fetch if no initial data
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadCategoryProducts();
    }
  }, [slug, initialProducts]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      const decodedSlug = decodeURIComponent(slug);

      // First, get all categories to find the exact category name
      const categoriesResponse = await api.getCategories({ page_size: 1000 });
      const allCategories = categoriesResponse.results || [];

      // Find the matching category by slug
      const matchingCategory = allCategories.find(cat => {
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return catSlug === normalizedSlug;
      });

      if (matchingCategory) {
        setCategoryName(matchingCategory);  // matchingCategory is now a string

        // Fetch products using the exact category name
        const response = await api.getProductsFromBothRetailers({
          category: matchingCategory,
          page_size: 100,
        });

        setProducts(response?.results || []);
      }
    } catch (err) {
      console.error('Error loading category products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by retailer
    if (selectedRetailer) {
      filtered = filtered.filter(p => p.retailer?.toLowerCase() === selectedRetailer.toLowerCase());
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }

    // Filter by discount
    if (selectedDiscount) {
      const minDiscount = parseFloat(selectedDiscount);
      filtered = filtered.filter(p => {
        if (!p.discount) return false;
        const discountStr = p.discount.toString().replace(/[-%]/g, '');
        const discountValue = parseFloat(discountStr);
        return !isNaN(discountValue) && discountValue >= minDiscount;
      });
    }

    // Sort
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.scraped_at ? new Date(a.scraped_at).getTime() : 0;
        const dateB = b.scraped_at ? new Date(b.scraped_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  };

  const handleResetFilters = () => {
    setSelectedRetailer('');
    setPriceRange({ min: '', max: '' });
    setSelectedDiscount('');
    setSortBy('newest');
  };

  const filteredProducts = getFilteredProducts();

  // Extract unique brands from filtered products
  const brands = Array.from(new Set(filteredProducts.map(p => p.brand).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Kategorien', href: '/kategorien' },
            { label: categoryName }
          ]}
        />

        {/* Hero Header */}
        <div className="mb-6 md:mb-10 mt-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative">
              <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg">
                {categoryName}
              </h1>
              <p className="text-base md:text-lg text-white/90 mb-6">
                Entdecken Sie die besten Angebote in dieser Kategorie
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-sm md:text-base font-bold text-white">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Produkt' : 'Produkte'}
                  </span>
                </div>

                {brands.length > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm md:text-base font-bold text-white">
                      {brands.length} {brands.length === 1 ? 'Marke' : 'Marken'}
                    </span>
                  </div>
                )}

                {totalCount > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm md:text-base font-bold text-white">
                      {totalCount} Gesamt
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="mb-6 lg:col-span-1 lg:mb-0">
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-xl dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 sticky top-20">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="current Color" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Filter
                  </h2>
                </div>
                <button
                  onClick={handleResetFilters}
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
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all cursor-pointer"
                >
                  <option value="newest">⏰ Neueste zuerst</option>
                  <option value="price_asc">💰 Preis: Niedrig → Hoch</option>
                  <option value="price_desc">💎 Preis: Hoch → Niedrig</option>
                </select>
              </div>

              {/* Retailer Filter */}
              <div className="mb-5 pb-5 border-b border-gray-200 dark:border-zinc-800">
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
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Alle Händler</span>
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group">
                    <input
                      type="radio"
                      name="retailer"
                      value="saturn"
                      checked={selectedRetailer === 'saturn'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Saturn</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group">
                    <input
                      type="radio"
                      name="retailer"
                      value="mediamarkt"
                      checked={selectedRetailer === 'mediamarkt'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-600"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">MediaMarkt</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group">
                    <input
                      type="radio"
                      name="retailer"
                      value="otto"
                      checked={selectedRetailer === 'otto'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Otto</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors cursor-pointer group">
                    <input
                      type="radio"
                      name="retailer"
                      value="kaufland"
                      checked={selectedRetailer === 'kaufland'}
                      onChange={(e) => setSelectedRetailer(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Kaufland</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-5 pb-5 border-b border-gray-200 dark:border-zinc-800">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Preisspanne (€)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <div className="flex items-center text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="mb-0">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  Mindestrabatt
                </label>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all cursor-pointer"
                >
                  <option value="">🏷️ Alle Angebote</option>
                  <option value="5">🔥 5% oder mehr</option>
                  <option value="10">⚡ 10% oder mehr</option>
                  <option value="15">💥 15% oder mehr</option>
                  <option value="20">🎯 20% oder mehr</option>
                  <option value="30">🚀 30% oder mehr</option>
                  <option value="50">💎 50% oder mehr</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-6 text-base font-medium text-gray-600 dark:text-gray-400">
                    Produkte werden geladen...
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Bitte warten Sie einen Moment
                  </p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Keine Produkte gefunden
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Versuchen Sie, die Filter anzupassen oder setzen Sie alle Filter zurück.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Produkt' : 'Produkte'}
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Rasteransicht</span>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
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
