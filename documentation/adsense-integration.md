# Intégration Google AdSense - Preisradio

## Configuration Générale

- **Publisher ID**: `ca-pub-8451378376537532`
- **Environnement**: Ads affichées uniquement en production
- **Mode développement**: Placeholder gris visible pour le positionnement

---

## Composants AdSense

### 1. AdSenseDisplay
**Fichier**: `src/components/AdSenseDisplay.tsx`

Affiche des bannières display responsives (horizontal/carré/vertical).

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `adSlot` | string | requis | ID du slot AdSense |
| `className` | string | `''` | Classes CSS additionnelles |

### 2. AdSenseInFeed
**Fichier**: `src/components/AdSenseInFeed.tsx`

Ads natives intégrées dans les grilles de produits.

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `adSlot` | string | `'6399181253'` | ID du slot AdSense |
| `layoutKey` | string | `'-fb+5w+4e-db+86'` | Clé de layout native |
| `className` | string | `''` | Classes CSS additionnelles |

### 3. AdSenseInArticle
**Fichier**: `src/components/AdSenseInArticle.tsx`

Ads natives pour le contenu éditorial (descriptions produits).

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `adSlot` | string | `'2891416164'` | ID du slot AdSense |
| `className` | string | `''` | Classes CSS additionnelles |

### 4. AdSenseMultiplex
**Fichier**: `src/components/AdSenseMultiplex.tsx`

Grille d'annonces recommandées en fin de page.

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `adSlot` | string | `'4012926140'` | ID du slot AdSense |
| `className` | string | `''` | Classes CSS additionnelles |

---

## Slots AdSense

| Slot ID | Nom | Type | Format | Usage |
|---------|-----|------|--------|-------|
| `1502312871` | preisradio-display-leaderboard | Display | Horizontal | Headers de pages |
| `8370973552` | preisradio-display-rectangle | Display | Carré | Page produit |
| `6399181253` | preisradio-infeed | In-Feed | Native | Grilles de produits |
| `2891416164` | preisradio-inarticle | In-Article | Native | Descriptions |
| `4012926140` | preisradio-multiplex | Multiplex | Horizontal | Fin de pages |
| `6054157785` | preisradio-footer | Display | - | Footer (ancien) |

---

## Intégration par Page

### Page d'Accueil (`/`)
**Fichier**: `src/components/HomeContent.tsx`

| Position | Composant | Slot |
|----------|-----------|------|
| Après "Top Angebote" | AdSenseDisplay | `1502312871` |
| Avant "Warum Preisradio?" | AdSenseMultiplex | `4012926140` |

### Page Produit (`/product/[id]`)
**Fichier**: `src/app/product/[id]/ProductDetailClient.tsx`

| Position | Composant | Slot |
|----------|-----------|------|
| Après description | AdSenseInArticle | `2891416164` |
| Après comparaison prix | AdSenseDisplay | `8370973552` |
| Après produits similaires | AdSenseMultiplex | `4012926140` |

### Page Catégorie (`/kategorien/[slug]`)
**Fichier**: `src/app/kategorien/[slug]/CategoryDetailClient.tsx`

| Position | Composant | Slot |
|----------|-----------|------|
| Après header hero | AdSenseDisplay | `1502312871` |
| Tous les 6 produits | AdSenseInFeed | `6399181253` |
| Avant footer | AdSenseMultiplex | `4012926140` |

### Page Marque (`/marken/[slug]`)
**Fichier**: `src/app/marken/[slug]/BrandDetailClient.tsx`

| Position | Composant | Slot |
|----------|-----------|------|
| Après stats | AdSenseDisplay | `1502312871` |
| Tous les 6 produits | AdSenseInFeed | `6399181253` |
| Avant footer | AdSenseMultiplex | `4012926140` |

### Page Recherche (`/search`)
**Fichier**: `src/app/search/page.tsx`

| Position | Composant | Slot |
|----------|-----------|------|
| Après header | AdSenseDisplay | `1502312871` |
| Tous les 6 produits | AdSenseInFeed | `6399181253` |
| Avant footer | AdSenseMultiplex | `4012926140` |

---

## Configuration Auto Ads (Recommandée)

### Annonces Ancrées (Anchor Ads)
- Activer: Oui
- Position: Bas uniquement
- Réductible: Oui
- Desktop: Désactivé (évite conflit avec navigation)

### Side Rail
- Activer: Oui
- Position: Droite uniquement

### Vignettes
- Activer: Oui
- Fréquence: 10 minutes
- Desktop: Désactivé (moins intrusif)

---

## Script AdSense

Le script AdSense est chargé globalement dans `src/app/layout.tsx`:

```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8451378376537532"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

---

## Bonnes Pratiques UX

1. **Espacement**: Minimum `my-6` ou `my-8` autour des ads
2. **In-Feed**: Maximum 1 ad tous les 6 produits
3. **Multiplex**: 1 seul par page, en fin de contenu
4. **Mobile**: Éviter anchor ads en haut (conflit scroll)
5. **Desktop**: Éviter vignettes (frustration utilisateur)

---

## Débogage

En mode développement (`NODE_ENV !== 'production'`), les ads affichent un placeholder gris avec le type d'ad indiqué, permettant de vérifier le positionnement sans charger les vraies publicités.
