import { MetadataRoute } from 'next';

// Main sitemap index that references all sub-sitemaps
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://preisradio.de';

  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-products.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-brands.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-categories.xml`,
      lastModified: new Date(),
    },
  ];
}
