import { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { blogArticles } from '@/lib/blog';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12h ISR

export const metadata: Metadata = {
  title: 'Blog — Ratgeber, Kaufberatung & Spartipps',
  description: 'Kaufberatung, Spartipps und Technik-News: Der Preisradio Blog hilft dir, die besten Deals zu finden und smarter einzukaufen.',
  openGraph: {
    title: 'Blog — Ratgeber, Kaufberatung & Spartipps',
    description: 'Kaufberatung, Spartipps und Technik-News: Der Preisradio Blog hilft dir, die besten Deals zu finden und smarter einzukaufen.',
    url: `${baseUrl}/blog`,
    type: 'website',
    locale: 'de_DE',
    siteName: 'Preisradio',
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [featured, ...rest] = blogArticles;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-10 md:mb-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Ratgeber & News
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Kaufberatung, Spartipps und Technik-Trends — damit du immer den besten Deal findest.
          </p>
        </div>

        {/* Featured Article — Hero */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-10 md:mb-14 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-10">
                <span className={`self-start px-3 py-1 rounded-full text-xs font-medium ${featured.categoryColor}`}>
                  {featured.category}
                </span>
                <h2 className="mt-4 text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span>{featured.readTime} Min. Lesezeit</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <time dateTime={article.date}>{formatDate(article.date)}</time>
                  <span>{article.readTime} Min.</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
