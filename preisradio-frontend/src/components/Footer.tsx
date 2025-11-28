import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Über PrixRadio',
      links: [
        { href: '/', label: 'Startseite' },
        { href: '/impressum', label: 'Impressum' },
        { href: '/datenschutz', label: 'Datenschutz' },
        { href: '/kontakt', label: 'Kontakt' },
      ],
    },
    {
      title: 'Kategorien',
      links: [
        { href: '/search?category=Smartphones', label: 'Smartphones' },
        { href: '/search?category=Laptops', label: 'Laptops' },
        { href: '/search?category=Fernseher', label: 'Fernseher' },
        { href: '/search?category=Gaming', label: 'Gaming' },
        { href: '/kategorien', label: 'Alle Kategorien' },
      ],
    },
    {
      title: 'Marken',
      links: [
        { href: '/marken', label: 'Alle Marken' },
        { href: '/search?brand=Samsung', label: 'Samsung' },
        { href: '/search?brand=Apple', label: 'Apple' },
        { href: '/search?brand=Sony', label: 'Sony' },
      ],
    },
    {
      title: 'Händler',
      links: [
        { href: '/haendler', label: 'Alle Händler' },
        { href: '/search?retailer=saturn', label: 'Saturn' },
        { href: '/search?retailer=mediamarkt', label: 'MediaMarkt' },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  PrixRadio
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Preisvergleich
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ihr deutscher Preisvergleich für Elektronik, Haushaltsgeräte und mehr.
              Vergleichen Sie Preise von Top-Händlern und sparen Sie Geld!
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bleiben Sie auf dem Laufenden
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Erhalten Sie die besten Deals direkt in Ihr Postfach
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2 md:w-auto">
              <input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Abonnieren
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-zinc-800">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} PrixRadio. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/impressum"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Impressum
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/datenschutz"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Datenschutz
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/kontakt"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Kontakt
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Entwickelt mit Django REST Framework & Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
