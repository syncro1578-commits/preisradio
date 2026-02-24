import { Metadata } from 'next';
import api from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';
import { Product } from '@/lib/types';
import { generateItemListSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12 hours

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const categoryName = decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const title = `${categoryName} günstig kaufen – Preisvergleich | Preisradio`;
    const description = `${categoryName} im Preisvergleich: Saturn, MediaMarkt, Otto & Kaufland. Finden Sie täglich die günstigsten ${categoryName}-Angebote und sparen Sie beim Online-Kauf.`;

    const keywords = [
      `${categoryName} kaufen`,
      `${categoryName} günstig`,
      `${categoryName} Preisvergleich`,
      `${categoryName} Angebot`,
      `${categoryName} Saturn MediaMarkt`,
      `günstige ${categoryName}`,
      'Preisradio',
    ];

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/kategorien/${resolvedParams.slug}`,
        type: 'website',
        locale: 'de_DE',
        siteName: 'Preisradio',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
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

  let products: Product[] = [];
  let categoryName = '';
  let totalProductsCount = 0;

  try {
    const decodedSlug = decodeURIComponent(slug);

    const categoriesResponse = await api.getCategories({ page_size: 1000 });
    const allCategories = categoriesResponse.results || [];

    const matchingCategory = allCategories.find(cat => {
      const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return catSlug === normalizedSlug;
    });

    if (matchingCategory) {
      categoryName = matchingCategory;

      const response = await api.getProductsFromBothRetailers({
        category: categoryName,
        page_size: 100,
      });

      products = response?.results || [];
      totalProductsCount = response?.count || 0;
    } else {
      categoryName = decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  } catch (err) {
    console.error('Error fetching category products:', err);
    categoryName = decodeURIComponent(slug).replace(/-/g, ' ');
  }

  const itemListSchema = products.length > 0
    ? generateItemListSchema(products, categoryName, baseUrl)
    : null;

  return (
    <>
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <CategoryDetailClient
        slug={slug}
        initialProducts={products}
        initialCategoryName={categoryName}
        totalProductsCount={totalProductsCount}
      />
    </>
  );
}