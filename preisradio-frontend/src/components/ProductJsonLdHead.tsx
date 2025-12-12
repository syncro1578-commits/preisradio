'use client';

import { useEffect } from 'react';
import { Product } from '@/lib/types';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export default function ProductJsonLdHead({ product }: { product: Product }) {
  useEffect(() => {
    // Generate schemas
    const productSchema = generateProductSchema(product, baseUrl);
    const breadcrumbSchema = generateBreadcrumbSchema(product, baseUrl);

    // Inject Product JSON-LD into head
    const productScript = document.createElement('script');
    productScript.type = 'application/ld+json';
    productScript.id = 'product-jsonld';
    productScript.text = JSON.stringify(productSchema);
    document.head.appendChild(productScript);

    // Inject Breadcrumb JSON-LD into head
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.id = 'breadcrumb-jsonld';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // Cleanup on unmount
    return () => {
      const existingProductScript = document.getElementById('product-jsonld');
      const existingBreadcrumbScript = document.getElementById('breadcrumb-jsonld');
      if (existingProductScript) existingProductScript.remove();
      if (existingBreadcrumbScript) existingBreadcrumbScript.remove();
    };
  }, [product]);

  return null; // This component doesn't render anything
}
