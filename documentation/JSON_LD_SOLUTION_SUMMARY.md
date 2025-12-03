# JSON-LD Rich Snippets - Résolution du Problème

## Problème
Google Rich Snippets ne détectait les schémas Product que sur la page d'accueil, pas sur les pages produits.

## Cause
Google crawle le HTML initial, pas le JavaScript côté client. Les schémas générés côté client (dans page.tsx) n'étaient pas visibles au crawl.

## Solution
Créer un **layout.tsx** dans le répertoire `[id]` qui:
- Récupère les données du produit côté serveur
- Génère les schémas Product et BreadcrumbList
- Injecte les scripts JSON-LD directement dans le HTML

## Résultat
✅ Google Rich Snippets détecte maintenant les schémas Product sur toutes les pages produits
✅ Les schémas apparaissent dans le source HTML initial
✅ BreadcrumbList améliore la navigation SEO

## Architecture
```
layout.tsx  ← Injecte schemas dans le <head>
   ↓
page.tsx    ← Affiche le contenu
metadata.ts ← Génère les métadonnées OG/Twitter
```
