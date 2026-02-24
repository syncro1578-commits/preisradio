import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Alle Marken im Preisvergleich – Samsung, Apple, Sony & mehr | Preisradio',
  description: 'Alle Elektronik-Marken im Überblick: Samsung, Apple, Sony, LG, Bosch und viele mehr. Preise vergleichen bei Saturn, MediaMarkt, Otto und Kaufland – täglich aktuell.',
  keywords: [
    'Elektronik Marken Preisvergleich',
    'Samsung günstig kaufen',
    'Apple Preisvergleich',
    'Sony Angebote',
    'Marken Elektronik Deutschland',
    'günstige Markenprodukte',
    'Preisradio Marken',
  ],
  openGraph: {
    title: 'Alle Marken im Preisvergleich | Preisradio',
    description: 'Samsung, Apple, Sony, LG und mehr – Markenprodukte günstig bei Saturn, MediaMarkt, Otto & Kaufland.',
    url: `${baseUrl}/marken`,
    type: 'website',
    locale: 'de_DE',
    siteName: 'Preisradio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alle Marken im Preisvergleich | Preisradio',
    description: 'Samsung, Apple, Sony und mehr – günstig kaufen auf Preisradio.',
  },
  alternates: {
    canonical: `${baseUrl}/marken`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
