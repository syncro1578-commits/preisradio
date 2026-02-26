import Link from 'next/link';

type CategoryEntry = {
  name: string;
  slug: string;
  icon: React.ReactNode;
};

function IconSmartphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M3 19h18M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
      <path d="M3 19l2-3h14l2 3" />
    </svg>
  );
}

function IconTV() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function IconGaming() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M2 6h20v12H2z" />
      <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function IconWatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 9v3l1.5 1.5M9 2h6M9 22h6M16.5 4.5l1-1M7.5 4.5l-1-1M16.5 19.5l1 1M7.5 19.5l-1 1" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSpeaker() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M11 5L6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconAppliance() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v1M12 15v1M8 12h1M15 12h1" />
    </svg>
  );
}

function IconDeals() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

// Links use /search?q= for reliable results (category slugs vary by API data)
const CATEGORIES: CategoryEntry[] = [
  { name: 'Deals', slug: '/search?sort=discount', icon: <IconDeals /> },
  { name: 'Smartphones', slug: '/search?q=smartphone', icon: <IconSmartphone /> },
  { name: 'Laptops', slug: '/search?q=laptop', icon: <IconLaptop /> },
  { name: 'Fernseher', slug: '/search?q=fernseher', icon: <IconTV /> },
  { name: 'Kopfhorer', slug: '/search?q=kopfhorer', icon: <IconHeadphones /> },
  { name: 'Gaming', slug: '/kategorien/spielkonsolen', icon: <IconGaming /> },
  { name: 'Tablets', slug: '/search?q=tablet', icon: <IconTablet /> },
  { name: 'Watches', slug: '/search?q=smartwatch', icon: <IconWatch /> },
  { name: 'Kameras', slug: '/search?q=kamera', icon: <IconCamera /> },
  { name: 'Audio', slug: '/search?q=audio', icon: <IconSpeaker /> },
  { name: 'Haushalt', slug: '/search?q=haushalt', icon: <IconAppliance /> },
];

export default function HomeCategoryBar() {
  return (
    <nav className="category-bar" aria-label="Kategorien">
      <div className="category-bar-scroll scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.slug}
            className="category-bar-item"
          >
            {cat.icon}
            <span className="category-bar-label">{cat.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
