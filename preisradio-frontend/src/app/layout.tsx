import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import Analytics from "@/components/Analytics";
import ConsentBanner from "@/components/ConsentBanner";
import PWAInstall from "@/components/PWAInstall";
import PWALoader from "@/components/PWALoader";
// Organization and FAQ schemas removed from global layout - Organization now only on homepage
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Preisradio | Bester Preisvergleicher in Deutschland',
    template: '%s | Preisradio'
  },
  description: 'Vergleichen Sie Elektronik-Preise von Saturn, MediaMarkt, Otto und Kaufland in Echtzeit. Finden Sie täglich die besten Angebote und sparen Sie beim Shopping.',
  keywords: ['Preisvergleich preisradio', 'toppreise preisradio', 'guenstiger preisradio', 'Kaufland Preisvergleich'],
  authors: [{ name: 'Preisradio' }],
  creator: 'Preisradio',
  publisher: 'Preisradio',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Preisradio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: baseUrl,
    siteName: 'Preisradio',
    title: 'Preisvergleich Saturn MediaMarkt Otto',
    description: 'Vergleichen Sie Elektronik-Preise von Saturn, MediaMarkt und Otto in Echtzeit. Finden Sie täglich die besten Angebote und sparen Sie beim Shopping.',
    images: [
      {
        url: `${baseUrl}/favicon.ico`,
        width: 512,
        height: 512,
        alt: 'Preisradio Preisvergleich',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Preisvergleich Saturn MediaMarkt Otto',
    description: 'Vergleichen Sie Elektronik-Preise von Saturn, MediaMarkt und Otto in Echtzeit. Finden Sie täglich die besten Angebote und sparen Sie beim Shopping.',
    images: [`${baseUrl}/favicon.ico`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'de-DE': `${baseUrl}/`,
      'x-default': baseUrl,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-8451378376537532',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="de-DE">
      <body className="antialiased">
        {/* Google Tag Manager - Next.js will move to <head> automatically */}
        {GTM_ID && (
          <>
            <Script id="google-tag-manager" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}

        {/* Google AdSense - Load only in production */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* JSON-LD Structured Data - WebSite schema only */}
        {/* Organization schema is on homepage for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Preisradio',
              url: baseUrl,
              description: 'Preisvergleich für Elektronikprodukte von Saturn, MediaMarkt und Otto',
              inLanguage: 'de-DE',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${baseUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />

        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered:', registration);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `}
        </Script>

        <Analytics />
        <ConsentBanner />
        <PWAInstall />
        <PWALoader>
          {children}
        </PWALoader>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
