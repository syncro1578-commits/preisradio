'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Retailer, Product } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function HaendlerPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [retailersResponse, productsResponse] = await Promise.all([
        api.getRetailers(),
        api.getProducts({}),
      ]);

      setRetailers(retailersResponse.results);
      setProducts(productsResponse.results);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les stats pour chaque détaillant
  const retailersWithStats = retailers.map((retailer) => {
    // Filtrer les produits de ce retailer
    // Note: retailer.id from API is 'saturn', 'mediamarkt', or 'otto'
    // product.retailer also contains the same values
    const retailerProducts = products.filter((product) =>
      product.retailer === retailer.id
    );

    const productsCount = retailerProducts.length;

    // Calculer le prix moyen
    const averagePrice =
      retailerProducts.length > 0
        ? retailerProducts.reduce((acc, product) => acc + product.price, 0) / retailerProducts.length
        : 0;

    // Dans le nouveau modèle, tous les produits sont "en stock" car ils viennent directement du site
    const inStockCount = productsCount;

    return {
      ...retailer,
      productsCount,
      pricesCount: productsCount,  // Dans le nouveau modèle, 1 produit = 1 prix
      averagePrice,
      inStockCount,
    };
  });

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
              Unsere Händler-Partner
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
              Wir vergleichen Preise der führenden Online-Händler in Deutschland
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Händler werden geladen...
              </p>
            </div>
          </div>
        ) : retailers.length === 0 ? (
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Händler gefunden
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fügen Sie Händler zur Datenbank hinzu
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-8 md:mb-12 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Händler-Partner
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                      {retailers.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 shadow-lg">
                    <svg
                      className="h-6 w-6 md:h-8 md:w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Produkte verfügbar
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                      {products.length.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 md:p-4 shadow-lg">
                    <svg
                      className="h-6 w-6 md:h-8 md:w-8 text-white"
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

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Kategorien
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                      {Array.from(new Set(products.map(p => p.category))).length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-3 md:p-4 shadow-lg">
                    <svg
                      className="h-6 w-6 md:h-8 md:w-8 text-white"
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
            </div>

            {/* Retailers Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {retailersWithStats
                .sort((a, b) => b.productsCount - a.productsCount)
                .map((retailer) => (
                  <div
                    key={retailer.id}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                  >
                    {/* Badge for top retailer */}
                    {retailer.productsCount ===
                      Math.max(...retailersWithStats.map((r) => r.productsCount)) && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Top
                      </div>
                    )}

                    {/* Logo/Name */}
                    <div className="mb-6">
                      <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-zinc-800 dark:to-zinc-900 shadow-inner">
                        {retailer.logo ? (
                          <img
                            src={retailer.logo}
                            alt={retailer.name}
                            className="max-h-full max-w-full object-contain filter group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {retailer.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="mb-4 text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {retailer.name}
                    </h3>

                    {/* Stats */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          Produkte
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {retailer.productsCount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          Auf Lager
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {retailer.inStockCount.toLocaleString()}
                        </span>
                      </div>

                      {retailer.averagePrice > 0 && (
                        <div className="flex items-center justify-between text-sm rounded-lg bg-purple-50 dark:bg-purple-950/30 px-3 py-2">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Ø Preis
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {retailer.averagePrice.toFixed(2)} €
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/search?retailer=${retailer.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        Produkte
                      </Link>
                      <a
                        href={retailer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                      >
                        Website
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
            </div>

            {/* Trust Section */}
            <div className="mt-12 md:mt-16 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 text-center text-white shadow-2xl">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <svg className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-4 text-2xl md:text-3xl font-bold">
                Vertrauen Sie auf Qualität
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg opacity-95">
                Wir arbeiten nur mit vertrauenswürdigen und etablierten Händlern zusammen.
                Alle Partner werden sorgfältig ausgewählt, um Ihnen das beste
                Einkaufserlebnis zu garantieren.
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
