import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import api from '@/lib/api';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await api.getProduct(resolvedParams.id);

    // Get brand name for keywords
    const brandName = product.brand || product.category || 'Produkt';

    // Optimize title to 50-60 chars - Use product title directly
    const title = product.title.length > 50
      ? `${product.title.substring(0, 47)}...`
      : product.title;

    // Optimize description to 150-160 chars
    const retailerName = product.retailer === 'saturn' ? 'Saturn' : product.retailer === 'mediamarkt' ? 'MediaMarkt' : product.retailer === 'kaufland' ? 'Kaufland' : 'Otto';
    const description = `${product.title.substring(0, 80)} bei ${retailerName}. Preis: ${product.price.toFixed(2)} ${product.currency}. Jetzt Preise vergleichen!`;

    // Keywords: ['Preisvergleich brandName', 'brandName Produkt', 'toppreise brandName Produkt']
    const keywords = [
      `Preisvergleich ${brandName}`,
      `${brandName} Produkt`,
      `toppreise ${brandName} Produkt`
    ];

    return {
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
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

  // Fetch product server-side for SSR and JSON-LD
  let product = null;
  let productSchema = null;
  let breadcrumbSchema = null;
  let error = null;

  try {
    product = await api.getProduct(resolvedParams.id);
    productSchema = generateProductSchema(product, baseUrl);
    breadcrumbSchema = generateBreadcrumbSchema(product, baseUrl);
  } catch (err) {
    console.error('Error fetching product:', err);
    error = 'Fehler beim Laden des Produkts';
  }

  return (
    <>
      {/* JSON-LD schemas - Server-side rendered */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      )}
      {/* Pass server-fetched data to client component */}
      <ProductDetailClient
        productId={resolvedParams.id}
        initialProduct={product}
        initialError={error}
      />
    </>
  );
}
