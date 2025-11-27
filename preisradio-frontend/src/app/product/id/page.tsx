'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import PriceComparison from '@/components/PriceComparison';
import ProductSimilar from '@/components/ProductSimilar';

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

  const lowestPrice = product.prices.length > 0
    ? Math.min(...product.prices.map(p => p.price))
    : null;

  const highestPrice = product.prices.length > 0
    ? Math.max(...product.prices.map(p => p.price))
    : null;

  const averagePrice = product.prices.length > 0
    ? product.prices.reduce((acc, p) => acc + p.price, 0) / product.prices.length
    : null;

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
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        {/* Product Info */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
            <div className="flex h-96 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
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
            {/* Category */}
            <div>
              <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            )}

            {/* EAN */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Code EAN</p>
              <p className="mt-1 font-mono text-lg font-semibold text-gray-900 dark:text-white">
                {product.ean}
              </p>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <p className="text-xs text-gray-600 dark:text-gray-400">Prix le plus bas</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {lowestPrice !== null ? `${lowestPrice.toFixed(2)} €` : 'N/A'}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-xs text-gray-600 dark:text-gray-400">Prix moyen</p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {averagePrice !== null ? `${averagePrice.toFixed(2)} €` : 'N/A'}
                </p>
              </div>

              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950">
                <p className="text-xs text-gray-600 dark:text-gray-400">Prix le plus haut</p>
                <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {highestPrice !== null ? `${highestPrice.toFixed(2)} €` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Savings */}
            {lowestPrice !== null && highestPrice !== null && lowestPrice !== highestPrice && (
              <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Économisez jusqu'à</p>
                    <p className="mt-1 text-3xl font-bold">
                      {(highestPrice - lowestPrice).toFixed(2)} €
                    </p>
                    <p className="mt-1 text-sm opacity-90">
                      soit {(((highestPrice - lowestPrice) / highestPrice) * 100).toFixed(0)}% de réduction
                    </p>
                  </div>
                  <svg
                    className="h-16 w-16 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Comparison */}
        <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          <PriceComparison prices={product.prices} />
        </div>

        {/* Similar Products */}
        <ProductSimilar productId={params.id as string} />

        {/* Product Metadata */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations sur le produit
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Ajouté le</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(product.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mis à jour le</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(product.updated_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vendeurs disponibles</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.prices.length} {product.prices.length > 1 ? 'vendeurs' : 'vendeur'}
                </p>
              </div>
            </div>

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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">En stock</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.prices.filter(p => p.stock_status === 'in_stock').length} / {product.prices.length}
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
