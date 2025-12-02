import { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://preisradio.de';
const API_PATH = process.env.NEXT_PUBLIC_API_BASE || '/api';
const API_URL = `${API_BASE_URL}${API_PATH}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/kategorien`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/haendler`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Charger les produits pour ajouter leurs pages au sitemap
  try {
    const allProducts = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 500;

    // Paginer à travers tous les produits
    while (hasMore) {
      const response = await fetch(`${API_URL}/products/?page=${page}&page_size=${pageSize}`, {
        next: { revalidate: 86400 } // Cache 24h
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const products = data.results || [];

      if (products.length === 0) {
        hasMore = false;
        break;
      }

      allProducts.push(...products);

      // Vérifier s'il y a une page suivante
      if (!data.next) {
        hasMore = false;
      } else {
        page++;
      }
    }

    const productPages: MetadataRoute.Sitemap = allProducts.map((product: any) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Fallback to static pages only if API fails
    return staticPages;
  }
}
