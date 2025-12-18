import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

// Products sitemap - fetches all products from all retailers
export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';

  try {
    // Fetch 10000 products from each retailer in parallel (30000 total)
    const [saturnResponse, mediamarktResponse, ottoResponse] = await Promise.all([
      fetch(`${API_URL}/products/?page_size=10000&retailer=saturn`, {
        next: { revalidate: 86400 }, // Cache for 24 hours
        headers: { 'User-Agent': 'Preisradio-SitemapGenerator/1.0' },
      }),
      fetch(`${API_URL}/products/?page_size=10000&retailer=mediamarkt`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'Preisradio-SitemapGenerator/1.0' },
      }),
      fetch(`${API_URL}/products/?page_size=10000&retailer=otto`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'Preisradio-SitemapGenerator/1.0' },
      }),
    ]);

    // Combine products from all retailers
    const allProducts: any[] = [];

    if (saturnResponse.ok) {
      const data = await saturnResponse.json();
      allProducts.push(...(data.results || []));
    }
    if (mediamarktResponse.ok) {
      const data = await mediamarktResponse.json();
      allProducts.push(...(data.results || []));
    }
    if (ottoResponse.ok) {
      const data = await ottoResponse.json();
      allProducts.push(...(data.results || []));
    }

    // Generate product pages
    const productPages: MetadataRoute.Sitemap = allProducts.map((product: any) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    console.log(`✓ Generated ${productPages.length} product URLs for sitemap`);
    return productPages;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}
