import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

// Generate multiple sitemaps: static, products, brands, categories
export async function generateSitemaps() {
  return [
    { id: 'static' },
    { id: 'products' },
    { id: 'brands' },
    { id: 'categories' },
  ];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';

  // Static pages sitemap
  if (id === 'static') {
    return [
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
        url: `${baseUrl}/marken`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
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
  }

  // Fetch products from all retailers
  try {
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

    // Products sitemap
    if (id === 'products') {
      const productPages = allProducts.map((product: any) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

      console.log(`✓ Generated products sitemap with ${productPages.length} URLs`);
      return productPages;
    }

    // Brands sitemap
    if (id === 'brands') {
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

      const brandPages = Array.from(uniqueBrands.values()).map((brand) => ({
        url: `${baseUrl}/marken/${encodeURIComponent(brand.slug)}`,
        lastModified: new Date(brand.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      console.log(`✓ Generated brands sitemap with ${brandPages.length} URLs`);
      return brandPages;
    }

    // Categories sitemap
    if (id === 'categories') {
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

      const categoryPages = Array.from(uniqueCategories.values()).map((category) => ({
        url: `${baseUrl}/kategorien/${encodeURIComponent(category.slug)}`,
        lastModified: new Date(category.lastModified),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));

      console.log(`✓ Generated categories sitemap with ${categoryPages.length} URLs`);
      return categoryPages;
    }
  } catch (error) {
    console.error(`Error generating sitemap for ${id}:`, error);
  }

  return [];
}
