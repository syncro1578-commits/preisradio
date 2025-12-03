import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { Product } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.preisradio.de';

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    // Récupérer les données du produit
    const response = await fetch(`${apiUrl}/api/products/${id}/`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return <>{children}</>;
    }

    const product: Product = await response.json();

    // Générer les schémas
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
        {children}
      </>
    );
  } catch (error) {
    console.error('Error in product layout:', error);
    return <>{children}</>;
  }
}
