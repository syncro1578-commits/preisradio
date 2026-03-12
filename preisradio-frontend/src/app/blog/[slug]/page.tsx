import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getArticleBySlug, getRelatedArticles, getAllSlugs } from '@/lib/blog-db';
import BlogProductSection from '@/components/BlogProductSection';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 3600; // 1h ISR

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel nicht gefunden' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${baseUrl}/blog/${article.slug}`,
      type: 'article',
      locale: 'de_DE',
      siteName: 'Preisradio',
      publishedTime: article.date,
      modifiedTime: article.date,
      images: article.image ? [{ url: article.image, width: 1200, height: 630, alt: article.title }] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${baseUrl}/blog/${article.slug}` },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'Preisradio',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Preisradio',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.ico` },
    },
    mainEntityOfPage: `${baseUrl}/blog/${article.slug}`,
  };

  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'bestprice2109-21';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 dark:text-gray-500 overflow-hidden" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 transition-colors flex-shrink-0">Startseite</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors flex-shrink-0">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate">{article.title}</span>
        </nav>

        {/* Hero Image */}
        {article.image && (
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 aspect-[16/9] sm:aspect-[21/9] max-h-[220px] sm:max-h-[280px] md:max-h-[360px]">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-10">
              <span className={`inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium ${article.categoryColor}`}>
                {article.category}
              </span>
              <h1 className="mt-2 sm:mt-3 text-lg sm:text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
                {article.title}
              </h1>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-300">
                <span>{article.author}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400 hidden sm:block" />
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <span className="w-1 h-1 rounded-full bg-gray-400 hidden sm:block" />
                <span>{article.readTime} Min. Lesezeit</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Product comparison + similar products from our stores */}
          {article.amazonKeywords && article.amazonKeywords.length > 0 && (
            <BlogProductSection keywords={article.amazonKeywords} />
          )}

          {/* Amazon Affiliate CTA */}
          {(article.amazonProductUrl || (article.amazonKeywords && article.amazonKeywords.length > 0)) && (
            <div className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Produkte auf Amazon ansehen</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Passende Produkte zum Artikel</p>
                </div>
              </div>

              {/* Direct product link */}
              {article.amazonProductUrl && (
                <a
                  href={article.amazonProductUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3.5 text-sm transition-colors shadow-sm"
                >
                  <img src="/retailers/amazon.png" alt="Amazon" className="h-5" />
                  Jetzt auf Amazon kaufen
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              )}

              {/* Keyword search links */}
              {article.amazonKeywords && article.amazonKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.amazonKeywords.map((keyword) => (
                    <a
                      key={keyword}
                      href={`https://www.amazon.de/s?k=${encodeURIComponent(keyword)}&tag=${amazonTag}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-400 transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.045 18.02c.07-.116.36-.31.53-.31.13 0 .27.04.39.13 1.15.87 2.38 1.55 3.69 2.04 1.31.49 2.64.74 3.97.74 1.52 0 2.97-.35 4.35-1.04 1.38-.69 2.53-1.66 3.44-2.9l.1.08c.12.09.19.22.19.37 0 .11-.04.21-.12.3C14.54 20.05 11.62 21 8.65 21c-1.54 0-3.04-.31-4.47-.94C2.75 19.43 1.35 18.64.045 18.02zM6.27 7.39c0-1.32.54-2.44 1.6-3.36 1.07-.92 2.42-1.38 4.06-1.38.92 0 1.77.16 2.56.49.79.33 1.4.74 1.81 1.24.42.49.62.97.62 1.42 0 .35-.13.65-.4.89-.27.24-.59.36-.97.36-.32 0-.6-.1-.84-.3-.26-.24-.52-.6-.79-1.07-.34-.59-.7-1.02-1.07-1.28-.37-.27-.87-.4-1.49-.4-.86 0-1.56.3-2.12.89-.55.6-.83 1.33-.83 2.19 0 .69.14 1.3.42 1.84.28.54.66.97 1.14 1.29.48.32 1.01.54 1.58.67.57.13 1.25.2 2.05.33.8.14 1.58.31 2.34.52.76.21 1.47.51 2.14.89.67.38 1.21.91 1.61 1.59.4.68.6 1.53.6 2.55 0 1.09-.29 2.1-.87 3.04-.58.94-1.49 1.7-2.71 2.27-1.23.57-2.71.86-4.44.86-1.33 0-2.55-.19-3.66-.57a8.8 8.8 0 01-2.89-1.61c-.5-.44-.75-.93-.75-1.47 0-.35.13-.66.4-.91.27-.26.6-.39.99-.39.3 0 .56.09.79.26.42.37.81.76 1.18 1.18.36.42.82.78 1.37 1.07.55.3 1.28.44 2.19.44 1.05 0 1.93-.28 2.62-.85.7-.57 1.04-1.26 1.04-2.07 0-.57-.13-1.04-.39-1.39-.26-.36-.61-.65-1.04-.87-.44-.22-.88-.39-1.34-.5-.46-.11-1.1-.24-1.93-.38-1.23-.22-2.28-.52-3.14-.9-.87-.38-1.55-.92-2.05-1.61-.5-.69-.74-1.57-.74-2.64z" />
                      </svg>
                      {keyword}
                      <svg className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">* Affiliate-Links — bei einem Kauf erhalten wir eine kleine Provision, für dich ändert sich der Preis nicht.</p>
            </div>
          )}

          {/* Back */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Alle Artikel
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="mt-10 sm:mt-16" aria-label="Ähnliche Artikel">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Weiterlesen</h2>
              <Link
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Alle Artikel
              </Link>
            </div>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${rel.categoryColor}`}>
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[11px] sm:text-xs text-gray-400">
                      <time dateTime={rel.date}>{formatDate(rel.date)}</time>
                      <span>{rel.readTime} Min.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}
