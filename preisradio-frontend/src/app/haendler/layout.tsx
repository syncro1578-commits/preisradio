import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Händler im Vergleich – Saturn, MediaMarkt, Otto & Kaufland | Preisradio',
  description: 'Preisradio vergleicht täglich Preise von Saturn, MediaMarkt, Otto und Kaufland. Entdecken Sie alle Partner-Händler und finden Sie immer den günstigsten Preis.',
  keywords: [
    'Saturn Preisvergleich',
    'MediaMarkt Preisvergleich',
    'Otto Preisvergleich',
    'Kaufland Preisvergleich',
    'Elektronik Online-Händler Deutschland',
    'günstig online kaufen',
    'Preisradio Händler',
  ],
  openGraph: {
    title: 'Händler im Vergleich | Preisradio',
    description: 'Saturn, MediaMarkt, Otto und Kaufland im Preisvergleich – täglich aktuell auf Preisradio.',
    url: `${baseUrl}/haendler`,
    type: 'website',
    locale: 'de_DE',
    siteName: 'Preisradio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Händler im Vergleich | Preisradio',
    description: 'Saturn, MediaMarkt, Otto und Kaufland – günstigste Preise täglich auf Preisradio.',
  },
  alternates: {
    canonical: `${baseUrl}/haendler`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const collectionsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Partner-Händler und Shops',
    description: 'Alle Partner-Händler und Shops im Preisradio Preisvergleich',
    url: `${baseUrl}/haendler`,
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
