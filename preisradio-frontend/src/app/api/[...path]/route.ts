import { NextRequest, NextResponse } from 'next/server';

const API_BACKEND = 'https://api.preisradio.de';

async function proxyRequest(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Ensure trailing slash for Django compatibility
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  const url = `${API_BACKEND}${normalizedPath}${search}`;

  const response = await fetch(url, {
    method: request.method,
    headers: {
      'Accept': 'application/json',
    },
    redirect: 'follow',
  });

  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}

export const GET = proxyRequest;
