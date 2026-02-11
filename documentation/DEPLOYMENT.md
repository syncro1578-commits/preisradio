# Guide de Déploiement et Test - PrixRadio

## Configuration MongoDB

### Prérequis
- MongoDB 4.4+ installé et en cours d'exécution
- URL de connexion MongoDB disponible

### Connection MongoDB
```bash
# Pour développement local
mongodb://localhost:27017/preisradio

# Pour production avec authentification
mongodb://user:password@host:port/preisradio?authSource=admin&retryWrites=true
```

## Configuration des Variables d'Environnement

### 1. Créer le fichier `.env`
```bash
cp .env.example .env
```

### 2. Configuration pour Développement (`DEBUG=True`)
```bash
SECRET_KEY=your-dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,*.local

MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB_NAME=preisradio
MONGODB_USER=
MONGODB_PASSWORD=

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8000

LOG_LEVEL=DEBUG
SECURE_SSL_REDIRECT=False
```

### 3. Configuration pour Production (`DEBUG=False`)
```bash
SECRET_KEY=your-production-secret-key-min-50-chars-random
DEBUG=False
ALLOWED_HOSTS=preisradio.de,www.preisradio.de

MONGODB_HOST=mongodb.production.host
MONGODB_PORT=27017
MONGODB_DB_NAME=preisradio
MONGODB_USER=preisradio_user
MONGODB_PASSWORD=secure_password_here
MONGODB_AUTH_SOURCE=admin

CORS_ALLOWED_ORIGINS=https://preisradio.de,https://www.preisradio.de

NEXT_PUBLIC_API_URL=https://preisradio.de

LOG_LEVEL=INFO
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

## Testing en Développement

### 1. Installation des dépendances
```bash
cd /path/to/preisradio

# Activer le venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Lancer MongoDB en local
```bash
# Avec docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou installer localement
# macOS: brew install mongodb-community && brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 3. Lancer le serveur Django
```bash
# En développement
python manage.py runserver 0.0.0.0:8000

# Ou avec Gunicorn (production-like)
gunicorn comparateur_allemand.wsgi -b 0.0.0.0:8000
```

### 4. Tester les endpoints

#### Health Check
```bash
curl http://localhost:8000/api/health/
# Réponse attendue:
# {"status":"healthy","message":"PrixRadio API is running",...}
```

#### API Status
```bash
curl http://localhost:8000/api/status/
# Réponse attendue:
# {"status":"operational","version":"1.0.0","api":{"products":0,"retailers":0},...}
```

#### Lister les produits
```bash
curl http://localhost:8000/api/products/
# Réponse attendue:
# {"count":0,"next":null,"previous":null,"results":[]}
```

#### Lister les détaillants
```bash
curl http://localhost:8000/api/retailers/
# Réponse attendue:
# {"count":0,"next":null,"previous":null,"results":[]}
```

### 5. Tester avec MongoDB

#### Ajouter un détaillant
```bash
python manage.py shell

from products.models import Retailer
retailer = Retailer.objects.create(
    name="Amazon.de",
    slug="amazon-de",
    website="https://www.amazon.de"
)
retailer.save()
print(retailer)
```

#### Ajouter un produit
```python
from products.models import Product, Price, Retailer

retailer = Retailer.objects.get(slug="amazon-de")

product = Product.objects.create(
    ean="9783161484100",
    name="Exemple Produit",
    category="Livres",
    description="Un produit de test"
)

price = Price(
    retailer=retailer,
    price=19.99,
    currency="EUR",
    stock_status="in_stock",
    url="https://www.amazon.de/example"
)

product.prices.append(price)
product.save()
print(product)
```

### 6. Frontend Testing
```bash
cd frontend

# Installer dépendances
npm install

# Lancer le serveur
npm run dev

# Accessible à http://localhost:3000
```

## Déploiement en Production

### Architecture Recommandée
```
┌─────────────────┐
│  CloudFlare     │
│  (CDN + DNS)    │
└────────┬────────┘
         │
┌────────▼────────────────────────┐
│  Load Balancer (nginx/haproxy)   │
├──────────────────────────────────┤
│  - SSL/TLS Termination           │
│  - Rate Limiting                 │
│  - Compression                   │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
    │           │
┌───▼──┐   ┌───▼──┐
│ API  │   │ API  │
│  #1  │   │  #2  │
└───┬──┘   └───┬──┘
    │          │
    └────┬─────┘
         │
    ┌────▼─────────┐
    │  MongoDB     │
    │  Cluster     │
    └──────────────┘
```

### 1. Préparation du Serveur

```bash
# Mettre à jour les packages
sudo apt update && sudo apt upgrade -y

# Installer Python 3.11+
sudo apt install python3.11 python3.11-venv python3-pip

# Installer MongoDB
sudo apt-get install -y mongodb

# Installer nginx
sudo apt install nginx

# Installer Gunicorn
pip install gunicorn
```

### 2. Déployer le Backend

```bash
# Cloner le repo
git clone https://github.com/Gas1212/preisradio.git
cd preisradio

# Créer venv
python3.11 -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r requirements.txt

# Configurer .env
cp .env.example .env
# Éditer .env avec les config production

# Créer les logs
mkdir -p logs

# Vérifier que tout fonctionne
python manage.py check
```

### 3. Setup Systemd Service

```bash
# Créer /etc/systemd/system/preisradio.service
sudo nano /etc/systemd/system/preisradio.service
```

```ini
[Unit]
Description=PrixRadio Django API
After=network.target mongodb.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/preisradio
Environment="PATH=/var/www/preisradio/venv/bin"
ExecStart=/var/www/preisradio/venv/bin/gunicorn \
    --workers 4 \
    --worker-class sync \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/preisradio/access.log \
    --error-logfile /var/log/preisradio/error.log \
    --log-level info \
    comparateur_allemand.wsgi:application

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Activer le service
sudo systemctl daemon-reload
sudo systemctl enable preisradio
sudo systemctl start preisradio
sudo systemctl status preisradio
```

### 4. Configuration Nginx

```bash
# /etc/nginx/sites-available/preisradio
sudo nano /etc/nginx/sites-available/preisradio
```

```nginx
upstream preisradio {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name preisradio.de www.preisradio.de;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name preisradio.de www.preisradio.de;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/preisradio.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/preisradio.de/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    gzip_min_length 1024;

    # API Proxy
    location /api/ {
        proxy_pass http://preisradio;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health Check Endpoint
    location /health/ {
        proxy_pass http://preisradio;
        access_log off;
    }

    # Static Files (si présents)
    location /static/ {
        alias /var/www/preisradio/staticfiles/;
        expires 30d;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/preisradio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Let's Encrypt SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d preisradio.de -d www.preisradio.de
sudo certbot renew --dry-run  # Test auto-renewal
```

### 6. Collecte des Fichiers Statiques

```bash
cd /var/www/preisradio
source venv/bin/activate
python manage.py collectstatic --noinput
```

## Monitoring et Logs

### Vérifier le statut du service
```bash
sudo systemctl status preisradio
tail -f /var/log/preisradio/error.log
tail -f /var/log/preisradio/access.log
```

### MongoDB Monitoring
```bash
# Connexion au shell MongoDB
mongo

# Voir les databases
show dbs

# Voir les collections
use preisradio
show collections

# Vérifier les stats
db.products.stats()
db.retailers.stats()
```

### Performance Monitoring
```bash
# Utilisation mémoire/CPU
top

# Connexions réseau
netstat -tlnp | grep gunicorn

# Logs MongoDB
tail -f /var/log/mongodb/mongod.log
```

## Rollback Plan

En cas de problème en production :

```bash
# 1. Vérifier les logs
sudo journalctl -u preisradio -n 50

# 2. Arrêter le service
sudo systemctl stop preisradio

# 3. Revenir à la version précédente
git checkout previous_commit

# 4. Redémarrer
sudo systemctl start preisradio

# 5. Vérifier l'health check
curl https://preisradio.de/api/health/
```

## Checklist de Déploiement

- [ ] Les variables d'environnement sont configurées
- [ ] MongoDB est accessible et sauvegardé
- [ ] SECRET_KEY est changé et sécurisé
- [ ] DEBUG=False en production
- [ ] SSL/TLS est configuré
- [ ] CORS_ALLOWED_ORIGINS est correct
- [ ] Les logs sont configurés
- [ ] Les sauvegardes MongoDB sont en place
- [ ] Le health check répond correctement
- [ ] Les performances sont acceptables
- [ ] Le domaine DNS pointe vers le serveur

## Backup et Disaster Recovery

### Backup MongoDB
```bash
# Backup complet
mongodump --uri="mongodb://user:pass@host:27017/preisradio" --out=/backups/preisradio

# Restaurer
mongorestore --uri="mongodb://user:pass@host:27017" /backups/preisradio

# Backup automatique (cron job)
0 2 * * * /usr/bin/mongodump --uri="mongodb://..." --out=/backups/$(date +\%Y\%m\%d)
```

### Application Backup
```bash
# Backup du code et configuration
tar -czf /backups/preisradio-code-$(date +%Y%m%d).tar.gz /var/www/preisradio

# Garder les 7 derniers backups
find /backups -name "preisradio-code-*.tar.gz" -mtime +7 -delete
```
