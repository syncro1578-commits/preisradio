import { Metadata } from 'next';
import api from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';
import { Product } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    // Convert slug back to readable category name
    const categoryName = decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Optimize title to 50-60 chars: "{categoryName} günstig kaufen – Reduzierte Angebote"
    const title = `${categoryName} günstig kaufen – Reduzierte Angebote`;

    return {
      title,
      description: `${categoryName} Preisvergleich: Saturn, MediaMarkt & Otto. Finden Sie die besten Angebote für ${categoryName} und sparen Sie beim Online-Kauf.`,
      keywords: ['Preisvergleich', categoryName, 'heise preisvergleich preisradio'],
      openGraph: {
        title: `${categoryName} | Preisradio`,
        description: `Alle ${categoryName} Produkte im Preisvergleich`,
        url: `${baseUrl}/kategorien/${resolvedParams.slug}`,
        type: 'website',
      },
      alternates: {
        canonical: `${baseUrl}/kategorien/${resolvedParams.slug}`,
        languages: {
          'de-DE': `${baseUrl}/kategorien/${resolvedParams.slug}`,
          'x-default': `${baseUrl}/kategorien/${resolvedParams.slug}`,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Kategorie | Preisradio',
      description: 'Kategorieprodukte auf Preisradio',
    };
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch category products server-side
  let products: Product[] = [];
  let categoryName = '';
  let totalProductsCount = 0;

  try {
    const decodedSlug = decodeURIComponent(slug);

    // First, get all categories to find the exact category name
    const categoriesResponse = await api.getCategories({ page_size: 1000 });
    const allCategories = categoriesResponse.results || [];

    // Find the matching category by slug
    const matchingCategory = allCategories.find(cat => {
      const catSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return catSlug === normalizedSlug;
    });

    if (matchingCategory) {
      categoryName = matchingCategory.name;
      totalProductsCount = matchingCategory.count;

      // Fetch products using the exact category name
      const response = await api.getProductsFromBothRetailers({
        category: categoryName,
        page_size: 100,
      });

      products = response?.results || [];
    } else {
      // Fallback to formatted slug
      categoryName = decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  } catch (err) {
    console.error('Error fetching category products:', err);
    categoryName = decodeURIComponent(slug).replace(/-/g, ' ');
  }

  return (
    <CategoryDetailClient
      slug={slug}
      initialProducts={products}
      initialCategoryName={categoryName}
      totalProductsCount={totalProductsCount}
    />
  );
}
