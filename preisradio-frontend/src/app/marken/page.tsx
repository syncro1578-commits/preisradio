'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Brand } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MarkenPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);

      // Récupérer tous les produits
      const response = await api.getProductsFromBothRetailers({
        page_size: 10000, // Get all products to analyze brands
      });

      const products = response?.results || [];

      // Grouper les produits par marque
      const brandMap = new Map<string, Product[]>();

      products.forEach((product) => {
        if (product.brand) {
          const brandName = product.brand;
          if (!brandMap.has(brandName)) {
            brandMap.set(brandName, []);
          }
          brandMap.get(brandName)?.push(product);
        }
      });

      // Créer les objets Brand avec les statistiques
      const brandsArray: Brand[] = Array.from(brandMap.entries()).map(([name, products]) => {
        const retailers = Array.from(new Set(products.map(p => p.retailer).filter(Boolean)));
        const categories = Array.from(new Set(products.map(p => p.category)));
        const prices = products.map(p => p.price);

        return {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          productsCount: products.length,
          retailers: retailers as string[],
          categories,
          averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        };
      });

      // Trier par nombre de produits
      brandsArray.sort((a, b) => b.productsCount - a.productsCount);

      setBrands(brandsArray);
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les marques par recherche
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header with Back Button */}
        <div className="mb-8 md:mb-12">
          <Link
            href="/"
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
            Zurück zur Startseite
          </Link>

          <div className="text-center">
            <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Alle Marken
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
              Entdecken Sie Produkte von führenden Marken bei verschiedenen Händlern
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 md:mb-12">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <input
                type="search"
                placeholder="Marke suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-6 py-4 pl-12 text-gray-900 placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
              />
              <svg
                className="absolute left-4 top-4 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Marken werden geladen...
              </p>
            </div>
          </div>
        ) : filteredBrands.length === 0 ? (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Marken gefunden
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Versuchen Sie eine andere Suchanfrage
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-8 md:mb-12 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Marken
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    {filteredBrands.length}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Produkte
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                    {filteredBrands.reduce((sum, b) => sum + b.productsCount, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Top Marke
                  </p>
                  <p className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 truncate">
                    {filteredBrands[0]?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Kategorien
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
                    {Array.from(new Set(filteredBrands.flatMap(b => b.categories))).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Brands Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBrands.map((brand, index) => (
                <Link
                  key={brand.slug}
                  href={`/search?brand=${encodeURIComponent(brand.name)}`}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                >
                  {/* Top 3 Badge */}
                  {index < 3 && (
                    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-xs font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  )}

                  {/* Brand Name */}
                  <div className="mb-6">
                    <div className="flex h-20 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-zinc-800 dark:to-zinc-900 shadow-inner">
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center line-clamp-2">
                        {brand.name}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Produkte
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {brand.productsCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm rounded-lg bg-purple-50 dark:bg-purple-950/30 px-3 py-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Händler
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {brand.retailers.length}
                      </span>
                    </div>

                    {brand.minPrice && brand.maxPrice && (
                      <div className="flex items-center justify-between text-sm rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          Preis
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {brand.minPrice.toFixed(0)}-{brand.maxPrice.toFixed(0)}€
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories Pills */}
                  <div className="flex flex-wrap gap-1">
                    {brand.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400"
                      >
                        {category.length > 12 ? category.substring(0, 12) + '...' : category}
                      </span>
                    ))}
                    {brand.categories.length > 3 && (
                      <span className="inline-block rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{brand.categories.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Hover Indicator */}
                  <div className="mt-4 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
                    <span>Produkte anzeigen</span>
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
