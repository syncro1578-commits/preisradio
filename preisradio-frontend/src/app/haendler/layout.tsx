import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Partner-Händler: Saturn, MediaMarkt & Otto Shops',
  description: 'Entdecken Sie alle Partner-Händler bei Preisradio. Vergleichen Sie Preise von Saturn, MediaMarkt und Otto. Finden Sie zuverlässige Online-Shops für Elektronik.',
  alternates: {
    canonical: `${baseUrl}/haendler`,
    languages: {
      'de-DE': `${baseUrl}/haendler`,
      'x-default': `${baseUrl}/haendler`,
    },
  },
  openGraph: {
    title: 'Partner-Händler | Preisradio',
    description: 'Alle Partner-Händler und Shops - Saturn und MediaMarkt Preisvergleich',
    url: `${baseUrl}/haendler`,
    type: 'website',
    images: [{
      url: `${baseUrl}/favicon.ico`,
      width: 512,
      height: 512,
      alt: 'Preisradio Händler',
    }],
  },
  twitter: {
    card: 'summary',
    title: 'Partner-Händler | Preisradio',
    description: 'Alle Partner-Händler und Shops bei Preisradio',
    images: [`${baseUrl}/favicon.ico`],
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
