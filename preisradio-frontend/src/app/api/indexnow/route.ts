import { NextResponse } from 'next/server';

// IndexNow API key - you should generate a unique key and add it to your env
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'your-indexnow-key-here';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

/**
 * Submit URLs to IndexNow (Bing, Yandex, etc.)
 * POST /api/indexnow
 * Body: { urls: string[] }
 */
export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // IndexNow API endpoint
    const indexNowUrl = 'https://api.indexnow.org/indexnow';

    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: `Successfully submitted ${urls.length} URLs to IndexNow`,
        statusCode: response.status,
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: 'IndexNow API request failed',
          details: errorText,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit to IndexNow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get IndexNow status
 * GET /api/indexnow
 */
export async function GET() {
  return NextResponse.json({
    service: 'IndexNow API',
    status: 'active',
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    documentation: 'https://www.indexnow.org/documentation',
  });
}
