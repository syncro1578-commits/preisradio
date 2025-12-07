/**
 * IndexNow utility functions for submitting URLs to Bing and other search engines
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

/**
 * Submit URLs to IndexNow API
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${SITE_URL}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`IndexNow: Successfully submitted ${urls.length} URLs`);
      return true;
    } else {
      console.error('IndexNow submission failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return false;
  }
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<boolean> {
  return submitToIndexNow([url]);
}

/**
 * Submit product URLs to IndexNow
 */
export async function submitProductsToIndexNow(productIds: string[]): Promise<boolean> {
  const urls = productIds.map(id => `${SITE_URL}/product/${id}`);
  return submitToIndexNow(urls);
}

/**
 * Submit sitemap to IndexNow
 */
export async function submitSitemapToIndexNow(): Promise<boolean> {
  return submitUrlToIndexNow(`${SITE_URL}/sitemap.xml`);
}
