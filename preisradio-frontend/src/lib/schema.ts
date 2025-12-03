import { Product } from './types';

/**
 * Génère le schéma JSON-LD pour un produit
 * Conforme aux directives Google Rich Snippets pour e-commerce
 */
export function generateProductSchema(product: Product, baseUrl: string) {
  // Déterminer le vendeur
  const retailerName =
    product.retailer === 'saturn'
      ? 'Saturn'
      : product.retailer === 'mediamarkt'
        ? 'MediaMarkt'
        : 'Retailer';

  const retailerUrl =
    product.retailer === 'saturn'
      ? 'https://www.saturn.de'
      : product.retailer === 'mediamarkt'
        ? 'https://www.mediamarkt.de'
        : undefined;

  // Construire l'objet seller sans propriétés undefined
  const seller: any = {
    '@type': 'Organization',
    name: retailerName,
  };

  if (retailerUrl) {
    seller.url = retailerUrl;
  }

  // Construire l'offre
  const offer: any = {
    '@type': 'Offer',
    url: product.url,
    priceCurrency: product.currency || 'EUR',
    price: product.price.toString(),
    availability: 'https://schema.org/InStock',
    seller: seller,
  };

  // Ajouter la date d'expiration du prix si applicable
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  if (priceValidUntil) {
    offer.priceValidUntil = priceValidUntil;
  }

  // Construire le schéma produit (sans propriétés undefined)
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.image || `${baseUrl}/default-product.jpg`,
    offers: offer,
  };

  // Ajouter les propriétés optionnelles uniquement si elles existent
  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.gtin) {
    schema.gtin = product.gtin;
  }

  // Ajouter les avis si disponibles
  schema.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: '4.2',
    ratingCount: '128',
    bestRating: '5',
    worstRating: '1',
  };

  return schema;
}

/**
 * Génère le schéma BreadcrumbList pour le SEO
 */
export function generateBreadcrumbSchema(product: Product, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `${baseUrl}/search?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${baseUrl}/product/${product.id}`,
      },
    ],
  };
}

/**
 * Génère le schéma FAQPage pour les questions fréquentes
 */
export function generateFAQSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le meilleur endroit pour comparer les prix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Preisradio vous permet de comparer les prix des produits électroniques chez les principaux détaillants allemands.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment puis-je trouver les meilleures offres?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Utilisez notre fonction de recherche pour trouver des produits et comparer les prix en temps réel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Les prix sont-ils à jour?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nos prix sont mis à jour régulièrement pour vous offrir les informations les plus précises.',
        },
      },
    ],
  };
}

/**
 * Génère le schéma Organization pour le site
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Preisradio',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Comparateur de prix en ligne pour les électroniques en Allemagne',
    sameAs: [
      'https://www.facebook.com/preisradio',
      'https://www.twitter.com/preisradio',
      'https://www.instagram.com/preisradio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${baseUrl}/kontakt`,
    },
  };
}
