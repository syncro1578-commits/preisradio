import { Metadata } from 'next';
import api from '@/lib/api';
import BrandDetailClient from './BrandDetailClient';
import { Product } from '@/lib/types';
import { generateItemListSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12 hours

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const brandName = decodedSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const title = `${brandName} günstig kaufen – Preisvergleich Saturn, MediaMarkt & mehr | Preisradio`;
    const description = `${brandName} Produkte im Preisvergleich: Saturn, MediaMarkt, Otto und Kaufland. Finden Sie täglich die günstigsten ${brandName} Angebote und sparen Sie beim Online-Kauf.`;

    const keywords = [
      `${brandName} günstig kaufen`,
      `${brandName} Preisvergleich`,
      `${brandName} Angebote`,
      `${brandName} Saturn MediaMarkt`,
      `${brandName} online kaufen`,
      `günstige ${brandName} Produkte`,
      'Preisradio',
    ];

    return {
      title: title.length > 70 ? title.substring(0, 67) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      openGraph: {
        title: `${brandName} Produkte günstig | Preisradio`,
        description: `${brandName} im Preisvergleich – täglich günstigste Preise bei Saturn, MediaMarkt, Otto & Kaufland.`,
        url: `${baseUrl}/marken/${resolvedParams.slug}`,
        type: 'website',
        locale: 'de_DE',
        siteName: 'Preisradio',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${brandName} günstig kaufen | Preisradio`,
        description: `${brandName} im Preisvergleich – täglich aktuell auf Preisradio.`,
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

  let products: Product[] = [];
  let brandName = '';

  try {
    const decodedSlug = decodeURIComponent(slug);
    const searchTerm = decodedSlug.replace(/-/g, ' ');

    const brandsResponse = await api.getBrands({ search: searchTerm, page_size: 50 });
    const matchingBrands = brandsResponse.results || [];

    const matchingBrand = matchingBrands.find(b => {
      const brandSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return brandSlug === normalizedSlug;
    });

    if (matchingBrand) {
      brandName = matchingBrand;

      const response = await api.getProductsFromBothRetailers({
        brand: brandName,
        page_size: 100,
      });

      products = response?.results || [];
    } else {
      brandName = searchTerm
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  } catch (err) {
    console.error('Error fetching brand products:', err);
    brandName = decodeURIComponent(slug).toUpperCase();
  }

  const itemListSchema = products.length > 0
    ? generateItemListSchema(products, brandName, baseUrl)
    : null;

  return (
    <>
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <BrandDetailClient
        slug={slug}
        initialProducts={products}
        initialBrandName={brandName}
      />
    </>
  );
}
