import { Metadata } from 'next';
import api from '@/lib/api';
import BrandDetailClient from './BrandDetailClient';
import { Product } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const brandName = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1);

    // Optimize title to 50-60 chars: "{brandName} Produkte günstig kaufen | Preisradio"
    const title = `${brandName} Produkte günstig kaufen | Preisradio`;

    // Optimize description to 150-160 chars
    const description = `${brandName} Preisvergleich: Saturn, MediaMarkt & Otto. Finden Sie die besten Angebote für ${brandName} Elektronik und sparen Sie beim Online-Kauf.`;

    return {
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords: ['Preisvergleich', brandName, 'heise preisvergleich preisradio'],
      openGraph: {
        title: `${brandName} Produkte | Preisradio`,
        description: `Alle ${brandName} Produkte im Preisvergleich`,
        url: `${baseUrl}/marken/${resolvedParams.slug}`,
        type: 'website',
      },
      alternates: {
        canonical: `${baseUrl}/marken/${resolvedParams.slug}`,
        languages: {
          'de-DE': `${baseUrl}/marken/${resolvedParams.slug}`,
          'x-default': `${baseUrl}/marken/${resolvedParams.slug}`,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Marke | Preisradio',
      description: 'Markenprodukte auf Preisradio',
    };
  }
}

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch brand products server-side
  let products: Product[] = [];
  let brandName = '';

  try {
    const decodedSlug = decodeURIComponent(slug);

    // Try different brand name variations
    const brandVariations = [
      decodedSlug,
      decodedSlug.toUpperCase(),
      decodedSlug.toLowerCase(),
      decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).toLowerCase(),
    ];

    // Search for products with the brand name
    const response = await api.getProductsFromBothRetailers({
      search: decodedSlug,
      page_size: 100,
    });

    const allProducts = response?.results || [];

    // Filter products by brand
    const brandProducts = allProducts.filter((product) => {
      if (!product.brand) return false;

      const productBrand = product.brand.trim();
      const productSlug = productBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const slugMatches = productSlug === normalizedSlug;
      const exactMatch = brandVariations.some(variant =>
        productBrand.toLowerCase() === variant.toLowerCase()
      );

      return slugMatches || exactMatch;
    });

    products = brandProducts;

    if (brandProducts.length > 0) {
      brandName = brandProducts[0].brand || '';
    } else {
      brandName = decodedSlug.toUpperCase();
    }
  } catch (err) {
    console.error('Error fetching brand products:', err);
    brandName = decodeURIComponent(slug).toUpperCase();
  }

  return (
    <BrandDetailClient
      slug={slug}
      initialProducts={products}
      initialBrandName={brandName}
    />
  );
}
