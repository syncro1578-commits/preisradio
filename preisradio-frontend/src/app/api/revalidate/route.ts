import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Secret token to protect the endpoint
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || 'your-secret-token-here';

export async function POST(request: NextRequest) {
  try {
    // Check for secret token
    const token = request.nextUrl.searchParams.get('token');

    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get path from request body
    const body = await request.json();
    const path = body.path || '/';

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now()
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
