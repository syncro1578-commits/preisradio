import Link from 'next/link';
import { Product } from '@/lib/types';

const API_URL = 'https://api.preisradio.de/api';

const RETAILER_LOGOS: Record<string, string> = {
  saturn: '/retailers/saturn.png',
  mediamarkt: '/retailers/mediamarkt.png',
  otto: '/retailers/otto.png',
  kaufland: '/retailers/kaufland.png',
};

const RETAILER_COLORS: Record<string, string> = {
  saturn: 'bg-blue-600 hover:bg-blue-700',
  mediamarkt: 'bg-red-600 hover:bg-red-700',
  otto: 'bg-rose-500 hover:bg-rose-600',
  kaufland: 'bg-red-700 hover:bg-red-800',
};

const RETAILER_LABEL: Record<string, string> = {
  saturn: 'Saturn',
  mediamarkt: 'MediaMarkt',
  otto: 'Otto',
  kaufland: 'Kaufland',
};

async function fetchProducts(keyword: string, pageSize = 8): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_URL}/products/?search=${encodeURIComponent(keyword)}&page_size=${pageSize}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
}

function discountPercent(price: number, oldPrice: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default async function BlogProductSection({
  keywords,
}: {
  keywords: string[];
}) {
  const searchTerm = keywords[0];
  if (!searchTerm) return null;

  const products = await fetchProducts(searchTerm, 8);
  if (products.length === 0) return null;

  const topProducts = products.slice(0, 4);
  const gridProducts = products.slice(4, 8);

  return (
    <div className="mt-10 space-y-10 not-prose">

      {/* ── Comparison Table ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-blue-600 flex-shrink-0" />
            Preisvergleich: {searchTerm}
          </h2>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{products.length} Angebote gefunden</span>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[46%]">
                  Produkt
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Preis
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Shop
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => {
                const isTop = idx === 0;
                const retailer = product.retailer || '';
                const hasDiscount = product.old_price && product.old_price > product.price;
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors ${
                      isTop
                        ? 'bg-blue-50/60 dark:bg-blue-950/20'
                        : 'hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {isTop && (
                          <span className="flex-shrink-0 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none">
                            TOP
                          </span>
                        )}
                        {product.image && (
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                            {product.title}
                          </p>
                          {product.brand && (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-center">
                      <p className="font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatPrice(product.price)}
                      </p>
                      {hasDiscount && (
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-400 line-through tabular-nums">
                            {formatPrice(product.old_price!)}
                          </span>
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                            -{discountPercent(product.price, product.old_price!)}%
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Retailer */}
                    <td className="px-4 py-3.5 text-center">
                      {RETAILER_LOGOS[retailer] ? (
                        <img
                          src={RETAILER_LOGOS[retailer]}
                          alt={RETAILER_LABEL[retailer] || retailer}
                          className="h-5 mx-auto object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 capitalize">{retailer}</span>
                      )}
                    </td>

                    {/* CTA */}
                    <td className="px-4 py-3.5 text-right">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                          RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Zum Shop
                        <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Preise inkl. MwSt. — täglich aktualisiert</p>
            <Link
              href="/kategorien"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Alle Preise vergleichen →
            </Link>
          </div>
        </div>

        {/* Mobile stacked cards */}
        <div className="sm:hidden space-y-3">
          {topProducts.map((product, idx) => {
            const isTop = idx === 0;
            const retailer = product.retailer || '';
            const hasDiscount = product.old_price && product.old_price > product.price;
            return (
              <div
                key={product.id}
                className={`rounded-xl border p-3 ${
                  isTop
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20'
                    : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {product.image && (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isTop && (
                      <span className="inline-block text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none mb-1">
                        TOP
                      </span>
                    )}
                    <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {product.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                          -{discountPercent(product.price, product.old_price!)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={`mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                    RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {RETAILER_LOGOS[retailer] && (
                    <img
                      src={RETAILER_LOGOS[retailer]}
                      alt={RETAILER_LABEL[retailer] || retailer}
                      className="h-4 brightness-0 invert"
                    />
                  )}
                  Jetzt kaufen
                </a>
              </div>
            );
          })}

          <Link
            href="/kategorien"
            className="block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline py-1"
          >
            Alle Preise vergleichen →
          </Link>
        </div>
      </section>

      {/* ── Similar Products Grid ── */}
      {gridProducts.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            Ähnliche Produkte aus unseren Shops
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gridProducts.map((product) => {
              const retailer = product.retailer || '';
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group flex flex-col rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-50 dark:bg-zinc-800 relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-zinc-700">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.old_price && product.old_price > product.price && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                        -{discountPercent(product.price, product.old_price)}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug flex-1">
                      {product.title}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-1">
                      <span className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                      {RETAILER_LOGOS[retailer] && (
                        <img
                          src={RETAILER_LOGOS[retailer]}
                          alt={RETAILER_LABEL[retailer] || retailer}
                          className="h-3.5 object-contain flex-shrink-0"
                          style={{ maxWidth: '52px' }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/kategorien"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mehr Produkte entdecken →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
