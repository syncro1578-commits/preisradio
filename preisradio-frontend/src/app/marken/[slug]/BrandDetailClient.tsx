'use client';

import { useEffect, useState } from 'react';
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

      // Décoder le slug URL (ex: "ASUS" reste "ASUS", "acer" devient "Acer")
      const decodedSlug = decodeURIComponent(slug);

      // Essayer différentes variations du nom de marque
      const brandVariations = [
        decodedSlug, // Tel quel (ex: "ASUS")
        decodedSlug.toUpperCase(), // Tout en majuscules (ex: "ASUS")
        decodedSlug.toLowerCase(), // Tout en minuscules (ex: "asus")
        decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).toLowerCase(), // Première lettre majuscule (ex: "Asus")
      ];

      console.log('Loading brand products for slug:', slug, 'variations:', brandVariations);

      // Utiliser la recherche avec le nom de marque
      const response = await api.getProductsFromBothRetailers({
        search: decodedSlug, // Rechercher avec le nom de marque
        page_size: 100,
      });

      const allProducts = response?.results || [];
      console.log('Total products loaded:', allProducts.length);

      // Filtrer côté client pour trouver les produits de cette marque
      const brandProducts = allProducts.filter((product) => {
        if (!product.brand) return false;

        // Normaliser le nom de marque du produit
        const productBrand = product.brand.trim();
        const productSlug = productBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Vérifier si le slug correspond
        const slugMatches = productSlug === normalizedSlug;

        // Vérifier si une des variations correspond exactement
        const exactMatch = brandVariations.some(variant =>
          productBrand.toLowerCase() === variant.toLowerCase()
        );

        return slugMatches || exactMatch;
      });

      console.log('Filtered brand products:', brandProducts.length);

      if (brandProducts.length > 0) {
        setBrandName(brandProducts[0].brand || '');
      } else {
        // Si aucun produit trouvé, définir le nom depuis le slug
        setBrandName(decodedSlug.toUpperCase());
      }

      setProducts(brandProducts);
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

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumbs */}
        {brandName && (
          <Breadcrumbs
            items={[
              { label: 'Marken', href: '/marken' },
              { label: brandName }
            ]}
          />
        )}

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="text-center">
            <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {brandName || 'Marke'}
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
              Alle Produkte von {brandName} bei Saturn, MediaMarkt und Otto
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Produkte werden geladen...
              </p>
            </div>
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
              Diese Marke hat derzeit keine Produkte in unserer Datenbank
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-8 md:mb-12 grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Produkte
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  {stats.totalProducts}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Kategorien
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                  {stats.categories}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Händler
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                  {stats.retailers}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Ø Preis
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
                  {stats.avgPrice.toFixed(0)}€
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Min
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  {stats.minPrice.toFixed(0)}€
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Max
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                  {stats.maxPrice.toFixed(0)}€
                </p>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* Sidebar Filters */}
              <aside className="mb-8 lg:col-span-1 lg:mb-0">
                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 sticky top-24">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Filter
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedRetailer('');
                        setSortBy('newest');
                      }}
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

                  {/* Category Filter */}
                  {categories.length > 1 && (
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
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Alle
                          </span>
                        </label>
                        {retailers.map((retailer) => {
                          const retailerNames: Record<string, string> = {
                            'saturn': 'Saturn',
                            'mediamarkt': 'MediaMarkt',
                            'otto': 'Otto'
                          };
                          const displayName = retailer ? (retailerNames[retailer] || retailer) : retailer;
                          return (
                            <label key={retailer} className="flex items-center">
                              <input
                                type="radio"
                                name="retailer"
                                value={retailer}
                                checked={selectedRetailer === retailer}
                                onChange={(e) => setSelectedRetailer(e.target.value)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {displayName}
                              </span>
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
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'}
                  </h2>
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
