import Link from 'next/link';
import api from '@/lib/api';

// Couleur officielle par marque — hover coloré comme Geizhals
const BRAND_COLORS: Record<string, string> = {
  Samsung: '#1428A0',
  Apple: '#555555',
  Sony: '#000000',
  LG: '#A50034',
  Philips: '#0B5ED7',
  Bosch: '#E20015',
  Siemens: '#009999',
  ASUS: '#00539B',
  Lenovo: '#E2231A',
  HP: '#0096D6',
  Canon: '#CC0000',
  Nikon: '#CFB400',
  Panasonic: '#004B87',
  Xiaomi: '#FF6900',
  Dyson: '#CC0032',
  Bose: '#000000',
  JBL: '#FF8000',
  Huawei: '#CF0A2C',
  Intel: '#0068B5',
  AMD: '#ED1C24',
  MSI: '#FF0000',
  Gigabyte: '#3333CC',
  Corsair: '#FFD100',
  Logitech: '#00B0FF',
  Razer: '#00FF00',
};

export default async function HomeBrandShowcase() {
  let brands: string[] = [];
  try {
    const res = await api.getBrands({ page_size: 24 });
    brands = res.results || [];
  } catch {
    return null;
  }

  if (brands.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="brand-showcase-heading">
      <h2
        id="brand-showcase-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
      >
        Top Marken
      </h2>

      <ul className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {brands.map((brand) => {
          const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const color = BRAND_COLORS[brand] ?? '#7c3aed';
          return (
            <li key={brand} className="flex-none">
              <Link
                href={`/marken/${slug}`}
                className="brand-showroom-item flex items-center justify-center h-10 min-w-[80px] px-4 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-600 hover:shadow-md whitespace-nowrap dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300"
                style={{ '--brand-color': color } as React.CSSProperties}
              >
                {brand}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
