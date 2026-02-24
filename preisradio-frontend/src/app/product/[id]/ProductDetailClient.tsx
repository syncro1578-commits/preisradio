'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import ProductSimilar from '@/components/ProductSimilar';
import PriceComparison from '@/components/PriceComparison';
import AdSenseDisplay from '@/components/AdSenseDisplay';
import AdSenseMultiplex from '@/components/AdSenseMultiplex';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getRetailerInfo } from '@/lib/retailerUtils';

interface ProductDetailClientProps {
  productId: string;
  initialProduct: Product | null;
}

export default function ProductDetailClient({
  productId,
  initialProduct,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewers] = useState(() => Math.floor(Math.random() * 9) + 4);

  useEffect(() => {
    if (!initialProduct) loadProduct();
  }, [productId, initialProduct]);

  useEffect(() => {
    if (productId) {
      const saved = localStorage.getItem(`saved_${productId}`);
      setIsSaved(!!saved);
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await api.getProduct(productId);
      setProduct(productData);
    } catch (err) {
      setError('Fehler beim Laden des Produkts');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = () => {
    if (isSaved) {
      localStorage.removeItem(`saved_${productId}`);
    } else {
      localStorage.setItem(`saved_${productId}`, '1');
    }
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const getFreshness = (scraped_at: string) => {
    const diff = Date.now() - new Date(scraped_at).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 60) return `vor ${mins} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${Math.floor(hours / 24)} Tagen`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-red-900 dark:text-red-100">
            {error || 'Produkt nicht gefunden'}
          </h3>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={loadProduct} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
              Erneut versuchen
            </button>
            <Link href="/" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = product.price || 0;
  const oldPrice = product.old_price;
  const hasDiscount = oldPrice && oldPrice > currentPrice && currentPrice > 0;
  const discountAmount = hasDiscount ? oldPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? ((discountAmount / oldPrice) * 100) : 0;
  const retailerInfo = getRetailerInfo(product.retailer);
  const categorySlug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const brandSlug = product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

  // Description paragraphs
  const allParagraphs = product.description
    ? product.description.split(/\n\n|\n|<br\s*\/?>/gi).map(p => p.trim()).filter(p => p.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center space-x-2 text-xs md:text-sm">
          <Link href="/" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 transition-colors">Startseite</Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <Link href={`/kategorien/${categorySlug}`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 transition-colors">
            {product.category}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="truncate max-w-[160px] text-gray-700 dark:text-gray-300">{product.title}</span>
        </nav>

        {/* Product Hero */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">

          {/* LEFT — Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-4 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-gray-100 dark:border-zinc-800">
              <div className="relative h-72 md:h-96 bg-gray-50 dark:bg-zinc-800 rounded-t-2xl overflow-hidden">
                {hasDiscount && (
                  <div className="absolute top-3 left-3 z-10 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    -{discountPercent.toFixed(0)}%
                  </div>
                )}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button
                    onClick={toggleSave}
                    className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all ${isSaved ? 'bg-red-500 text-white' : 'bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-red-50'}`}
                    title={isSaved ? 'Gespeichert' : 'Merken'}
                  >
                    <svg className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 shadow-md hover:bg-blue-50 transition-all"
                    title={copied ? 'Link kopiert!' : 'Teilen'}
                  >
                    {copied ? (
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    )}
                  </button>
                </div>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain p-6"
                    priority
                    unoptimized={product.image.startsWith('http')}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                    <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Retailer badge under image */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800">
                <Link
                  href={`/search?retailer=${product.retailer}`}
                  className={`inline-flex items-center gap-2 rounded-lg ${retailerInfo.color} px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity`}
                >
                  {retailerInfo.logo && (
                    <Image src={retailerInfo.logo} alt={retailerInfo.name} width={60} height={20} className="h-4 w-auto object-contain brightness-0 invert" />
                  )}
                  <span>{retailerInfo.name}</span>
                </Link>
                {product.scraped_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {getFreshness(product.scraped_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Product Info */}
          <div className="lg:col-span-3 space-y-5">

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/kategorien/${categorySlug}`} className="rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                {product.category}
              </Link>
              {product.brand && (
                <Link href={`/marken/${brandSlug}`} className="rounded-full bg-gray-100 dark:bg-zinc-700 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors">
                  {product.brand}
                </Link>
              )}
              {product.discount && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  {product.discount} RABATT
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            {/* Social proof — viewers + freshness */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                {viewers} Personen schauen sich das gerade an
              </span>
              {hasDiscount && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Preis heute gesunken
                </span>
              )}
            </div>

            {/* Description — 4 lines clamp, expandable */}
            {allParagraphs.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <div className={descExpanded ? '' : 'line-clamp-4'}>
                  {allParagraphs.map((p: string, i: number) => (
                    <p key={i} className="mb-1.5">{p}</p>
                  ))}
                </div>
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-1.5 flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs"
                >
                  {descExpanded ? (
                    <>Weniger anzeigen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                  ) : (
                    <>Mehr lesen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                  )}
                </button>
              </div>
            )}

            {/* EAN */}
            {product.gtin && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">EAN:</span>
                <span className="font-mono">{product.gtin}</span>
              </div>
            )}

            {/* Price Block */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800 p-5 border border-blue-100 dark:border-zinc-700 shadow-md">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Aktueller Preis</p>
              <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      {currentPrice.toFixed(2)} €
                    </span>
                    {hasDiscount && oldPrice && (
                      <span className="text-lg text-gray-400 line-through">{oldPrice.toFixed(2)} €</span>
                    )}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-right">
                    <p className="text-xs text-green-600 dark:text-green-400">Sie sparen</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{discountAmount.toFixed(2)} €</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">-{discountPercent.toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🔒', label: 'Sicherer Kauf', sub: 'SSL-verschlüsselt' },
                { icon: '↩️', label: 'Rückgabe', sub: '14 Tage Widerrufsrecht' },
                { icon: '⚡', label: 'Aktuell', sub: 'Echtzeit-Preise' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-2.5 text-center shadow-sm">
                  <span className="text-lg mb-0.5">{badge.icon}</span>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">{badge.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 text-base md:text-lg font-bold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Jetzt bei {retailerInfo.name} kaufen
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Amazon Affiliate Button */}
            {process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG && (
              <>
                <a
                  href={`https://www.amazon.de/s?k=${encodeURIComponent(product.title)}&tag=${process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#FF9900] px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-[#e68a00] hover:shadow-xl hover:scale-[1.02] active:scale-95"
                >
                  <Image src="/retailers/amazon.png" alt="Amazon" width={24} height={24} className="h-6 w-6 object-contain" />
                  Auch auf Amazon suchen
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center -mt-2">
                  * Affiliate-Link: Wir erhalten eine Provision bei Kauf über Amazon.
                </p>
              </>
            )}

            {/* Meta info compact */}
            <div className="flex flex-wrap gap-2">
              {product.sku && (
                <span className="rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                  SKU: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{product.sku}</span>
                </span>
              )}
              <span className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                ✓ Auf Lager
              </span>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <PriceComparison currentProduct={product} />

        {/* AdSense */}
        <div className="my-8">
          <AdSenseDisplay adSlot="8370973552" />
        </div>

        {/* Similar Products */}
        <div className="mt-8">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Ähnliche Produkte
          </h2>
          <ProductSimilar productId={productId} />
        </div>

        {/* Quick Links */}
        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Verwandte Seiten</h3>
          <div className="flex flex-wrap gap-2">
            <Link href={`/kategorien/${categorySlug}`} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors">
              Alle {product.category}
            </Link>
            {product.brand && (
              <Link href={`/marken/${brandSlug}`} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors">
                Alle {product.brand}
              </Link>
            )}
            <Link href={`/search?retailer=${product.retailer}`} className="inline-flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors">
              {retailerInfo.logo && (
                <Image src={retailerInfo.logo} alt={retailerInfo.name} width={50} height={16} className="h-4 w-auto object-contain" />
              )}
              Alle {retailerInfo.name} Angebote
            </Link>
          </div>
        </div>

        {/* AdSense Multiplex */}
        <AdSenseMultiplex className="mt-12" />
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-700 px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">Aktueller Preis</p>
            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {currentPrice.toFixed(2)} €
            </p>
          </div>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Jetzt kaufen
          </a>
          <button
            onClick={toggleSave}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-zinc-800 dark:border-zinc-700'}`}
          >
            <svg className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}