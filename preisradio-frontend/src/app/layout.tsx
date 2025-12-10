import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";
import ConsentBanner from "@/components/ConsentBanner";
import HrefLangTags from "@/components/HrefLangTags";
import { generateOrganizationSchema, generateFAQSchema } from "@/lib/schema";
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Preisradio - Preisvergleich Deutschland | Saturn & MediaMarkt',
    template: '%s | Preisradio'
  },
  description: 'Vergleichen Sie Preise von Saturn und MediaMarkt in Echtzeit. Finden Sie die besten Angebote für Elektronik, Laptops, Smartphones und mehr.',
  keywords: ['Preisvergleich', 'Saturn', 'MediaMarkt', 'Elektronik', 'Preise vergleichen', 'Deutschland', 'Online Shopping', 'Laptops', 'Smartphones'],
  authors: [{ name: 'Preisradio' }],
  creator: 'Preisradio',
  publisher: 'Preisradio',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
    title: 'Preisradio - Preisvergleich Deutschland',
    description: 'Vergleichen Sie Preise von Saturn und MediaMarkt in Echtzeit. Finden Sie die besten Angebote für Elektronik.',
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
    title: 'Preisradio - Preisvergleich Deutschland',
    description: 'Vergleichen Sie Preise von Saturn und MediaMarkt in Echtzeit.',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const organizationSchema = generateOrganizationSchema(baseUrl);
  const faqSchema = generateFAQSchema(baseUrl);

  return (
    <html lang="de-DE">
      <head>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Preisradio',
              url: baseUrl,
              description: 'Preisvergleich für Elektronikprodukte von Saturn und MediaMarkt',
              inLanguage: 'de-DE',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${baseUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              },
              publisher: {
                '@type': 'Organization',
                name: 'Preisradio',
                url: baseUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${baseUrl}/favicon.ico`
                }
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </head>
      <body
        className="antialiased"
      >
        {/* Google Tag Manager (noscript) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <HrefLangTags />
        <Analytics />
        <ConsentBanner />
        {children}
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
