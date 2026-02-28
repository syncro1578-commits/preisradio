'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/lib/types';
import api from '@/lib/api';
import ProductSection from '@/components/ProductSection';
import AdSenseDisplay from '@/components/AdSenseDisplay';
import AdSenseMultiplex from '@/components/AdSenseMultiplex';
import HeroCarousel from '@/components/HeroCarousel';
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
      const allProducts = dealsRes.results || [];
      console.log(`[Deals] API returned ${allProducts.length} products`);

      // Filter products that have discount values
      const productsWithDiscount = allProducts.filter(p => {
        if (!p.discount) return false;
        // Handle formats like "-15%", "15%", "15", etc.
        const discountStr = String(p.discount).replace(/[^0-9.]/g, '');
        const discount = parseFloat(discountStr);
        return !isNaN(discount) && discount > 0;
      });

      console.log(`[Deals] ${productsWithDiscount.length} products with discount`);

      // Sort by discount value (highest first)
      const sortedByDiscount = [...productsWithDiscount].sort((a, b) => {
        const discountA = parseFloat(String(a.discount).replace(/[^0-9.]/g, '') || '0');
        const discountB = parseFloat(String(b.discount).replace(/[^0-9.]/g, '') || '0');
        return discountB - discountA;
      });

      // Round-robin deals by retailer, then fill remaining slots
      const targetCount = 20;
      const dealsByRetailer: Record<string, Product[]> = {};
      for (const p of sortedByDiscount) {
        const r = p.retailer || 'other';
        if (!dealsByRetailer[r]) dealsByRetailer[r] = [];
        dealsByRetailer[r].push(p);
      }
      const mixedDeals = roundRobin(Object.values(dealsByRetailer)).slice(0, targetCount);

      if (mixedDeals.length < targetCount) {
        const dealIds = new Set(mixedDeals.map(p => p.id));
        const fillersByRetailer: Record<string, Product[]> = {};
        for (const p of allProducts) {
          if (dealIds.has(p.id)) continue;
          const r = p.retailer || 'other';
          if (!fillersByRetailer[r]) fillersByRetailer[r] = [];
          fillersByRetailer[r].push(p);
        }
        const fillers = roundRobin(Object.values(fillersByRetailer))
          .slice(0, targetCount - mixedDeals.length);
        mixedDeals.push(...fillers);
      }
      setTopDeals(mixedDeals);

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

  // Round-robin: alternate products from different retailers
  const roundRobin = (groups: Product[][]): Product[] => {
    const result: Product[] = [];
    const seen = new Set<string>();
    let maxLen = 0;
    for (const g of groups) if (g.length > maxLen) maxLen = g.length;
    for (let i = 0; i < maxLen; i++) {
      for (const g of groups) {
        if (i < g.length && !seen.has(g[i].id)) {
          seen.add(g[i].id);
          result.push(g[i]);
        }
      }
    }
    return result;
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
    <div className="space-y-10">
      {/* ── Deals section — fond distinct (idealo-style) ─────────────── */}
      <section className="deals-section" aria-labelledby="top-angebote-heading">
        <div className="container mx-auto">
          <h2 id="top-angebote-heading" className="sr-only">Aktuelle Top Angebote</h2>
          <ProductSection
            title="Aktuelle Deals"
            description="Die besten Rabatte von Saturn, MediaMarkt, Otto & Kaufland"
            products={topDeals}
            viewAllLink="/search?sort=discount"
          />
        </div>
      </section>

      {/* ── Hero Carousel — promotional banners ─────────────────── */}
      <HeroCarousel />

      {/* AdSense Display - After Carousel */}
      <AdSenseDisplay
        adSlot="1502312871"
        className="my-6"
      />

      {/* ── Kategorien ─────────────────────────────────────────────── */}
      <h2 className="sr-only">Produkte nach Kategorien</h2>

      {categorySections.map((section) => {
        if (!section.category || typeof section.category !== 'string') return null;

        const allProducts = roundRobin([
          section.saturnProducts,
          section.mediamarktProducts,
          section.ottoProducts,
          section.kauflandProducts
        ]);

        const categoryName = section.category;
        const translatedName = simplifyGermanName(categoryName);
        const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        return (
          <ProductSection
            key={section.category}
            title={translatedName}
            description={`Produkte von Saturn, MediaMarkt, Otto & Kaufland`}
            products={allProducts}
            viewAllLink={`/kategorien/${categorySlug}`}
          />
        );
      })}

      {/* AdSense Multiplex - Before Features */}
      <AdSenseMultiplex className="my-8" />

      {/* ── USP section — idealo-style ─────────────────────────────── */}
      <section className="usp-section">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-gray-800 dark:text-gray-200">
            Preisradio — Ihr Preisvergleich
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="usp-card">
              <div className="usp-icon usp-icon--blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="usp-title">Schneller Vergleich</h3>
              <p className="usp-text">Preise von Saturn, MediaMarkt, Otto & Kaufland sofort vergleichen</p>
            </div>
            <div className="usp-card">
              <div className="usp-icon usp-icon--green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="usp-title">Geld sparen</h3>
              <p className="usp-text">Finden Sie immer den besten Preis und sparen Sie bares Geld</p>
            </div>
            <div className="usp-card">
              <div className="usp-icon usp-icon--purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="usp-title">Vertrauenswurdig</h3>
              <p className="usp-text">Nur seriose und bekannte Handler in unserem Vergleich</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
