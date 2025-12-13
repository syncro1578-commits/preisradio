import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://preisradio.de';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/_vercel/',
          '/*?*',
          '/*.js$',
          '/*.css$',
          '/*.json$',
          '/*.map$',
          '/*.txt$',
          '/*.xml$',
          '/*.ico$',
          '/*.svg$',
          '/*.png$',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.gif$',
          '/*.webp$',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/_vercel/',
          '/*?*',
          '/*.js$',
          '/*.css$',
          '/*.json$',
          '/*.map$',
          '/*.txt$',
          '/*.xml$',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/_vercel/',
          '/*?*',
          '/*.js$',
          '/*.css$',
          '/*.json$',
          '/*.map$',
          '/*.txt$',
          '/*.xml$',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
