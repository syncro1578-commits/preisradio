import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { blogArticles, getArticleBySlug, getRelatedArticles } from '@/lib/blog';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200;

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
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
      images: [{ url: article.image, width: 800, height: 500, alt: article.title }],
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
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(slug, 3);

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

      <article className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 transition-colors">Startseite</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[21/9]">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
              {article.category}
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
              {article.title}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-300">
              <span>{article.author}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>{article.readTime} Min. Lesezeit</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share / Back */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
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
          <section className="mt-16" aria-label="Ähnliche Artikel">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Weiterlesen
              </h2>
              <Link
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Alle Artikel
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${rel.categoryColor}`}>
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
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
