import { Product } from '@/lib/types';

const API_URL = 'https://api.preisradio.de/api';
const RETAILERS = ['saturn', 'mediamarkt', 'otto', 'kaufland'] as const;

/** Same round-robin logic as HomeContent.tsx — alternate products from different retailers */
function roundRobin(groups: Product[][]): Product[] {
  const result: Product[] = [];
  const seen = new Set<string>();
  const maxLen = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const g of groups) {
      if (i < g.length && !seen.has(g[i].id)) {
        seen.add(g[i].id);
        result.push(g[i]);
      }
    }
  }
  return result;
}

/**
 * Fetch `total` products by keyword, one per retailer (round-robin).
 * Saturn → MediaMarkt → Otto → Kaufland → Saturn → …
 */
export async function fetchRoundRobin(keyword: string, total = 4): Promise<Product[]> {
  const perRetailer = Math.max(2, Math.ceil(total / RETAILERS.length));

  const settled = await Promise.allSettled(
    RETAILERS.map((retailer) =>
      fetch(
        `${API_URL}/products/?search=${encodeURIComponent(keyword)}&retailer=${retailer}&page_size=${perRetailer}`,
        { next: { revalidate: 3600 } }
      )
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => (data.results || []) as Product[])
        .catch(() => [] as Product[])
    )
  );

  const groups = settled.map((r) => (r.status === 'fulfilled' ? r.value : []));
  return roundRobin(groups).slice(0, total);
}

/**
 * Fetch `total` products by brand name (round-robin across retailers), excluding given IDs.
 */
export async function fetchBrandRoundRobin(
  brand: string,
  excludeIds: string[],
  total = 4
): Promise<Product[]> {
  if (!brand) return [];
  const perRetailer = Math.max(2, Math.ceil((total + excludeIds.length) / RETAILERS.length));

  const settled = await Promise.allSettled(
    RETAILERS.map((retailer) =>
      fetch(
        `${API_URL}/products/?search=${encodeURIComponent(brand)}&retailer=${retailer}&page_size=${perRetailer}`,
        { next: { revalidate: 3600 } }
      )
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => (data.results || []) as Product[])
        .catch(() => [] as Product[])
    )
  );

  const groups = settled.map((r) => (r.status === 'fulfilled' ? r.value : []));
  return roundRobin(groups)
    .filter((p) => !excludeIds.includes(p.id))
    .slice(0, total);
}
