import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import api from '@/lib/api';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await api.getProduct(resolvedParams.id);

    return {
      title: `${product.title} | Preisradio`,
      description: `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}. Vergleichen Sie Preise bei ${product.retailer === 'saturn' ? 'Saturn' : product.retailer === 'mediamarkt' ? 'MediaMarkt' : 'Otto'}.`,
      openGraph: {
        title: `${product.title} | Preisradio`,
        description: `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}`,
        images: [{ url: product.image || `${baseUrl}/favicon.ico` }],
        url: `${baseUrl}/product/${resolvedParams.id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${product.title} | Preisradio`,
        description: `${product.title} - Preis: ${product.price.toFixed(2)} ${product.currency}`,
        images: [product.image || `${baseUrl}/favicon.ico`],
      },
      alternates: {
        canonical: `${baseUrl}/product/${resolvedParams.id}`,
        languages: {
          'de-DE': `${baseUrl}/product/${resolvedParams.id}`,
          'x-default': `${baseUrl}/product/${resolvedParams.id}`,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Produkt | Preisradio',
      description: 'Produktdetails auf Preisradio',
    };
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProductDetailClient productId={resolvedParams.id} />;
}
