import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12h ISR

// Priority order for categories (shown first in grid)
const PRIORITY_CATEGORIES = [
  'Smartphones', 'Laptops', 'Fernseher', 'Kopfhörer', 'Tablets',
  'Waschmaschinen', 'Kühlschränke', 'Gaming', 'Kameras', 'Smartwatches',
  'Staubsauger', 'Drucker', 'Lautsprecher', 'Kaffeemaschinen',
  'Geschirrspüler', 'Monitore', 'Mikrowellen', 'Klimageräte',
  'E-Scooter', 'Haartrockner',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Alle Kategorien – Preisvergleich | Preisradio';
  const description = 'Alle Produktkategorien im Preisvergleich entdecken: Smartphones, Laptops, Fernseher, Haushaltsgeräte und mehr. Täglich aktualisierte Preise und Top-Angebote.';

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
  topProducts: { id: string; title: string; price: number; brand: string }[];
  topBrands: { name: string; slug: string }[];
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

    // Top 3 products by lowest price (with brand + id for links)
    const topProducts = products
      .filter((p: Product) => p.brand && p.price > 0)
      .sort((a: Product, b: Product) => a.price - b.price)
      .slice(0, 3)
      .map((p: Product) => ({
        id: p.id,
        title: p.title.length > 40 ? p.title.substring(0, 37) + '...' : p.title,
        price: p.price,
        brand: p.brand || '',
      }));

    // Top 3 brands by frequency (with slug for links)
    const brandCounts: Record<string, number> = {};
    products.forEach((p: Product) => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => ({
        name: brand,
        slug: brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));

    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return { name: categoryName, slug, count, image, topProducts, topBrands };
  } catch {
    return null;
  }
}

export default async function KategorienPage() {
  // Fetch all categories from API
  let allCategories: string[] = [];
  try {
    const catResponse = await api.getCategories({ page_size: 1000 });
    allCategories = catResponse.results || [];
  } catch {
    allCategories = PRIORITY_CATEGORIES; // fallback
  }

  // Sort: priority categories first, then the rest alphabetically
  const prioritySet = new Set(PRIORITY_CATEGORIES);
  const sortedCategories = [
    ...PRIORITY_CATEGORIES.filter(c => allCategories.includes(c)),
    ...allCategories.filter(c => !prioritySet.has(c)).sort((a, b) => a.localeCompare(b, 'de')),
  ];

  // Fetch data for all categories in parallel
  const categoryResults = await Promise.allSettled(
    sortedCategories.map(cat => fetchCategoryData(cat))
  );

  const categoriesData: CategoryData[] = categoryResults
    .filter((r): r is PromiseFulfilledResult<CategoryData | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((d): d is CategoryData => d !== null && d.count > 0);

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
            Alle Kategorien
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {categoriesData.length} Kategorien mit täglich aktualisierten Preisen und Top-Angeboten
          </p>
        </div>

        {/* Categories Grid — 2 mobile / 3 tablet / 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {categoriesData.map((cat) => (
            <div
              key={cat.slug}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image area with gradient overlay — links to category */}
              <Link href={`/kategorien/${cat.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl text-gray-200 dark:text-zinc-700">
                      📦
                    </div>
                  )}
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90" />

                  {/* Category name overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {cat.name}
                    </h2>
                  </div>
                </div>
              </Link>

              {/* Content below image */}
              <div className="px-3 md:px-4 pb-3 md:pb-4 -mt-1">
                {/* Top Brands — clickable links */}
                {cat.topBrands.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {cat.topBrands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/marken/${brand.slug}`}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Top products — clickable links */}
                {cat.topProducts.length > 0 && (
                  <ul className="space-y-1">
                    {cat.topProducts.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          className="flex items-center justify-between text-xs md:text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                            {product.title}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ab {product.price.toFixed(0)} €
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
