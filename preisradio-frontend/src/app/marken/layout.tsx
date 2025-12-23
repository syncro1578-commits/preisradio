import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Reduzierte Markenprodukte – Beste Deals auf Preisradio',
  description: 'Alle Marken und Hersteller im Überblick - Finden Sie Produkte von führenden Marken',
  alternates: {
    canonical: `${baseUrl}/marken`,
    languages: {
      'de-DE': `${baseUrl}/marken`,
      'x-default': `${baseUrl}/marken`,
    },
  },
  openGraph: {
    title: 'Alle Marken | Preisradio',
    description: 'Alle Marken und Hersteller im Überblick - Finden Sie Produkte von führenden Marken',
    url: `${baseUrl}/marken`,
    type: 'website',
    images: [{
      url: `${baseUrl}/favicon.ico`,
      width: 512,
      height: 512,
      alt: 'Preisradio Marken',
    }],
  },
  twitter: {
    card: 'summary',
    title: 'Alle Marken | Preisradio',
    description: 'Entdecken Sie Produkte von führenden Marken',
    images: [`${baseUrl}/favicon.ico`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
