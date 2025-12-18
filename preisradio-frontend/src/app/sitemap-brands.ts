import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

// Brands sitemap - extracts unique brands from all products
export default async function sitemapBrands(): Promise<MetadataRoute.Sitemap> {
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

    // Extract unique brands
    const uniqueBrands = new Map<string, any>();
    allProducts.forEach((product: any) => {
      if (product.brand) {
        const slug = product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (!uniqueBrands.has(slug)) {
          uniqueBrands.set(slug, {
            slug,
            name: product.brand,
            lastModified: product.scraped_at || new Date(),
          });
        }
      }
    });

    // Generate brand pages
    const brandPages: MetadataRoute.Sitemap = Array.from(uniqueBrands.values()).map((brand) => ({
      url: `${baseUrl}/marken/${encodeURIComponent(brand.slug)}`,
      lastModified: new Date(brand.lastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    console.log(`✓ Generated ${brandPages.length} brand URLs for sitemap`);
    return brandPages;
  } catch (error) {
    console.error('Error fetching brands for sitemap:', error);
    return [];
  }
}
