import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

// Categories sitemap - extracts unique categories from all products
export default async function sitemapCategories(): Promise<MetadataRoute.Sitemap> {
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

    // Extract unique categories
    const uniqueCategories = new Map<string, any>();
    allProducts.forEach((product: any) => {
      if (product.category) {
        const slug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (!uniqueCategories.has(slug)) {
          uniqueCategories.set(slug, {
            slug,
            name: product.category,
            lastModified: product.scraped_at || new Date(),
          });
        }
      }
    });

    // Generate category pages
    const categoryPages: MetadataRoute.Sitemap = Array.from(uniqueCategories.values()).map((category) => ({
      url: `${baseUrl}/kategorien/${encodeURIComponent(category.slug)}`,
      lastModified: new Date(category.lastModified),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    console.log(`✓ Generated ${categoryPages.length} category URLs for sitemap`);
    return categoryPages;
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}
