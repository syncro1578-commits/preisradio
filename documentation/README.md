# Preisradio - Comparateur de Prix Allemand

Comparateur de prix en temps réel pour les produits électroniques allemands (Saturn, MediaMarkt, Otto, Kaufland) avec Django backend API et Next.js frontend.

## Dépôt Git

| Remote | URL | Usage |
|--------|-----|-------|
| `origin` | `https://github.com/syncro1578-commits/Preisradio-project.git` | Dépôt principal |
| `upstream` | `https://github.com/Gas1212/preisradio.git` | Dépôt historique |
| `serv00` | `ssh://wael@repo11.serv00.com/~/repo/git/pub/preisradio/` | Hébergement production |

---

## Architecture

```
core/
├── documentation/                    # Toute la documentation technique
│   ├── README.md                     # Ce fichier
│   ├── INDEX.md                      # Index de la documentation
│   ├── adsense-integration.md        # Intégration Google AdSense
│   ├── DEPLOYMENT.md                 # Guide de déploiement
│   ├── SERV00_SETUP.md               # Configuration Serv00
│   ├── PROJECT_STRUCTURE.md          # Structure du projet
│   ├── FRONTEND_README.md            # Documentation frontend
│   ├── FRONTEND_CACHE_PURGE.md       # Stratégie de cache
│   ├── SEO_IMPROVEMENTS_SUMMARY.md   # Améliorations SEO
│   ├── SITEMAP_STRATEGY.md           # Stratégie sitemap
│   └── TESTING_RICH_SNIPPETS.md      # Test rich snippets
└── preisradio/
    ├── preisradio-backend/           # API Django REST
    └── preisradio-frontend/          # Application Next.js
```

---

## Stack Technique

### Backend
- **Django 5.x** + Django REST Framework
- **Python 3.11**
- **Base de données** : PostgreSQL (production) / SQLite (dev)
- **Hébergement** : Serv00
- **Retailers** : Saturn, MediaMarkt, Otto, Kaufland

### Frontend
- **Next.js 15** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS**
- **PWA** : Service Worker, Manifest, installation mobile
- **Google AdSense** : `ca-pub-8451378376537532`
- **Hébergement** : Vercel

---

## Setup Backend Django

```bash
cd preisradio/preisradio-backend
python3 -m venv venv
source venv/bin/activate        # Linux/Mac
# ou venv\Scripts\activate      # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Backend disponible à `http://localhost:8000`

---

## Setup Frontend Next.js

```bash
cd preisradio/preisradio-frontend
npm install
```

Créer `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=https://preisradio.de
```

```bash
npm run dev      # Développement → http://localhost:3000
npm run build    # Build production
npm start        # Serveur production
```

---

## API Endpoints

### Produits
- `GET /api/products/` - Liste + filtres (`search`, `category`, `brand`, `retailer`, `sort`)
- `GET /api/products/{id}/` - Détail produit
- `GET /api/kaufland-products/` - Produits Kaufland

### Catégories & Marques
- `GET /api/categories/` - Liste des catégories
- `GET /api/brands/` - Liste des marques
- `GET /api/categories/{slug}/` - Détail catégorie

### Cache
- `POST /api/revalidate/` - Invalider le cache ISR Next.js

---

## Pages Frontend

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil + Top Angebote |
| `/product/[id]` | Détail produit |
| `/kategorien` | Liste catégories |
| `/kategorien/[slug]` | Détail catégorie |
| `/marken` | Liste marques |
| `/marken/[slug]` | Détail marque |
| `/search` | Recherche avec filtres |

---

## PWA Configuration

- **Manifest** : `public/manifest.json`
- `background_color` : `#000000` (splash screen noir)
- `theme_color` : `#2563eb` (bleu)
- Icônes : `icon-192.png`, `icon-512.png`

---

## Google AdSense

Publisher ID : `ca-pub-8451378376537532`

Voir [adsense-integration.md](adsense-integration.md) pour les détails complets.

| Slot | ID | Type |
|------|----|------|
| Display Leaderboard | `1502312871` | Horizontal |
| Display Rectangle | `8370973552` | Carré |
| In-Feed | `6399181253` | Native |
| In-Article | `2891416164` | Native |
| Multiplex | `4012926140` | Grille |

---

## Déploiement Production

```bash
# Frontend (Vercel - auto via git push)
git push origin master

# Backend (Serv00)
git push serv00 master
```

---

## Admin Django

`https://preisradio.de/admin/` — Gestion produits, catégories, marques, retailers.
