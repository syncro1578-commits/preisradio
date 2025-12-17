import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';

  // Static pages (no search page - it's for internal use only)
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

  try {
    // Fetch 10000 products from each retailer in parallel (30000 total)
    const [saturnResponse, mediamarktResponse, ottoResponse] = await Promise.all([
      fetch(`${API_URL}/products/?page_size=10000&retailer=saturn`, {
        next: { revalidate: 86400 },
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

    let productPages: MetadataRoute.Sitemap = [];
    let brandPages: MetadataRoute.Sitemap = [];
    let categoryPages: MetadataRoute.Sitemap = [];

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

    if (allProducts.length > 0) {
      const products = allProducts;

      // Use all fetched products (max 30000 from 3 retailers)
      const limitedProducts = products;

        // Generate product pages
        productPages = limitedProducts.map((product: any) => ({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));

        // Extract unique brands and create brand pages
        const uniqueBrands = new Map<string, any>();
        products.forEach((product: any) => {
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

        brandPages = Array.from(uniqueBrands.values()).map((brand) => ({
          url: `${baseUrl}/marken/${encodeURIComponent(brand.slug)}`,
          lastModified: new Date(brand.lastModified),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

        // Extract unique categories and create category pages
        const uniqueCategories = new Map<string, any>();
        products.forEach((product: any) => {
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

        categoryPages = Array.from(uniqueCategories.values()).map((category) => ({
          url: `${baseUrl}/kategorien/${encodeURIComponent(category.slug)}`,
          lastModified: new Date(category.lastModified),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
    }

    // Combine all URLs and respect 50000 URL limit
    const allUrls = [...staticPages, ...brandPages, ...categoryPages, ...productPages];

    // Google sitemap limit is 50000 URLs
    if (allUrls.length > 50000) {
      console.warn(`Sitemap has ${allUrls.length} URLs, limiting to 50000`);
      return allUrls.slice(0, 50000);
    }

    return allUrls;
  } catch (error) {
    console.warn('Error fetching products for sitemap:', error);
  }

  return staticPages;
}
