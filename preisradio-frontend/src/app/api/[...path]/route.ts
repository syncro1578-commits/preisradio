import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.preisradio.de';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/${pathStr}/${search}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[API Proxy] Error fetching ${url}:`, error);
    return NextResponse.json(
      { error: 'Backend request failed' },
      { status: 502 }
    );
  }
}
