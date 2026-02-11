# Configuration serv00.com - PrixRadio

Guide complet pour déployer PrixRadio sur serv00.com avec Phusion Passenger.

## 📋 Prérequis

- Domaine configuré sur serv00.com (`preisradio.de`)
- Accès SSH au serveur
- Python 3.11+ installé
- MongoDB Atlas configurée avec les credentials

## 🚀 Étapes de Déploiement

### 1. Structure du Projet

Le projet Django doit être situé à:
```
/usr/home/LOGIN/domains/DOMAIN/public_python/
```

Exactement:
```
/usr/home/wael/domains/preisradio.de/public_python/comparateur_allemand/
```

### 2. Cloner le Projet

```bash
cd /usr/home/wael/domains/preisradio.de/

# Supprimer le dossier par défaut (si existe)
rm -rf public_python

# Cloner le projet
git clone https://github.com/Gas1212/preisradio.git public_python
cd public_python
```

### 3. Récupérer les Derniers Changements

```bash
cd /usr/home/wael/domains/preisradio.de/public_python/comparateur_allemand

# Récupérer la branche de développement
git fetch origin
git checkout claude/setup-price-comparison-01CfrVMn1qHSQHu9M2sdSBCH
git pull origin claude/setup-price-comparison-01CfrVMn1qHSQHu9M2sdSBCH

# Vérifier les fichiers essentiels
ls -la products/health.py
ls -la passenger_wsgi.py
```

### 4. Configurer l'Environnement Python

```bash
# Créer l'environnement virtuel
python3.11 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Créer le Fichier .env

```bash
# Copier le template
cp .env.site1 .env

# Éditer avec vos informations
nano .env
```

**Exemple pour Site 1:**
```bash
SECRET_KEY=%ua=_chicij04!kw#zepmkr-4xi$b9=bs4w&(_yhukf&80h8s=
DEBUG=False
ALLOWED_HOSTS=preisradio.de,www.preisradio.de

MONGODB_HOST=cluster0.pzd9gka.mongodb.net
MONGODB_PORT=27017
MONGODB_DB_NAME=preisradio
MONGODB_USER=stronglimitless76_db_user
MONGODB_PASSWORD=57TTiq5TKuwSWJjR
MONGODB_AUTH_SOURCE=admin

CORS_ALLOWED_ORIGINS=https://preisradio.de,https://www.preisradio.de
NEXT_PUBLIC_API_URL=https://preisradio.de

LOG_LEVEL=INFO
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

### 6. Tester la Configuration Django

```bash
# Vérifier la configuration
python manage.py check

# Devrait afficher: "System check identified no issues"
```

### 7. Collecte des Fichiers Statiques

```bash
python manage.py collectstatic --noinput
```

Files seront collectés dans `/public/static/`

### 8. Test du WSGI Passenger

```bash
# Tester que passenger_wsgi.py fonctionne
python passenger_wsgi.py

# Ne doit retourner aucune erreur
```

---

## ⚙️ Configuration Phusion Passenger

### Structure du Répertoire Public

Après `collectstatic`, la structure doit être:

```
/usr/home/wael/domains/preisradio.de/
├── public/
│   ├── .htaccess
│   ├── static/          # Fichiers statiques (CSS, JS, images)
│   │   └── ...
│   └── media/           # Fichiers uploadés
├── public_python/       # Code Django
│   ├── comparateur_allemand/
│   ├── products/
│   ├── manage.py
│   ├── passenger_wsgi.py
│   ├── .env
│   └── requirements.txt
└── logs/                # Logs
    ├── error.log
    └── access.log
```

### Permissions

```bash
# S'assurer que les permissions sont correctes
chmod 755 /usr/home/wael/domains/preisradio.de/public_python/
chmod 600 /usr/home/wael/domains/preisradio.de/public_python/.env

# Le répertoire public doit être accessible
chmod 755 /usr/home/wael/domains/preisradio.de/public/
```

---

## 🧪 Test de l'Application

### Health Check

```bash
# Depuis votre machine locale
curl https://preisradio.de/api/health/

# Devrait retourner:
# {"status":"healthy","message":"PrixRadio API is running",...}
```

### Statut de la BD

```bash
curl https://preisradio.de/api/status/

# Devrait retourner:
# {"status":"operational","version":"1.0.0","api":{"products":0,"retailers":0},...}
```

### Lister les Produits

```bash
curl https://preisradio.de/api/products/

# Devrait retourner:
# {"count":0,"next":null,"previous":null,"results":[]}
```

---

## 🔄 Redémarrage de l'Application

Pour redémarrer l'application après des changements:

### Via le Panel DevilWEB

Aller dans: **WWW websites** → **Manage** (preisradio.de) → **Restart**

### Via la Ligne de Commande

```bash
# Via devil
devil www preisradio.de restart
```

---

## 📊 Configuration des Processus

Si vous avez besoin de plus de processus Phusion Passenger:

```bash
# Voir la limite actuelle
devil www preisradio.de list

# Changer le nombre de processus (1-80% du max)
devil www options preisradio.de processes 4
```

---

## 🔍 Dépannage

### Erreur: ModuleNotFoundError: No module named 'products.health'

**Solution:**
```bash
cd /usr/home/wael/domains/preisradio.de/public_python/comparateur_allemand
git pull origin claude/setup-price-comparison-01CfrVMn1qHSQHu9M2sdSBCH
```

### Erreur: MongoDB Connection Refused

**Vérifier:**
1. Les credentials MongoDB Atlas sont corrects dans `.env`
2. L'IP du serveur est dans MongoDB Atlas Whitelist
3. La base de données existe dans MongoDB Atlas

### Erreur: Django Settings Module Not Found

**Vérifier:** Le fichier `passenger_wsgi.py` est correct:
```python
os.environ['DJANGO_SETTINGS_MODULE'] = 'comparateur_allemand.settings'
```

---

## 📝 Logs

Les logs sont sauvegardés dans:

```
/usr/home/wael/domains/preisradio.de/logs/error.log
/usr/home/wael/domains/preisradio.de/logs/access.log
```

Voir les logs:
```bash
tail -f /usr/home/wael/domains/preisradio.de/logs/error.log
```

---

## 🔐 Sécurité

- ✓ `.env` NOT in git (already in .gitignore)
- ✓ DEBUG=False en production
- ✓ SECRET_KEY unique et sécurisée
- ✓ HTTPS activé (SECURE_SSL_REDIRECT=True)
- ✓ MongoDB credentials stockés localement seulement

---

## 📞 Support

Pour plus d'informations sur Phusion Passenger sur serv00.com, consultez:
https://serv00.com/help/

Django Documentation:
https://docs.djangoproject.com/

MongoDB Atlas:
https://www.mongodb.com/cloud/atlas
