# Guide de test des Rich Snippets Google

Ce guide explique comment tester et valider les données structurées JSON-LD pour s'assurer qu'elles sont correctement détectées par Google.

## 1. Validation automatique des schémas

### Avant le déploiement

```bash
cd preisradio-frontend
node scripts/validate-schema.js
```

Ce script vérifie que tous les schémas JSON-LD sont correctement formés.

## 2. Validation avec Google Rich Results Test

Google Rich Results Test est l'outil officiel de Google pour valider les données structurées.

### Étapes:

1. Ouvrir: https://search.google.com/test/rich-results

2. Entrer l'URL d'une page produit:
   ```
   https://preisradio.de/product/[product-id]
   ```

3. Cliquer sur "Test de l'URL"

4. Vérifier les résultats:
   - ✅ "Product" doit être détecté
   - ✅ "BreadcrumbList" doit être détecté
   - ✅ Aucune erreur ne doit apparaître

### Interprétation des résultats:

**Résultat attendu:**
```
✓ Product
  - Name: [Titre du produit]
  - Price: [Prix en EUR]
  - Rating: 4.2
  - Availability: InStock

✓ BreadcrumbList
  - Home > Category > Product
```

**Erreurs courantes:**

- ❌ "price missing" → Vérifier que le prix est présent
- ❌ "currency missing" → Ajouter `priceCurrency`
- ❌ "seller missing" → Ajouter le vendeur (Saturn, MediaMarkt)

## 3. Validation avec Schema.org Validator

Un autre outil pour une validation approfondie.

### Étapes:

1. Ouvrir: https://validator.schema.org/

2. Copier le HTML de la page produit (Ctrl+U ou F12)

3. Coller le HTML dans l'outil

4. Cliquer sur "Validate"

### Points à vérifier:

- ✅ Aucune erreur "Errors in schema"
- ✅ Les avertissements sont minimisés
- ✅ Les champs requis sont présents

## 4. Validation Open Graph (Facebook/LinkedIn)

Pour vérifier que le partage social fonctionne correctement.

### Étapes:

1. Ouvrir: https://www.facebook.com/sharer/

2. Entrer l'URL du produit:
   ```
   https://preisradio.de/product/[product-id]
   ```

3. Voir l'aperçu du partage

### Points à vérifier:

- ✅ L'image du produit apparaît
- ✅ Le titre du produit s'affiche
- ✅ La description inclut le prix

## 5. Validation Twitter Card

Pour s'assurer que le partage sur Twitter est optimisé.

### Étapes:

1. Ouvrir: https://cards-dev.twitter.com/validator

2. Entrer l'URL du produit

3. Vérifier l'aperçu

### Points à vérifier:

- ✅ Type: "Product"
- ✅ Image du produit affichée
- ✅ Titre et description corrects

## 6. Test manuel dans Google Search Console

Si le site est configuré dans Google Search Console:

1. Aller à "Améliorations" → "Données structurées"
2. Vérifier que "Product" est détecté
3. Vérifier qu'il n'y a pas d'erreurs

## 7. Chrome DevTools Inspection

Pour voir exactement ce que Google voit:

### Étapes:

1. Ouvrir la page produit
2. Appuyer sur F12 (DevTools)
3. Aller à l'onglet "Network"
4. Rechercher les balises `<script type="application/ld+json">`
5. Vérifier le contenu JSON

### Exemple de ce que vous devriez voir:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Titel des Produkts",
  "image": "https://...",
  "description": "...",
  "sku": "...",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://saturn.de/...",
    "priceCurrency": "EUR",
    "price": "199.99",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Saturn"
    }
  }
}
```

## 8. Monitoring continu

### Mettre en place un monitoring:

1. **Google Search Console**
   - Ajouter le sitemap
   - Analyser les "Données structurées"
   - Surveiller les erreurs

2. **Google Analytics 4**
   - Ajouter des événements custom pour les visualisations de produits
   - Tracker les clics depuis les Rich Snippets

3. **Outils de monitoring (optionnel)**
   - Semrush: Analyse complète du SEO
   - Ahrefs: Analyse des backlinks et positions
   - Screaming Frog: Audit SEO technique

## 9. Checklist de déploiement

Avant de déployer en production:

- [ ] Valider avec Google Rich Results Test
- [ ] Valider avec Schema.org Validator
- [ ] Tester Open Graph (Facebook sharing)
- [ ] Tester Twitter Cards
- [ ] Vérifier les images produits s'affichent
- [ ] Vérifier les prix sont corrects
- [ ] Vérifier la disponibilité (InStock)
- [ ] Vérifier les marques sont présentes
- [ ] Tester sur mobile et desktop
- [ ] Vérifier les URLs canoniques

## 10. Optimisations futures

Pour améliorer encore les Rich Snippets:

### Ajouter des avis réels (Reviews)

```json
"review": {
  "@type": "Review",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "4.5",
    "bestRating": "5"
  },
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "reviewBody": "Excellent product..."
}
```

### Ajouter des offres multiples (AggregateOffer)

```json
"offers": {
  "@type": "AggregateOffer",
  "priceCurrency": "EUR",
  "lowPrice": "189.99",
  "highPrice": "229.99",
  "offerCount": "3",
  "offers": [
    { "seller": "Saturn", "price": "199.99" },
    { "seller": "MediaMarkt", "price": "209.99" }
  ]
}
```

### Ajouter des vidéos produits

```json
"video": {
  "@type": "VideoObject",
  "name": "Product Demo",
  "description": "...",
  "thumbnailUrl": "...",
  "uploadDate": "2024-01-01",
  "duration": "PT5M"
}
```

## Ressources supplémentaires

- [Google Structured Data Documentation](https://developers.google.com/search/docs/beginner/intro-structured-data)
- [Schema.org Product Schema](https://schema.org/Product)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [SEO Starter Guide by Google](https://developers.google.com/search/docs)
