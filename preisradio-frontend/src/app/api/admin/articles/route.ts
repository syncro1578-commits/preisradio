import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { checkAuth } from '@/lib/auth';

// GET /api/admin/articles — list all articles
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  await connectDB();
  const articles = await Article.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(articles);
}

// POST /api/admin/articles — create new article
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  await connectDB();
  const body = await request.json();

  // Auto-generate slug if not provided
  if (!body.slug && body.title) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Estimate read time from content
  if (body.content && !body.readTime) {
    const wordCount = body.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    body.readTime = Math.max(1, Math.round(wordCount / 200));
  }

  const article = await Article.create(body);
  return NextResponse.json(article, { status: 201 });
}
