'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/lib/types';
import api from '@/lib/api';
import ProductSection from '@/components/ProductSection';
import AdSenseDisplay from '@/components/AdSenseDisplay';
import AdSenseMultiplex from '@/components/AdSenseMultiplex';
import Link from 'next/link';

interface CategorySection {
  category: Category;
  saturnProducts: Product[];
  mediamarktProducts: Product[];
  ottoProducts: Product[];
  kauflandProducts: Product[];
}

export default function HomeContent() {
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllSections();
  }, []);

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

      // Load products from all retailers for top deals (single API call)
      const dealsRes = await api.getProductsFromBothRetailers({ page_size: 100 });
      const allProductsWithDeals = dealsRes.results;

      // Filter products that have existing discount values
      const productsWithDiscount = allProductsWithDeals.filter(p => {
        if (!p.discount) return false;
        const discountStr = p.discount.toString().replace(/[-%]/g, '');
        const discount = parseFloat(discountStr);
        return !isNaN(discount) && discount > 0;
      });

      // Sort by discount value (highest first)
      const sortedByDiscount = productsWithDiscount.sort((a, b) => {
        const discountA = parseFloat(a.discount?.toString().replace(/[-%]/g, '') || '0');
        const discountB = parseFloat(b.discount?.toString().replace(/[-%]/g, '') || '0');
        return discountB - discountA;
      });

      // If no products with discount, show all products
      if (sortedByDiscount.length === 0) {
        setTopDeals(allProductsWithDeals.slice(0, 20));
      } else {
        setTopDeals(sortedByDiscount.slice(0, 20));
      }

      // Load products for each top category from all retailers mixed (in parallel)
      const sectionPromises = categories.map(async (category) => {
        const response = await api.getProductsFromBothRetailers({
          category: category,  // category is now a string, not an object
          page_size: 20
        });

        return {
          category,
          saturnProducts: response.results.filter(p => p.retailer === 'saturn'),
          mediamarktProducts: response.results.filter(p => p.retailer === 'mediamarkt'),
          ottoProducts: response.results.filter(p => p.retailer === 'otto'),
          kauflandProducts: response.results.filter(p => p.retailer === 'kaufland')
        };
      });

      const sections = await Promise.all(sectionPromises);
      setCategorySections(sections);
    } catch (err) {
      setError('Fehler beim Laden der Produkte');
      console.error('Error loading sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const simplifyGermanName = (categoryName: string): string => {
    // If the name contains " - ", keep only the German part (before the dash)
    if (categoryName.includes(' - ')) {
      return categoryName.split(' - ')[0].trim();
    }

    // Direct translations for French-only names
    const translations: { [key: string]: string } = {
      'PC Bureau Gaming': 'Gaming-PC',
      'PC Portable': 'Laptop',
    };

    return translations[categoryName] || categoryName;
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

    if (!categoryName) return '📦';

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
      {/* H2 — Top Angebote */}
      <section aria-labelledby="top-angebote-heading">
        <h2 id="top-angebote-heading" className="sr-only">Aktuelle Top Angebote</h2>
        <ProductSection
          title="Top Angebote"
          description="Die besten Rabatte und Deals von allen Händlern"
          products={topDeals}
          viewAllLink="/search?sort=discount"
          icon="🔥"
        />
      </section>

      {/* AdSense Display - After Top Deals */}
      <AdSenseDisplay
        adSlot="1502312871"
        className="my-8"
      />

      {/* H2 — Kategorien */}
      <h2 className="sr-only">Produkte nach Kategorien</h2>

      {/* Dynamic Category Sections */}
      {categorySections.map((section) => {
        // Skip if category is missing or invalid
        if (!section.category || typeof section.category !== 'string') return null;

        // Mix products from all retailers
        const allProducts = [
          ...section.saturnProducts,
          ...section.mediamarktProducts,
          ...section.ottoProducts,
          ...section.kauflandProducts
        ];

        const categoryName = section.category;  // category is now a string
        const translatedName = simplifyGermanName(categoryName);
        const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const icon = getCategoryIcon(categoryName);

        return (
          <ProductSection
            key={section.category}
            title={translatedName}
            description={`Produkte von Saturn, MediaMarkt, Otto & Kaufland`}
            products={allProducts}
            viewAllLink={`/kategorien/${categorySlug}`}
            icon={icon}
          />
        );
      })}

      {/* AdSense Multiplex - Before Features */}
      <AdSenseMultiplex className="my-12" />

      {/* Features Section */}
      <div>
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Warum Preisradio?
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
