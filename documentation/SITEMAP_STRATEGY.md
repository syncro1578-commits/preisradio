# Stratégies de Sitemap pour Milliers de Produits

## Problem
Google Sitemap Index a une limite de 50,000 URLs par fichier XML. Avec des milliers de produits, il faut choisir la meilleure approche.

---

## 3 Approches Recommandées

### 1️⃣ **Sitemap Index + Multiple XML Files (✅ RECOMMANDÉ)**

**Meilleur pour:** 10,000+ produits

**Architecture:**
```
sitemap.xml (Index file)
├── sitemap-products-1.xml (50,000 produits)
├── sitemap-products-2.xml (50,000 produits)
├── sitemap-products-3.xml (...)
├── sitemap-static.xml (pages statiques)
└── sitemap-categories.xml (catégories)
```

**Implémentation:**
```typescript
// preisradio-frontend/src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Retourner UNIQUEMENT les pages statiques
  return [
    { url: 'https://preisradio.de', priority: 1, changeFrequency: 'daily' },
    { url: 'https://preisradio.de/kategorien', priority: 0.9 },
    // ... autres pages statiques
  ];
}

// Créer sitemap-index.xml séparé
// preisradio-frontend/src/app/sitemap-index.xml/route.ts
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>https://preisradio.de/sitemap.xml</loc>
    </sitemap>
    <sitemap>
      <loc>https://preisradio.de/api/sitemap/products?page=1</loc>
    </sitemap>
    <sitemap>
      <loc>https://preisradio.de/api/sitemap/products?page=2</loc>
    </sitemap>
    <!-- Dynamiquement généré basé sur total count -->
  </sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

**Avantages:**
- ✅ Google supporte nativement Sitemap Index
- ✅ Pas de limite de taille
- ✅ Peut inclure des sitemaps dynamiques (API)
- ✅ Performance optimale

**Inconvénients:**
- Nécessite génération de fichiers multiples
- Komplexité modérée

---

### 2️⃣ **Sitemap API Dynamique (💡 POUR VOTRE PROJET)**

**Meilleur pour:** Data changeant fréquemment, besoin d'optimisation mémoire

**Utiliser `/api/products/sitemap/` créé:**

```bash
GET /api/products/sitemap/?page=1&page_size=50000
```

**Response:**
```json
{
  "count": 125000,
  "page": 1,
  "page_size": 50000,
  "has_next": true,
  "results": [
    {
      "id": "64a2f1e9c5d8e2a1b3c4f5g6",
      "retailer": "saturn",
      "lastModified": "2025-12-02T10:30:00Z"
    },
    ...50000 produits
  ]
}
```

**Frontend Integration (Next.js):**
```typescript
// preisradio-frontend/src/app/sitemap.ts (AMÉLIORÉ)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://preisradio.de';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.preisradio.de';

  const staticPages: MetadataRoute.Sitemap = [
    // Pages statiques
  ];

  try {
    // Récupérer TOUS les produits via API pagée
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) { // Limite par sécurité
      const response = await fetch(
        `${API_URL}/api/products/sitemap/?page=${page}&page_size=50000`,
        { next: { revalidate: 86400 } } // Cache 24h
      );

      if (!response.ok) break;

      const data = await response.json();
      allProducts.push(
        ...data.results.map((p: any) => ({
          url: `${baseUrl}/product/${p.id}`,
          lastModified: new Date(p.lastModified),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      );

      hasMore = data.has_next;
      page++;
    }

    return [...staticPages, ...allProducts];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages;
  }
}
```

**Avantages:**
- ✅ API réutilisable (pas seulement pour sitemap)
- ✅ Données TOUJOURS à jour
- ✅ Facile à tester/déboguer
- ✅ Minimal data (seulement id + lastModified)
- ✅ Support pagination illimitée

**Inconvénients:**
- Require fetch à chaque build/génération
- Timeout possible avec very large datasets

---

### 3️⃣ **Sitemap Statique Prégénéré (📦 POUR PRODUCTION)**

**Meilleur pour:** Millions de produits, besoin extrême performance

**Approche:**
- Cron job généère XMLs chaque nuit
- Stocke fichiers dans `/public/sitemaps/`
- References via robots.txt

```bash
# Cron job (daily)
curl -X POST https://api.preisradio.de/api/products/generate-sitemap/

# Génère:
/public/sitemaps/sitemap-products-1.xml
/public/sitemaps/sitemap-products-2.xml
/public/sitemaps/sitemap-index.xml
```

**Django Backend:**
```python
from django.core.management.base import BaseCommand
from datetime import datetime
import xml.etree.ElementTree as ET

class Command(BaseCommand):
    def handle(self, *args, **options):
        products = list(
            SaturnProduct.objects
            .only('id', 'scraped_at')
            .order_by('-scraped_at')
        ) + list(
            MediaMarktProduct.objects
            .only('id', 'scraped_at')
            .order_by('-scraped_at')
        )

        # Split into chunks of 50,000
        chunk_size = 50000
        for i, chunk in enumerate([products[j:j+chunk_size] for j in range(0, len(products), chunk_size)], 1):
            generate_sitemap_file(chunk, f'sitemap-products-{i}.xml')

        # Generate sitemap index
        generate_sitemap_index(len(products) // chunk_size + 1)
```

---

## Recommandation Pour Preisradio

### ✅ **Solution Hybride (MEILLEURE)**

1. **Court terme:** Utiliser l'API `/api/products/sitemap/` (déjà créée)
2. **Moyen terme:** Implémenter Sitemap Index XML avec multiple files
3. **Long terme:** Cron job nightly pour prégéner XMLs statiques

**Robots.txt:**
```
User-agent: *
Allow: /

Sitemap: https://preisradio.de/sitemap.xml
Sitemap: https://api.preisradio.de/api/sitemap/index/
```

---

## Performance Considerations

| Approche | Products | Generation Time | Memory | Update Speed |
|----------|----------|-----------------|--------|--------------|
| API Dynamic | 10k-100k | ~2s | 50MB | Real-time ✅ |
| Sitemap Index | 100k-1M | ~10s | 200MB | Hourly |
| Pregen Static | 1M+ | Nightly | <50MB | Once/day |

---

## Implementation Checklist

- [x] API endpoint créé (`/api/products/sitemap/`)
- [x] Frontend utilise API avec pagination
- [x] Caching 24h activé
- [ ] Sitemap Index XML créé
- [ ] Robots.txt configuré
- [ ] Google Search Console validé
- [ ] Monitoring setup pour sitemap health

---

## Testing

```bash
# Vérifier l'API
curl "https://api.preisradio.de/api/products/sitemap/?page=1&page_size=100"

# Vérifier le sitemap generations
curl "https://preisradio.de/sitemap.xml"

# Valider XML
xmllint --noout sitemap.xml
```
