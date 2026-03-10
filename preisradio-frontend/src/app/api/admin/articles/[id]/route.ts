import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { checkAuth } from '@/lib/auth';

// GET /api/admin/articles/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  await connectDB();
  const article = await Article.findById(id).lean();

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(article);
}

// PUT /api/admin/articles/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  await connectDB();
  const body = await request.json();

  // Recalculate read time if content changed
  if (body.content) {
    const wordCount = body.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    body.readTime = Math.max(1, Math.round(wordCount / 200));
  }

  const article = await Article.findByIdAndUpdate(id, body, { new: true }).lean();

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(article);
}

// DELETE /api/admin/articles/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  await connectDB();
  const article = await Article.findByIdAndDelete(id);

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
