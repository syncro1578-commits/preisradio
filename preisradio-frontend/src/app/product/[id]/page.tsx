'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductSimilar from '@/components/ProductSimilar';
import PriceComparison from '@/components/PriceComparison';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await api.getProduct(params.id as string);
      setProduct(productData);
    } catch (err) {
      setError('Fehler beim Laden des Produkts');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update document metadata and JSON-LD
  useEffect(() => {
    if (product) {
      document.title = `${product.title} | Preisradio`;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}. Vergleichen Sie Preise bei ${product.retailer === 'saturn' ? 'Saturn' : 'MediaMarkt'}.`);
      }

      // Update canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = `${baseUrl}/product/${params.id}`;

      // Update hreflang tags
      let hrefLangDE = document.querySelector('link[hreflang="de-DE"]') as HTMLLinkElement;
      if (!hrefLangDE) {
        hrefLangDE = document.createElement('link');
        hrefLangDE.rel = 'alternate';
        hrefLangDE.setAttribute('hreflang', 'de-DE');
        document.head.appendChild(hrefLangDE);
      }
      hrefLangDE.href = `${baseUrl}/product/${params.id}`;

      let hrefLangDefault = document.querySelector('link[hreflang="x-default"]') as HTMLLinkElement;
      if (!hrefLangDefault) {
        hrefLangDefault = document.createElement('link');
        hrefLangDefault.rel = 'alternate';
        hrefLangDefault.setAttribute('hreflang', 'x-default');
        document.head.appendChild(hrefLangDefault);
      }
      hrefLangDefault.href = `${baseUrl}/product/${params.id}`;

      // Add Open Graph meta tags for social sharing
      const updateMetaTag = (property: string, content: string, isProperty: boolean = true) => {
        let tag = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${property}"]`) as HTMLMetaElement;
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(isProperty ? 'property' : 'name', property);
          document.head.appendChild(tag);
        }
        tag.content = content;
      };

      updateMetaTag('og:title', `${product.title} | Preisradio`, true);
      updateMetaTag('og:description', `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}`, true);
      updateMetaTag('og:image', product.image || `${baseUrl}/default-product.jpg`, true);
      updateMetaTag('og:url', `${baseUrl}/product/${params.id}`, true);
      updateMetaTag('og:type', 'product', true);
      updateMetaTag('twitter:card', 'product', false);
      updateMetaTag('twitter:title', `${product.title} | Preisradio`, false);
      updateMetaTag('twitter:description', `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}`, false);
      updateMetaTag('twitter:image', product.image || `${baseUrl}/default-product.jpg`, false);
    }

    return () => {
      // Cleanup is handled by React when component unmounts
    };
  }, [product, params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Laden...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-600"
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
          <h3 className="mt-4 text-lg font-medium text-red-900 dark:text-red-100">
            {error || 'Produkt nicht gefunden'}
          </h3>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={loadProduct}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Erneut versuchen
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = product.price;
  const oldPrice = product.old_price;
  const hasDiscount = oldPrice && oldPrice > currentPrice;
  const discountAmount = hasDiscount ? oldPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? ((discountAmount / oldPrice) * 100) : 0;

  const getRetailerInfo = (retailer?: string) => {
    if (retailer === 'saturn') {
      return { name: 'Saturn', color: 'bg-red-600', logo: '🪐' };
    } else if (retailer === 'mediamarkt') {
      return { name: 'MediaMarkt', color: 'bg-red-700', logo: '📺' };
    } else if (retailer === 'otto') {
      return { name: 'Otto', color: 'bg-blue-600', logo: '🛒' };
    }
    return { name: 'Händler', color: 'bg-gray-600', logo: '🏪' };
  };

  const retailerInfo = getRetailerInfo(product.retailer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 md:mb-6 flex items-center space-x-2 text-xs md:text-sm">
          <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 transition-colors">
            Startseite
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={`/search?category=${encodeURIComponent(product.category)}`}
            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 transition-colors"
          >
            {product.category}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white truncate">{product.title}</span>
        </nav>

        {/* Product Info - Improved Layout */}
        <div className="mb-8 grid gap-6 md:gap-8 lg:grid-cols-5">
          {/* Image - Reduced Size (2 columns on desktop) */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-white p-4 md:p-6 shadow-lg dark:bg-zinc-900 sticky top-24">
              <div className="flex h-64 md:h-80 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <svg
                      className="h-24 w-24 md:h-32 md:w-32"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details - 3 columns on desktop */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Category & Retailer */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Link
                href={`/search?category=${encodeURIComponent(product.category)}`}
                className="inline-block rounded-full bg-blue-100 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-blue-800 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200"
              >
                {product.category}
              </Link>
              <span className={`inline-flex items-center gap-1.5 md:gap-2 rounded-full ${retailerInfo.color} px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white`}>
                <span>{retailerInfo.logo}</span>
                <span>{retailerInfo.name}</span>
              </span>
              {product.discount && (
                <span className="inline-block rounded-full bg-red-500 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-white animate-pulse">
                  {product.discount} RABATT
                </span>
              )}
            </div>

            {/* Title - Reduced and Modern Font */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* Brand */}
            {product.brand && (
              <Link
                href={`/marken/${encodeURIComponent(product.brand)}`}
                className="inline-flex items-center gap-2 text-base md:text-lg font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {product.brand}
              </Link>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* GTIN/EAN */}
            {product.gtin && (
              <div className="rounded-lg bg-gray-50 p-3 md:p-4 dark:bg-zinc-800">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">EAN/GTIN</p>
                <p className="mt-1 font-mono text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                  {product.gtin}
                </p>
              </div>
            )}

            {/* Prix - Modern Design */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 shadow-lg dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800 border border-blue-100 dark:border-zinc-700">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Aktueller Preis</p>
                  <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                    <p className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      {currentPrice.toFixed(2)} €
                    </p>
                    {hasDiscount && oldPrice && (
                      <p className="text-lg md:text-xl text-gray-500 line-through dark:text-gray-400">
                        {oldPrice.toFixed(2)} €
                      </p>
                    )}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="text-right bg-green-50 dark:bg-green-900/20 rounded-xl p-3 md:p-4">
                    <p className="text-xs md:text-sm font-medium text-green-700 dark:text-green-400">Sie sparen</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                      {discountAmount.toFixed(2)} €
                    </p>
                    <p className="text-sm md:text-base font-semibold text-green-600 dark:text-green-400">
                      -{discountPercent.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'achat - Modern */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-white transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
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
              Jetzt bei {retailerInfo.name} kaufen
              <svg
                className="h-4 w-4 md:h-5 md:w-5"
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

            {/* Product Metadata */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.sku && (
                <div className="flex items-center space-x-3 rounded-xl bg-white p-3 md:p-4 shadow-sm dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">SKU</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.sku}
                    </p>
                  </div>
                </div>
              )}

              {product.scraped_at && (
                <div className="flex items-center space-x-3 rounded-xl bg-white p-3 md:p-4 shadow-sm dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                  <svg
                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Aktualisiert</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(product.scraped_at).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 rounded-xl bg-white p-3 md:p-4 shadow-sm dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Verfügbarkeit</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Auf Lager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <PriceComparison currentProduct={product} />

        {/* Similar Products - With Category Link */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Ähnliche Produkte
            </h2>
            <Link
              href={`/search?category=${encodeURIComponent(product.category)}`}
              className="flex items-center gap-2 text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Alle in {product.category}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ProductSimilar productId={params.id as string} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
