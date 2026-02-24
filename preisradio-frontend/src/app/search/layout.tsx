import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  title: 'Produktsuche – Preise vergleichen bei Saturn, MediaMarkt & Otto | Preisradio',
  description: 'Suchen und vergleichen Sie Elektronikpreise von Saturn, MediaMarkt, Otto und Kaufland. Finden Sie das günstigste Angebot mit dem Preisradio Preisvergleich.',
  keywords: [
    'Preisvergleich Suche',
    'Elektronik günstig kaufen',
    'Preisvergleich Deutschland',
    'Saturn Angebote',
    'MediaMarkt Angebote',
    'Otto Angebote',
    'Kaufland Angebote',
  ],
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${baseUrl}/search`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
