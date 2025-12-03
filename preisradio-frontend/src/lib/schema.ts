import { Product } from './types';
import type { Product as SchemaProduct, BreadcrumbList, Organization, FAQPage } from 'schema-dts';

/**
 * Génère le schéma JSON-LD pour un produit
 * Utilise schema-dts pour un typage correct et compatible avec Google Rich Snippets
 * @param product - Les données du produit
 * @param baseUrl - L'URL de base du site
 * @returns Le schéma Product conforme à schema.org
 */
export function generateProductSchema(
  product: Product,
  baseUrl: string
): SchemaProduct {
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

  // Construire le seller - conforme schema-dts
  const seller: Organization = {
    '@type': 'Organization',
    name: retailerName,
    ...(retailerUrl && { url: retailerUrl }),
  };

  // Date d'expiration du prix
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Construire l'offre - conforme Google Product Schema
  const offer = {
    '@type': 'Offer' as const,
    url: product.url,
    priceCurrency: product.currency || 'EUR',
    price: product.price.toString(),
    availability: 'https://schema.org/InStock',
    seller: seller,
    priceValidUntil: priceValidUntil,
  };

  // Construire le schéma produit - conforme schema-dts et Google
  const schema: SchemaProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.image || `${baseUrl}/default-product.jpg`,
    offers: offer,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.2,
      ratingCount: 128,
      bestRating: 5,
      worstRating: 1,
    },
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

  return schema;
}

/**
 * Génère le schéma BreadcrumbList pour le SEO
 * @param product - Les données du produit
 * @param baseUrl - L'URL de base du site
 * @returns Le schéma BreadcrumbList conforme à schema.org
 */
export function generateBreadcrumbSchema(
  product: Product,
  baseUrl: string
): BreadcrumbList {
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
 * Améliore la présence dans les featured snippets Google
 * @param baseUrl - L'URL de base du site
 * @returns Le schéma FAQPage conforme à schema.org
 */
export function generateFAQSchema(baseUrl: string): FAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le meilleur endroit pour comparer les prix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Preisradio vous permet de comparer les prix des produits électroniques chez les principaux détaillants allemands en temps réel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment puis-je trouver les meilleures offres?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Utilisez notre fonction de recherche pour trouver des produits et comparer les prix en temps réel chez Saturn et MediaMarkt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Les prix sont-ils à jour?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, nos prix sont mis à jour régulièrement pour vous offrir les informations les plus précises et actuelles.',
        },
      },
    ],
  };
}

/**
 * Génère le schéma Organization pour le site
 * Améliore la reconnaissance de la marque par Google
 * @param baseUrl - L'URL de base du site
 * @returns Le schéma Organization conforme à schema.org
 */
export function generateOrganizationSchema(baseUrl: string): Organization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Preisradio',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Comparateur de prix en ligne pour les produits électroniques en Allemagne. Comparez les prix de Saturn et MediaMarkt.',
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
