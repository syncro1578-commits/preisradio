import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { Product } from '@/lib/types';

interface ProductSchemaInjectorProps {
  product: Product;
  baseUrl: string;
}

/**
 * Composant serveur qui injecte les schémas JSON-LD directement dans le HTML
 * Cela garantit que Google les détecte lors du crawl initial
 */
export default function ProductSchemaInjector({
  product,
  baseUrl,
}: ProductSchemaInjectorProps) {
  const productSchema = generateProductSchema(product, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(product, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
