import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Alle Kategorien – Laptops, TVs, Smartphones & mehr günstig kaufen | Preisradio',
  description: 'Laptops, Fernseher, Smartphones, Kopfhörer, Waschmaschinen und mehr im Preisvergleich. Alle Kategorien bei Saturn, MediaMarkt, Otto und Kaufland – täglich aktuell.',
  keywords: [
    'Elektronik Kategorien Preisvergleich',
    'Laptops günstig kaufen',
    'Fernseher Preisvergleich',
    'Smartphones Angebote',
    'Haushaltsgeräte günstig',
    'Elektronik online kaufen',
    'Preisradio Kategorien',
  ],
  openGraph: {
    title: 'Alle Kategorien im Preisvergleich | Preisradio',
    description: 'Laptops, TVs, Smartphones und mehr – günstigste Preise täglich bei Saturn, MediaMarkt, Otto & Kaufland.',
    url: `${baseUrl}/kategorien`,
    type: 'website',
    locale: 'de_DE',
    siteName: 'Preisradio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alle Kategorien im Preisvergleich | Preisradio',
    description: 'Laptops, TVs, Smartphones – günstig kaufen auf Preisradio.',
  },
  alternates: {
    canonical: `${baseUrl}/kategorien`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const collectionsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Produktkategorien',
    description: 'Alle Produktkategorien im Preisradio Preisvergleich',
    url: `${baseUrl}/kategorien`,
    inLanguage: 'de',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionsSchema),
        }}
      />
      {children}
    </>
  );
}
