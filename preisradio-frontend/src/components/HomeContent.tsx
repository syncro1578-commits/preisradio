'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import api from '@/lib/api';
import ProductSection from '@/components/ProductSection';
import Link from 'next/link';

interface CategorySection {
  category: Category;
  saturnProducts: Product[];
  mediamarktProducts: Product[];
  ottoProducts: Product[];
}

export default function HomeContent() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';

  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  useEffect(() => {
    loadAllSections();
  }, []);

  useEffect(() => {
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  const loadTopCategories = async () => {
    try {
      // Load top 10 categories by product count
      const response = await api.getCategories({ page_size: 10 });
      setTopCategories(response.results || []);
      return response.results || [];
    } catch (err) {
      console.error('Error loading categories:', err);
      return [];
    }
  };

  const loadAllSections = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load top categories first
      const categories = await loadTopCategories();

      // Load all products from all retailers for top deals
      const allProductsRes = await api.getProductsFromBothRetailers({ page_size: 200 });

      // Filter products with discounts for top deals
      const productsWithDiscount = allProductsRes.results.filter(p => {
        if (!p.discount) return false;
        const discountStr = p.discount.toString().replace(/[-%]/g, '');
        const discount = parseFloat(discountStr);
        return !isNaN(discount) && discount > 0;
      });

      const sortedByDiscount = productsWithDiscount.sort((a, b) => {
        const discountA = parseFloat(a.discount?.toString().replace(/[-%]/g, '') || '0');
        const discountB = parseFloat(b.discount?.toString().replace(/[-%]/g, '') || '0');
        return discountB - discountA;
      });

      setTopDeals(sortedByDiscount.slice(0, 20));

      // Load products for each top category from all retailers mixed
      const sections: CategorySection[] = [];

      for (const category of categories) {
        // Load products from all retailers for this category
        const response = await api.getProductsFromBothRetailers({
          category: category.name,
          page_size: 20
        });

        sections.push({
          category,
          saturnProducts: response.results.filter(p => p.retailer === 'saturn'),
          mediamarktProducts: response.results.filter(p => p.retailer === 'mediamarkt'),
          ottoProducts: response.results.filter(p => p.retailer === 'otto')
        });
      }

      setCategorySections(sections);
    } catch (err) {
      setError('Fehler beim Laden der Produkte');
      console.error('Error loading sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
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
      'PC': '🖥️',
      'Smartphone': '📱',
      'Audio': '🔊',
      'TV': '📺',
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    return '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Seite wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
          onClick={loadAllSections}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Search Bar */}
      <div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produkte</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {topCategories.reduce((sum, cat) => sum + cat.count, 0)}+
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
                {topCategories.length}+
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Top Kategorien
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Händler</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                3
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Saturn, MediaMarkt & Otto
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

      {/* Product Sections with Horizontal Scroll on Mobile */}
      <ProductSection
        title="Top Angebote"
        description="Die besten Rabatte und Deals von allen Händlern"
        products={topDeals}
        viewAllLink="/search?sort=discount"
        icon="🔥"
      />

      {/* Dynamic Category Sections */}
      {categorySections.map((section) => {
        // Mix products from all retailers
        const allProducts = [
          ...section.saturnProducts,
          ...section.mediamarktProducts,
          ...section.ottoProducts
        ];

        const categorySlug = section.category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const icon = getCategoryIcon(section.category.name);

        return (
          <ProductSection
            key={section.category.name}
            title={section.category.name}
            description={`${section.category.count} Produkte von Saturn, MediaMarkt & Otto`}
            products={allProducts}
            viewAllLink={`/kategorien/${categorySlug}`}
            icon={icon}
          />
        );
      })}

      {/* Features Section */}
      <div>
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
    </div>
  );
}
