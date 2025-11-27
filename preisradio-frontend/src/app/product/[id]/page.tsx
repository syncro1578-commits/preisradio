'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductSimilar from '@/components/ProductSimilar';
import PriceComparison from '@/components/PriceComparison';

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
      setError('Erreur lors du chargement du produit');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update document metadata and JSON-LD
  useEffect(() => {
    if (product) {
      // Update title
      document.title = `${product.title} | PrixRadio`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}. Vergleichen Sie Preise bei ${product.retailer === 'saturn' ? 'Saturn' : 'MediaMarkt'}.`);
      }

      // Add or update JSON-LD script
      let script = document.querySelector('#product-jsonld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'product-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description || product.title,
        image: product.image || `${baseUrl}/default-product.jpg`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Unknown'
        },
        sku: product.sku || product.id,
        gtin: product.gtin,
        offers: {
          '@type': 'Offer',
          url: product.url,
          priceCurrency: product.currency,
          price: product.price,
          priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: product.retailer === 'saturn' ? 'Saturn' : product.retailer === 'mediamarkt' ? 'MediaMarkt' : 'Retailer'
          }
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '1'
        }
      };

      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup
    return () => {
      const script = document.querySelector('#product-jsonld');
      if (script) {
        script.remove();
      }
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Chargement du produit...
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
            {error || 'Produit introuvable'}
          </h3>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={loadProduct}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculer le prix et la réduction si applicable
  const currentPrice = product.price;
  const oldPrice = product.old_price;
  const hasDiscount = oldPrice && oldPrice > currentPrice;
  const discountAmount = hasDiscount ? oldPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? ((discountAmount / oldPrice) * 100) : 0;

  // Déterminer le nom et la couleur du retailer
  const getRetailerInfo = (retailer?: string) => {
    if (retailer === 'saturn') {
      return { name: 'Saturn', color: 'bg-red-600', logo: '🪐' };
    } else if (retailer === 'mediamarkt') {
      return { name: 'MediaMarkt', color: 'bg-red-700', logo: '📺' };
    }
    return { name: 'Händler', color: 'bg-gray-600', logo: '🏪' };
  };

  const retailerInfo = getRetailerInfo(product.retailer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <svg
                className="mr-2 h-5 w-5"
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
              Retour aux produits
            </Link>

            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              🔍 PrixRadio
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400">
            Accueil
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">{product.category}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">{product.title}</span>
        </nav>

        {/* Product Info */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
            <div className="flex h-96 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <svg
                    className="h-32 w-32"
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

          {/* Details */}
          <div className="space-y-6">
            {/* Category & Retailer */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {product.category}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full ${retailerInfo.color} px-4 py-2 text-sm font-medium text-white`}>
                <span>{retailerInfo.logo}</span>
                <span>{retailerInfo.name}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {product.brand}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            )}

            {/* GTIN/EAN */}
            {product.gtin && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Code EAN/GTIN</p>
                <p className="mt-1 font-mono text-lg font-semibold text-gray-900 dark:text-white">
                  {product.gtin}
                </p>
              </div>
            )}

            {/* Prix */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-zinc-800 dark:to-zinc-800">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prix actuel</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {currentPrice.toFixed(2)} {product.currency}
                    </p>
                    {hasDiscount && oldPrice && (
                      <p className="text-xl text-gray-500 line-through dark:text-gray-400">
                        {oldPrice.toFixed(2)} {product.currency}
                      </p>
                    )}
                  </div>
                  {product.discount && (
                    <p className="mt-2 inline-block rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                      {product.discount}
                    </p>
                  )}
                </div>
                {hasDiscount && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Économie</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      -{discountAmount.toFixed(2)} {product.currency}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      -{discountPercent.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'achat */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
            >
              <svg
                className="h-6 w-6"
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
              Voir le produit
              <svg
                className="h-5 w-5"
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

        {/* Price Comparison */}
        <PriceComparison currentProduct={product} />

        {/* Similar Products */}
        <ProductSimilar productId={params.id as string} />

        {/* Product Metadata */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations sur le produit
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.sku && (
              <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
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
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.sku}
                  </p>
                </div>
              </div>
            )}

            {product.scraped_at && (
              <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
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
                  <p className="text-xs text-gray-600 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(product.scraped_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
              <svg
                className="h-5 w-5 text-gray-600 dark:text-gray-400"
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
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Devise</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.currency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 PrixRadio - Comparateur de prix allemand</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
