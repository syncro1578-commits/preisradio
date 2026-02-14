# Amazon Affiliate - Preisradio

## Inscription

1. Aller sur **https://partnernet.amazon.de/**
2. Créer un compte Amazon Associates
3. Soumettre le site `preisradio.de` pour validation
4. Obtenir votre **Tracking ID** (ex: `preisradio-21`)

---

## Configuration

### Variable d'environnement

#### Local (`.env.local`)
```env
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=preisradio-21
```

#### Vercel (Production)
- Aller dans Vercel → Settings → Environment Variables
- Ajouter : `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` = `preisradio-21`
- Environnements : Production + Preview

**Note** : Si la variable est vide ou absente, le bouton Amazon est automatiquement masqué.

---

## Implémentation

### Bouton "Auch auf Amazon suchen"
**Fichier** : `src/app/product/[id]/ProductDetailClient.tsx`

Position : Sous le bouton principal "Jetzt kaufen", sur chaque page produit.

Format du lien affilié :
```
https://www.amazon.de/s?k=TITRE_PRODUIT&tag=TRACKING_ID
```

Caractéristiques :
- Couleur : Orange Amazon `#FF9900`
- Attribut `rel="noopener noreferrer sponsored"` (conforme SEO)
- Mention légale affichée automatiquement : *"Affiliate-Link: Wir erhalten eine Provision bei Kauf über Amazon."*
- Conditionnel : s'affiche uniquement si `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` est défini

---

## Commissions Amazon.de

| Catégorie | Commission |
|-----------|-----------|
| Elektronikartikel (Handys, TV, etc.) | 1% |
| Haushaltsgeräte | 3% |
| Computer & Zubehör | 1% |
| Spielzeug & Spiele | 6% |
| Mode & Schuhe | 10% |

---

## Loi Applicable (Pflichtangaben)

Conformément à la loi allemande sur les Influencer et aux CGU Amazon, la mention suivante est requise :
> *"Affiliate-Link: Wir erhalten eine Provision bei Kauf über Amazon."*

Cette mention est affichée automatiquement sous le bouton Amazon.

---

## Prochaines Étapes (Phase 2 & 3)

### Phase 2 - Amazon comme retailer
- Scraper Amazon.de avec les prix + images
- Stocker les liens avec `?tag=TRACKING_ID` dans le backend Django
- Afficher Amazon dans le comparateur de prix

### Phase 3 - Product Advertising API (PAAPI)
- Accès API disponible après 3 ventes qualifiées en 180 jours
- Documentation : https://webservices.amazon.de/paapi5/documentation/
- SDK Python : `pip install amazon-paapi5`
- Permet : prix en temps réel, images HD, avis, disponibilité
