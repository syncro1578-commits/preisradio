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

    // First, get all brands to find the exact brand name
    const brandsResponse = await api.getBrands({ page_size: 1000 });
    const allBrands = brandsResponse.results || [];

    // Find the matching brand by slug
    const matchingBrand = allBrands.find(b => {
      const brandSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return brandSlug === normalizedSlug;
    });

    if (matchingBrand) {
      brandName = matchingBrand;

      // Fetch products using the exact brand name via brand parameter
      const response = await api.getProductsFromBothRetailers({
        brand: brandName,
        page_size: 100,
      });

      products = response?.results || [];
    } else {
      // Fallback to formatted slug
      brandName = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).toLowerCase();
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
