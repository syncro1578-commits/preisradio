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

    return {
      title: `${categoryName} | Preisradio`,
      description: `Alle ${categoryName} Produkte im Preisvergleich. Finden Sie die besten Angebote bei Saturn, MediaMarkt und Otto.`,
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

  try {
    const decodedSlug = decodeURIComponent(slug);

    // Convert slug to category name (reverse of slugify)
    const possibleCategoryNames = [
      decodedSlug.replace(/-/g, ' '),
      decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
    ];

    // Try to fetch products for this category
    const response = await api.getProductsFromBothRetailers({
      page_size: 100,
    });

    const allProducts = response?.results || [];

    // Filter products by category (match slug)
    const categoryProducts = allProducts.filter((product) => {
      if (!product.category) return false;

      const productCategorySlug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      return productCategorySlug === normalizedSlug;
    });

    products = categoryProducts;

    if (categoryProducts.length > 0) {
      categoryName = categoryProducts[0].category || '';
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
    />
  );
}
