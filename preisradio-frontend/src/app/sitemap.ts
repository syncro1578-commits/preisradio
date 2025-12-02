import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';

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
      url: `${baseUrl}/marken`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
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

  try {
    const response = await fetch(
      `${API_URL}/products/sitemap/?limit=50000`,
      {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'Preisradio-SitemapGenerator/1.0' },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const products = data.results || [];

      if (products.length > 0) {
        const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: product.lastModified ? new Date(product.lastModified) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));

        return [...staticPages, ...productPages];
      }
    }
  } catch (error) {
    console.warn('Error fetching products for sitemap:', error);
  }

  return staticPages;
}
