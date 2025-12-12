import { Suspense } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  description: 'Vergleichen Sie Preise von Saturn und MediaMarkt in Echtzeit. Finden Sie die besten Angebote für Elektronik, Laptops, Smartphones und mehr.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'de-DE': baseUrl,
      'x-default': baseUrl,
    },
  },
};

function HomeLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-40">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Seite wird geladen...
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
            Preise vergleichen & Geld sparen
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Finden Sie die besten Angebote für Elektronik, Haushaltsgeräte und mehr.
            Vergleichen Sie Preise von Top-Händlern in Deutschland.
          </p>
        </div>

        <Suspense fallback={<HomeLoadingFallback />}>
          <HomeContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
