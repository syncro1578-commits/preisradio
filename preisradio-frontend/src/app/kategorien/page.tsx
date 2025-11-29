'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

interface CategoryData {
  name: string;
  count: number;
  icon: string;
  description: string;
}

export default function KategorienPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Update document title
    document.title = 'Alle Kategorien | Preisradio';

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/kategorien`;

    // Add JSON-LD for categories
    let script = document.querySelector('#categories-jsonld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'categories-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Produktkategorien',
      description: 'Alle Produktkategorien von Saturn und MediaMarkt',
      url: `${baseUrl}/kategorien`,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Kategorien',
            item: `${baseUrl}/kategorien`
          }
        ]
      }
    };

    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const scriptEl = document.querySelector('#categories-jsonld');
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, []);

  const loadProducts = async () => {
    try {
      // Charger les produits des deux retailers pour avoir toutes les catégories
      const response = await api.getProductsFromBothRetailers({
        page_size: 200, // Charger 200 produits pour avoir toutes les catégories
      });
      setProducts(response.results);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extraire les catégories avec comptage
  const categories = products.reduce((acc, product) => {
    const existing = acc.find(c => c.name === product.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        name: product.category,
        count: 1,
        icon: getCategoryIcon(product.category),
        description: getCategoryDescription(product.category),
      });
    }
    return acc;
  }, [] as CategoryData[]);

  function getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      // Laptops & Computers
      '15 Zoll Laptops': '💻',
      'Laptops': '💻',
      'Notebooks & Computer': '💻',
      'Gaming PCs AMD': '🎮',
      'Gaming PCs Intel': '🎮',

      // Handy & Smartphone
      '360 Grad Handyhüllen': '📱',
      'Apple Cases, Taschen und Cover': '📱',
      'Bumper für Handys': '📱',
      'Flip Cases': '📱',
      'Handy Akkus': '🔋',
      'Handy Cases': '📱',
      'Handy Klapphüllen': '📱',
      'Handy Schutzfolien': '🛡️',
      'Handy Sleeves': '📱',
      'Handyketten': '📱',
      'Bildschirmschutz': '🛡️',
      'Schutzfolien & Schutzgläser': '🛡️',

      // Tablets
      'Tablet Bookcover': '📱',
      'Tablet-Halterungen': '📱',
      'Tabletschutzfolien': '🛡️',

      // Gaming
      'Gaming Mousepads': '🎮',
      'Nintendo Wii Spiele': '🎮',

      // PC Komponenten
      'PC Arbeitsspeicher DDR3': '⚡',
      'PC Arbeitsspeicher DDR4': '⚡',
      'Non Modulare Netzteile': '🔌',

      // Storage
      'Micro SD Karten': '💾',
      'USB-Sticks': '💾',
      'USB Hubs': '🔌',

      // Laptop Zubehör
      'Laptop Akku': '🔋',
      'Laptop Rucksäcke': '🎒',

      // Drucker & Toner
      'Toner für HP': '🖨️',
      'Toner für Samsung': '🖨️',

      // Küche
      'Küchenmaschinen': '🍳',
      'Küchenwaagen': '⚖️',
      'Geschirr': '🍽️',

      // Haushalt
      'Staubsaugerbeutel': '🧹',
      'Dunstabzugshaube Zubehör': '🏠',

      // Garten
      'Garten-Sitzmöbel': '🪑',
      'Gartenmöbel-Sets & Lounges': '🪴',
      'Sonnenschutz & Überdachung': '☀️',
      'Zubehör Gartenpflege': '🌱',

      // Möbel
      'Tische & Ergänzungen': '🪑',

      // Fitness
      'Laufbänder': '🏃',

      // Beleuchtung
      'Innenleuchten': '💡',
      'Tischventilatoren': '💨',

      // Entertainment
      'Dance & Electro CDs': '💿',

      // TV & Kabel
      'TV-Kabel': '📺',

      // Wearables
      'Garmin Ersatzarmbänder': '⌚',
      'Schutzfolien Smartwatch': '⌚',

      // Navigation
      'Navi-Taschen & -Schutzfolien': '🗺️',

      // Batterien
      'Akku-Ladegeräte': '🔋',
      'weitere Knopfzellen': '🔋',

      // Spielzeug
      'Playmobil Puppenhaus': '🏠',

      // Büro
      'Schreibwaren': '✏️',

      // Sonstiges
      'home': '🏠',
    };
    return icons[category] || '📦';
  }

  function getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      // Catégories en français (legacy)
      'Smartphones': 'Die neuesten Smartphones von Samsung, Apple, Xiaomi und mehr',
      'Ordinateurs portables': 'Laptops für jeden Bedarf - Gaming, Business, Multimedia',
      'Audio': 'Kopfhörer, Lautsprecher und Audio-Zubehör',
      'Télévisions': 'Smart-TVs, OLED, QLED und mehr in allen Größen',
      'Composants PC': 'Grafikkarten, Prozessoren, RAM und mehr',
      'Consoles': 'PlayStation, Xbox, Nintendo Switch und Zubehör',
      'Montres connectées': 'Smartwatches von Apple, Samsung, Garmin',
      'Électroménager': 'Haushaltsgeräte für Küche und Haushalt',
      'Photo': 'Kameras, Objektive und Foto-Zubehör',
      'Moniteurs': 'Monitore für Gaming, Office und kreative Arbeit',

      // Catégories allemandes communes
      'Handys & Smartphones': 'Die neuesten Smartphones von Samsung, Apple, Xiaomi und mehr',
      'Notebooks & Computer': 'Laptops und Computer für jeden Bedarf',
      'Laptops': 'Laptops für Gaming, Business und Multimedia',
      'TV & Audio': 'Fernseher, Soundbars und Audio-Systeme',
      'Fernseher': 'Smart-TVs, OLED, QLED in allen Größen',
      'Kopfhörer': 'Kabellose und kabelgebundene Kopfhörer',
      'Lautsprecher': 'Bluetooth-Lautsprecher und Soundsysteme',
      'Tablets': 'Tablets für Entertainment und Produktivität',
      'Smartwatches': 'Smartwatches und Fitness-Tracker',
      'Wearables': 'Smartwatches, Fitness-Tracker und mehr',
      'Gaming': 'Gaming-Zubehör und Peripheriegeräte',
      'Spielekonsolen': 'PlayStation, Xbox, Nintendo Switch',
      'Kameras': 'Digitalkameras und Objektive',
      'Foto & Video': 'Kameras, Objektive und Foto-Zubehör',
      'Smart Home': 'Intelligente Geräte für Ihr Zuhause',
      'Haushaltsgeräte': 'Geräte für Küche und Haushalt',
      'Kühlschränke': 'Kühl- und Gefrierschränke',
      'Waschmaschinen': 'Waschmaschinen und Trockner',
      'PC-Komponenten': 'Hardware-Komponenten für Ihren PC',
      'Grafikkarten': 'Grafikkarten für Gaming und Rendering',
      'Prozessoren': 'CPUs von Intel, AMD und mehr',
      'Monitore': 'Monitore für Gaming, Office und Design',
      'Drucker': 'Drucker und Multifunktionsgeräte',
      'Zubehör': 'Diverses Zubehör für Elektronik',
      'Software': 'Software und digitale Downloads',
    };
    return descriptions[category] || 'Entdecken Sie unsere Produkte in dieser Kategorie';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Alle Kategorien
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Durchsuchen Sie unsere Produktkategorien und finden Sie die besten Angebote
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Kategorien werden geladen...
              </p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-12 text-center dark:bg-zinc-900">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Kategorien gefunden
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fügen Sie Produkte hinzu, um Kategorien zu sehen
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kategorien insgesamt
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {categories.length}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Produkte insgesamt
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {products.length}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900">
                    <svg
                      className="h-8 w-8 text-purple-600 dark:text-purple-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Größte Kategorie
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {categories.sort((a, b) => b.count - a.count)[0]?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories
                .sort((a, b) => b.count - a.count)
                .map((category) => (
                  <Link
                    key={category.name}
                    href={`/search?category=${encodeURIComponent(category.name)}`}
                    className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-2xl dark:bg-zinc-900"
                  >
                    <div className="absolute right-4 top-4 text-6xl opacity-10">
                      {category.icon}
                    </div>

                    <div className="relative">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl shadow-lg">
                        {category.icon}
                      </div>

                      <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>

                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="rounded-full bg-blue-100 px-4 py-2 dark:bg-blue-950">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {category.count} {category.count === 1 ? 'Produkt' : 'Produkte'}
                          </span>
                        </div>

                        <svg
                          className="h-6 w-6 text-gray-400 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
