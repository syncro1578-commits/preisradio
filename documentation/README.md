# PrixRadio - Comparateur de Prix Allemand

Comparateur de prix en temps réel pour les produits allemands avec Django backend API et Next.js frontend.

## Architecture

```
preisradio/
├── Backend (Django REST API)
│   ├── comparateur_allemand/     # Configuration Django
│   ├── products/                  # App Django pour les produits
│   │   ├── models.py              # Modèles: Product, Retailer, Price
│   │   ├── views.py               # ViewSets API REST
│   │   ├── serializers.py         # Serializers DRF
│   │   └── urls.py                # Routes API
│   ├── manage.py
│   └── requirements.txt
└── Frontend (Next.js)
    ├── app/                       # App Next.js (App Router)
    │   ├── page.tsx               # Page d'accueil
    │   ├── products/[id]/page.tsx # Page détail produit
    │   ├── layout.tsx             # Layout global
    │   └── globals.css            # Styles globaux
    ├── lib/
    │   ├── api/client.ts          # Client API axios
    │   └── components/            # Composants React
    ├── package.json
    └── next.config.js
```

## Setup Backend Django

### 1. Créer et activer l'environnement virtuel

```bash
cd /home/user/preisradio
python3 -m venv venv
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Migrations de base de données

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Créer un superuser (optionnel)

```bash
python manage.py createsuperuser
```

### 5. Lancer le serveur Django

```bash
python manage.py runserver 0.0.0.0:8000
```

Le backend sera disponible à `http://localhost:8000`

## Setup Frontend Next.js

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Variables d'environnement

Créez un fichier `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le frontend sera disponible à `http://localhost:3000`

## API Endpoints

### Products

- `GET /api/products/` - Lister tous les produits
- `GET /api/products/{id}/` - Détail d'un produit
- `GET /api/products/{ean}/by_ean/` - Produit par code EAN
- Paramètres de recherche: `search`, `category`

### Retailers

- `GET /api/retailers/` - Lister tous les détaillants
- `GET /api/retailers/{id}/` - Détail d'un détaillant

### Prices

- `GET /api/prices/` - Lister tous les prix
- Paramètres de filtrage: `product`, `retailer`, `stock_status`

## Models

### Product
- `ean` - Code EAN unique
- `name` - Nom du produit
- `description` - Description
- `category` - Catégorie
- `image` - Image du produit

### Retailer
- `name` - Nom du détaillant
- `slug` - Slug URL
- `website` - Site web
- `logo` - Logo du détaillant

### Price
- `product` - Référence au produit
- `retailer` - Référence au détaillant
- `price` - Montant du prix
- `stock_status` - État du stock
- `url` - Lien d'achat
- `last_checked` - Dernière vérification

## Technologies

### Backend
- Django 5.2
- Django REST Framework
- Django CORS Headers
- Django Filter
- Pillow (image handling)
- Python 3.11

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Développement

### Code structure
- Backend: API REST suivant les conventions DRF
- Frontend: App Router Next.js avec composants réutilisables

### Recherche et Filtrage
- Recherche full-text par nom, EAN, description
- Filtrage par catégorie
- Tri par prix, date

## Production

Pour déployer en production:

**Backend:**
```bash
python manage.py collectstatic
gunicorn comparateur_allemand.wsgi
```

**Frontend:**
```bash
npm run build
npm start
```

## Admin Django

Accédez à `http://localhost:8000/admin/` pour gérer:
- Les produits
- Les détaillants
- Les prix

## Documentation

Pour plus d'informations sur:
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
