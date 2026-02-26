import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';
import { generateOrganizationSchema } from '@/lib/schema';
import api from '@/lib/api';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  description: 'Vergleichen Sie Elektronik-Preise von Saturn, MediaMarkt, Otto und Kaufland in Echtzeit. Finden Sie täglich die besten Angebote und sparen Sie beim Shopping.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'de-DE': baseUrl,
      'x-default': baseUrl,
    },
  },
  other: {
    'verify-admitad': 'daf3c79d55',
  },
};

function HomeLoadingFallback() {
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

export default async function Home() {
  const organizationSchema = generateOrganizationSchema(baseUrl);

  // Fetch top categories + brands server-side for internal linking (SEO)
  const [categoriesRes, brandsRes] = await Promise.all([
    api.getCategories({ page_size: 12 }).catch(() => ({ results: [] as string[] })),
    api.getBrands({ page_size: 24 }).catch(() => ({ results: [] as string[] })),
  ]);

  const topCategories = categoriesRes.results || [];
  const topBrands = brandsRes.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Organization JSON-LD - Only on homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <Navigation />

      <main className="container mx-auto px-4 py-4">
        {/* H1 — signal SEO principal */}
        <h1 className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          Preisvergleich für Elektronik in Deutschland
        </h1>

        {/* Maillage interne — Top Kategorien (server-rendered, indexé par Google) */}
        {topCategories.length > 0 && (
          <nav aria-label="Top Kategorien" className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Top Kategorien
            </h2>
            <ul className="flex flex-wrap gap-2">
              {topCategories.map((cat) => {
                const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <li key={cat}>
                    <Link
                      href={`/kategorien/${slug}`}
                      className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Maillage interne — Top Marken (server-rendered, indexé par Google) */}
        {topBrands.length > 0 && (
          <nav aria-label="Top Marken" className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Top Marken
            </h2>
            <ul className="flex flex-wrap gap-2">
              {topBrands.map((brand) => {
                const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <li key={brand}>
                    <Link
                      href={`/marken/${slug}`}
                      className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      {brand}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <Suspense fallback={<HomeLoadingFallback />}>
          <HomeContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
