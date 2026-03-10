import { connectDB } from './mongodb';
import Article, { IArticle } from './models/Article';

const BLOG_CATEGORIES: Record<string, string> = {
  'Kaufberatung': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Spartipps': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Technik': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'News': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
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
  status: 'draft' | 'published';
}

function toArticle(doc: IArticle): BlogArticle {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    category: doc.category,
    categoryColor: BLOG_CATEGORIES[doc.category] || BLOG_CATEGORIES['Kaufberatung'],
    image: doc.image,
    date: doc.createdAt.toISOString().split('T')[0],
    readTime: doc.readTime,
    author: doc.author,
    amazonKeywords: doc.amazonKeywords || [],
    status: doc.status,
  };
}

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  await connectDB();
  const docs = await Article.find({ status: 'published' }).sort({ createdAt: -1 }).lean() as IArticle[];
  return docs.map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  await connectDB();
  const doc = await Article.findOne({ slug, status: 'published' }).lean() as IArticle | null;
  return doc ? toArticle(doc) : null;
}

export async function getAllSlugs(): Promise<string[]> {
  await connectDB();
  const docs = await Article.find({ status: 'published' }, { slug: 1 }).lean();
  return docs.map((d) => d.slug);
}

export async function getRelatedArticles(currentSlug: string, limit = 3): Promise<BlogArticle[]> {
  await connectDB();
  const current = await Article.findOne({ slug: currentSlug }).lean() as IArticle | null;
  if (!current) return [];

  const docs = await Article.find({
    slug: { $ne: currentSlug },
    status: 'published',
  })
    .sort({ category: current.category ? 1 : -1, createdAt: -1 })
    .limit(limit)
    .lean() as IArticle[];

  return docs.map(toArticle);
}

export { BLOG_CATEGORIES };
