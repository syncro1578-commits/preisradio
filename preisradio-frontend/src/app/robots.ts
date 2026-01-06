import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://preisradio.de';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/*.js$',
          '/*.css$',
          '/*.xml$',
          '/sitemap.xml',
          '/favicon.ico',     // Allow favicon with or without query parameters
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/search*',  // Block all search URLs with query parameters
          '/*?*',      // Block all URLs with query parameters (search, filters, etc.)
          '/_next/static/*/pages/_app*.js',
          '/_next/static/*/pages/_error*.js',
          '/*.json$',
          '/*.map$',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
