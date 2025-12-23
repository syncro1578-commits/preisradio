'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
        const catSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return catSlug === normalizedSlug;
      });

      if (matchingCategory) {
        setCategoryName(matchingCategory.name);

        // Fetch products using the exact category name
        const response = await api.getProductsFromBothRetailers({
          category: matchingCategory.name,
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

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            href="/kategorien"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
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
            Zurück zu allen Kategorien
          </Link>

          <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {categoryName}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {filteredProducts.length} von {totalCount} {totalCount === 1 ? 'Produkt' : 'Produkten'} angezeigt
          </p>
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
                  Zurücksetzen
                </button>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sortieren nach
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="newest">Neueste</option>
                  <option value="price_asc">Preis aufsteigend</option>
                  <option value="price_desc">Preis absteigend</option>
                </select>
              </div>

              {/* Retailer Filter */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Händler
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
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Produkte werden geladen...
                  </p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                  Keine Produkte gefunden
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Versuchen Sie, die Filter anzupassen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
