import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.preisradio.de';

/**
 * Génère les métadonnées dynamiques pour les pages produits
 * Cela aide Google à détecter les schémas JSON-LD lors du crawl
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;

    // Récupérer les données du produit depuis l'API
    const response = await fetch(`${apiUrl}/api/products/${id}/`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Produkt | Preisradio',
        description: 'Finden Sie die besten Preise auf Preisradio',
      };
    }

    const product = await response.json();

    const title = `${product.title} | Preisradio`;
    const description = `${product.title} - Preis: ${product.price?.toFixed(2) || '0.00'} ${product.currency || 'EUR'}. Vergleichen Sie Preise bei ${
      product.retailer === 'saturn' ? 'Saturn' : 'MediaMarkt'
    }.`;
    const image = product.image || `${baseUrl}/default-product.jpg`;
    const productUrl = `${baseUrl}/product/${id}`;

    return {
      title: title,
      description: description,
      keywords: [
        product.title,
        product.brand || '',
        product.category || '',
        'Preisvergleich',
        'Preisradio',
        'Saturn',
        'MediaMarkt',
      ].filter(Boolean),
      authors: [{ name: 'Preisradio' }],
      openGraph: {
        type: 'product',
        url: productUrl,
        title: title,
        description: description,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
        locale: 'de_DE',
        siteName: 'Preisradio',
      },
      twitter: {
        card: 'product',
        title: title,
        description: description,
        images: [image],
      },
      alternates: {
        canonical: productUrl,
        languages: {
          'de-DE': productUrl,
          'x-default': productUrl,
        },
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Produkt | Preisradio',
      description: 'Finden Sie die besten Preise auf Preisradio',
    };
  }
}
