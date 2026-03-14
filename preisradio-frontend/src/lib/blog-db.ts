const BLOG_API_URL = 'https://api.preisradio.de/api/blog';

const BLOG_CATEGORIES: Record<string, string> = {
  'Kaufberatung': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Spartipps': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Technik': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Nachrichten': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Testberichte': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export interface BlogArticle {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  image: string;
  date: string;
  readTime: number;
  author: string;
  amazonKeywords: string[];
  amazonProductUrl: string;
  productNames: string[];
}

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  try {
    const res = await fetch(`${BLOG_API_URL}/articles/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  try {
    const res = await fetch(`${BLOG_API_URL}/articles/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${BLOG_API_URL}/slugs/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getRelatedArticles(currentSlug: string, limit = 3): Promise<BlogArticle[]> {
  const all = await getPublishedArticles();
  const current = all.find((a) => a.slug === currentSlug);
  if (!current) return [];

  // Prioritize same category, then recent
  const others = all.filter((a) => a.slug !== currentSlug);
  const sameCategory = others.filter((a) => a.category === current.category);
  const different = others.filter((a) => a.category !== current.category);

  return [...sameCategory, ...different].slice(0, limit);
}

export { BLOG_CATEGORIES };
