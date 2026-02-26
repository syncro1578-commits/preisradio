import Link from 'next/link';

type BrandEntry = {
  name: string;
  slug: string;
  color: string;
};

// Curated top brands — like Geizhals showrooms
const BRANDS: BrandEntry[] = [
  { name: 'Samsung', slug: 'samsung', color: '#1428A0' },
  { name: 'Apple',   slug: 'apple',   color: '#555555' },
  { name: 'ASUS',    slug: 'asus',    color: '#00539B' },
  { name: 'Sony',    slug: 'sony',    color: '#000000' },
  { name: 'LG',      slug: 'lg',      color: '#A50034' },
  { name: 'Philips', slug: 'philips', color: '#0B5ED7' },
  { name: 'Bosch',   slug: 'bosch',   color: '#E20015' },
  { name: 'Xiaomi',  slug: 'xiaomi',  color: '#FF6900' },
];

// SVG logos — fill="currentColor" so they inherit the brand color on hover
function SamsungLogo() {
  return (
    <svg viewBox="0 0 120 32" fill="currentColor" aria-hidden="true" className="h-5 w-auto max-w-[88px]">
      <path d="M8 19.651v-1.14h3.994v1.45a1.334 1.334 0 0 0 1.494 1.346 1.3 1.3 0 0 0 1.444-1.007 1.83 1.83 0 0 0-.026-1.113c-.773-1.944-6.055-2.824-6.726-5.854a5.4 5.4 0 0 1-.025-2.02C8.567 8.88 10.705 8 13.359 8c2.113 0 5.025.492 5.025 3.754v1.062h-3.71v-.932a1.275 1.275 0 0 0-1.392-1.347 1.25 1.25 0 0 0-1.365 1.01 2 2 0 0 0 .026.777c.437 1.734 6.081 2.667 6.7 5.8a7 7 0 0 1 .025 2.46C18.307 23.068 16.091 24 13.412 24 10.6 24 8 22.99 8 19.651m48.392-.051v-1.14h3.943v1.424A1.312 1.312 0 0 0 61.8 21.23a1.286 1.286 0 0 0 1.443-.984 1.76 1.76 0 0 0-.025-1.088c-.748-1.915-5.979-2.8-6.648-5.825a5.2 5.2 0 0 1-.026-1.994c.415-2.407 2.556-3.287 5.156-3.287 2.088 0 4.973.518 4.973 3.728v1.036h-3.684v-.906a1.268 1.268 0 0 0-1.365-1.346 1.2 1.2 0 0 0-1.34.984 2 2 0 0 0 .025.777c.412 1.734 6 2.641 6.623 5.747a6.8 6.8 0 0 1 .025 2.434c-.361 2.486-2.551 3.392-5.2 3.392-2.787.002-5.365-1.011-5.365-4.298m14.121.545a6 6 0 0 1-.025-.985V8.44h3.762v11.055a4 4 0 0 0 .025.57 1.468 1.468 0 0 0 2.835 0 4 4 0 0 0 .026-.57V8.44H80.9v10.718c0 .285-.026.829-.026.985-.257 2.8-2.448 3.7-5.179 3.7s-4.924-.905-5.182-3.7zm30.974-.156a8 8 0 0 1-.052-.989v-6.288c0-.259.025-.725.051-.985.335-2.795 2.577-3.675 5.231-3.675 2.629 0 4.947.88 5.206 3.676a7 7 0 0 1 .025.985v.487h-3.762v-.824a3 3 0 0 0-.051-.57 1.553 1.553 0 0 0-2.964 0 3 3 0 0 0-.051.7v6.834a4 4 0 0 0 .026.57 1.47 1.47 0 0 0 1.571 1.09 1.406 1.406 0 0 0 1.52-1.087 2 2 0 0 0 .026-.57v-2.178h-1.52V14.99H112V19a8 8 0 0 1-.052.984c-.257 2.718-2.6 3.676-5.231 3.676s-4.973-.955-5.23-3.673zm-52.438 3.389-.1-13.825-2.58 13.825h-3.762L40.055 9.553l-.1 13.825h-3.713l.309-14.912h6.056l1.881 11.651 1.881-11.651h6.055l.335 14.912zm-19.79 0-2.01-13.825-2.062 13.825h-4.019L23.9 8.466h6.623l2.732 14.912zm62.977-.155L88.5 10.822l.206 12.4h-3.66V8.466h5.514l3.5 12.013-.201-12.013h3.685v14.758z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="-14.558 0 270.558 315.162" fill="currentColor" aria-hidden="true" className="h-7 w-auto">
      <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.061 0-31.582 12.088-51.51 12.871-20.68.783-36.428-20.71-49.64-39.793-27-39.033-47.633-110.3-19.928-158.406 13.763-23.89 38.36-39.017 65.056-39.405 20.307-.387 39.475 13.662 51.889 13.662 12.406 0 35.699-16.895 60.186-14.414 10.25.427 39.026 4.14 57.503 31.186-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199-15.826.636-34.962 10.546-46.314 23.828-10.173 11.763-19.082 30.589-16.678 48.633 17.64 1.365 35.66-8.964 46.64-22.262" />
    </svg>
  );
}

function AsusLogo() {
  return (
    <svg viewBox="0 0 1067.8 220.1" fill="currentColor" aria-hidden="true" className="h-5 w-auto max-w-[88px]">
      <path d="M985.9 88 793.1 76.6c0 29.6 19.4 49.3 52.4 52l137.2 10.6c10.6.9 17.2 3.5 17.2 12.3s-7.5 11.5-23 11.5H790v57.2h191c60.2 0 86.8-21 86.8-69.1 0-43.3-23.8-59.5-81.9-63.1M728 137.8c0 20.2-10.2 26.4-45.3 26.4h-48.5c-28.9 0-41.3-8.4-41.3-26.4V66.9l-61.6-4.4V143H530c-3.5-23.3-12.4-50.6-70.8-54.6L266.3 75.7c0 29.4 21.2 47.1 54.2 50.6L454.7 140c10.5.8 18.6 4 18.6 12.8 0 9.7-8 10.5-20.4 10.5H264.1v-88l-61.7-3.9V220h250.9c55.9 0 73.9-29 76.6-53.2h1.3c7 38.2 40.4 53.2 97.2 53.2H691c66.3 0 97.7-20.2 97.7-67.8V76.6L728 73.1zM0 220.1h74.8l93.8-151.5-66.9-6.5zM854.8 0c-43.6 0-63 27.3-66 53.3V0H728v56.4h333.6V0zM531.3 0h61.6v56.4h-61.6zM520.3 0h-188c-43.6 0-62.9 27.3-67.3 53.3V0H160.6c-14.3 0-21.5 4.4-28.6 14.6l-28.6 41.8h416.8z" />
    </svg>
  );
}

function getBrandLogo(name: string) {
  if (name === 'Samsung') return <SamsungLogo />;
  if (name === 'Apple')   return <AppleLogo />;
  if (name === 'ASUS')    return <AsusLogo />;
  return null;
}

export default function HomeBrandShowcase() {
  return (
    <section className="mb-10" aria-labelledby="brand-showcase-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="brand-showcase-heading"
          className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
        >
          Top Marken
        </h2>
        <Link
          href="/marken"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Alle Marken →
        </Link>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BRANDS.map((brand) => {
          const logo = getBrandLogo(brand.name);
          return (
            <li key={brand.name}>
              <Link
                href={`/marken/${brand.slug}`}
                className="brand-showroom-item flex items-center justify-center h-16 rounded-2xl border border-gray-200 bg-white px-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 text-gray-500 dark:text-gray-400"
                style={{ '--brand-color': brand.color } as React.CSSProperties}
                aria-label={`${brand.name} Produkte`}
              >
                {logo ?? (
                  <span className="text-base font-black tracking-tight">
                    {brand.name}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
