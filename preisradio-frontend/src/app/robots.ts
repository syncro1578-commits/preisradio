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
        ],
        disallow: [
          '/api/',
          '/admin/',
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
