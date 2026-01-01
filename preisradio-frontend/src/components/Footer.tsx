import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Über Preisradio',
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
        { href: '/kategorien/smartphones', label: 'Smartphones' },
        { href: '/kategorien/laptops', label: 'Laptops' },
        { href: '/kategorien/fernseher', label: 'Fernseher' },
        { href: '/kategorien/gaming', label: 'Gaming' },
        { href: '/kategorien', label: 'Alle Kategorien' },
      ],
    },
    {
      title: 'Marken',
      links: [
        { href: '/marken', label: 'Alle Marken' },
        { href: '/marken/samsung', label: 'Samsung' },
        { href: '/marken/apple', label: 'Apple' },
        { href: '/marken/sony', label: 'Sony' },
      ],
    },
    {
      title: 'Händler',
      links: [
        { href: '/haendler', label: 'Alle Händler' },
        { href: '/search?retailer=saturn', label: 'Saturn' },
        { href: '/search?retailer=mediamarkt', label: 'MediaMarkt' },
        { href: '/search?retailer=otto', label: 'Otto' },
        { href: '/search?retailer=kaufland', label: 'Kaufland' },
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-xl font-bold text-white shadow-none overflow-hidden">
                <img
                  src="/favicon.ico"
                  alt="Preisradio Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Preisradio
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Preisvergleich
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ihr deutscher Preisvergleich für Elektronik, Haushaltsgeräte und mehr.
              Vergleichen Sie Preise von Top-Händlern und sparen Sie Geld!
            </p>
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
              © {currentYear} Preisradio. Alle Rechte vorbehalten.
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
