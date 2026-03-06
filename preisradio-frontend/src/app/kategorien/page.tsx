import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12h ISR

// Top 20 curated categories
const FEATURED_CATEGORIES = [
  'Smartphones', 'Laptops', 'Fernseher', 'Kopfhörer', 'Tablets',
  'Waschmaschinen', 'Kühlschränke', 'Gaming', 'Kameras', 'Smartwatches',
  'Staubsauger', 'Drucker', 'Lautsprecher', 'Kaffeemaschinen',
  'Geschirrspüler', 'Monitore', 'Mikrowellen', 'Klimageräte',
  'E-Scooter', 'Haartrockner',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Alle Produktkategorien – Preisvergleich | Preisradio';
  const description = 'Entdecken Sie alle Produktkategorien im Preisvergleich: Smartphones, Laptops, Fernseher und mehr. Täglich günstigste Preise bei Saturn, MediaMarkt, Otto & Kaufland.';

  return {
    title,
    description,
    keywords: ['Preisvergleich', 'Kategorien', 'Saturn', 'MediaMarkt', 'Otto', 'Kaufland', 'günstig kaufen'],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/kategorien`,
      type: 'website',
      locale: 'de_DE',
      siteName: 'Preisradio',
    },
    alternates: {
      canonical: `${baseUrl}/kategorien`,
    },
  };
}

interface CategoryData {
  name: string;
  slug: string;
  count: number;
  image: string | null;
  topProducts: { title: string; price: number; brand: string }[];
  topBrands: string[];
}

async function fetchCategoryData(categoryName: string): Promise<CategoryData | null> {
  try {
    const response = await api.getProductsFromBothRetailers({
      category: categoryName,
      page_size: 10,
    });

    const products = response?.results || [];
    const count = response?.count || 0;
    if (count === 0) return null;

    // First product with an image
    const image = products.find((p: Product) => p.image)?.image || null;

    // Top 3 products by lowest price (with brand)
    const topProducts = products
      .filter((p: Product) => p.brand && p.price > 0)
      .sort((a: Product, b: Product) => a.price - b.price)
      .slice(0, 3)
      .map((p: Product) => ({
        title: p.title.length > 40 ? p.title.substring(0, 37) + '...' : p.title,
        price: p.price,
        brand: p.brand || '',
      }));

    // Top 3 brands by frequency
    const brandCounts: Record<string, number> = {};
    products.forEach((p: Product) => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => brand);

    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return { name: categoryName, slug, count, image, topProducts, topBrands };
  } catch {
    return null;
  }
}

export default async function KategorienPage() {
  // Fetch featured categories in parallel
  const categoryResults = await Promise.allSettled(
    FEATURED_CATEGORIES.map(cat => fetchCategoryData(cat))
  );

  const featuredData: CategoryData[] = categoryResults
    .filter((r): r is PromiseFulfilledResult<CategoryData | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((d): d is CategoryData => d !== null && d.count > 0);

  // Fetch all categories for the "Alle Kategorien" section
  let allCategories: string[] = [];
  try {
    const catResponse = await api.getCategories({ page_size: 1000 });
    allCategories = catResponse.results || [];
  } catch {
    // fallback
  }

  // Remaining categories (not in featured)
  const featuredNames = new Set(featuredData.map(d => d.name));
  const otherCategories = allCategories.filter(c => !featuredNames.has(c));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Kategorien', item: `${baseUrl}/kategorien` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Alle Produktkategorien
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {featuredData.length} Kategorien mit den besten Angeboten von Saturn, MediaMarkt, Otto & Kaufland
          </p>
        </div>

        {/* Featured Categories Grid — 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredData.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategorien/${cat.slug}`}
              className="group rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Category Image */}
              <div className="relative h-40 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl text-gray-300 dark:text-zinc-600">
                    📦
                  </div>
                )}
                {/* Count badge */}
                <span className="absolute top-3 right-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                  {cat.count.toLocaleString('de-DE')} Produkte
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h2>

                {/* Top 3 Products */}
                {cat.topProducts.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                      Top Produkte
                    </p>
                    <ul className="space-y-1">
                      {cat.topProducts.map((product, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 truncate mr-2">
                            {product.title}
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {product.price.toFixed(0)} €
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Top Brands */}
                {cat.topBrands.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Marken:
                    </span>
                    {cat.topBrands.map((brand, i) => (
                      <span
                        key={brand}
                        className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-3 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Alle Produkte ansehen
                  <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All Other Categories */}
        {otherCategories.length > 0 && (
          <section className="mt-12" aria-label="Alle weiteren Kategorien">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Alle weiteren Kategorien
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {otherCategories.map((cat) => {
                const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <Link
                    key={cat}
                    href={`/kategorien/${slug}`}
                    className="rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
