import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/blog-db';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const baseUrl = 'https://preisradio.de';

  const articles = await getPublishedArticles().catch(() => []);

  const urlEntries = [
    `  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
    ...articles.map((a) => {
      const lastmod = a.date ? new Date(a.date).toISOString() : new Date().toISOString();
      return `  <url>
    <loc>${baseUrl}/blog/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
