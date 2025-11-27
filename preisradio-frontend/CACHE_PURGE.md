# Comment purger le cache Vercel

## 🔄 Nouvelle configuration de cache

### Pages principales (/, /kategorien, etc.)
- **Browser**: `max-age=0` (pas de cache navigateur)
- **CDN**: `s-maxage=60` (1 minute sur le CDN)
- **Revalidation**: `must-revalidate` (force la revalidation)

### Pages produits (/product/*)
- **Browser**: `max-age=60` (1 minute)
- **CDN**: `s-maxage=300` (5 minutes)
- **Stale**: `stale-while-revalidate=600` (utilise l'ancien pendant 10 min si mise à jour)

### Assets statiques (/_next/static/*)
- **Cache permanent**: `max-age=31536000, immutable` (1 an)

## 🚀 Méthodes pour purger le cache

### Méthode 1 : Via le Dashboard Vercel (Recommandé)
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **preisradio**
3. Allez dans l'onglet **Deployments**
4. Cliquez sur le déploiement actif
5. Cliquez sur **"Redeploy"** puis **"Redeploy without cache"**

### Méthode 2 : Via l'URL (Force Refresh)
```bash
# Ajouter ?nocache=timestamp à l'URL
https://preisradio.de/?nocache=1732709876
https://preisradio.de/product/123?nocache=1732709876
```

### Méthode 3 : Hard Refresh navigateur
- **Windows/Linux**: `Ctrl + F5` ou `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Chrome DevTools**: Clic droit sur refresh → "Empty Cache and Hard Reload"

### Méthode 4 : Via Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Purger tout le cache
vercel env pull

# Redéployer sans cache
vercel --prod --force
```

### Méthode 5 : API Vercel (Avancé)
```bash
# Obtenir le token depuis https://vercel.com/account/tokens
curl -X PURGE https://preisradio.de/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Après chaque déploiement

1. ✅ Attendez 1-2 minutes que le déploiement soit terminé
2. ✅ Faites un **Hard Refresh** (Ctrl+F5) dans votre navigateur
3. ✅ Si les changements ne sont pas visibles, utilisez le mode **Incognito**
4. ✅ En dernier recours, utilisez **"Redeploy without cache"** sur Vercel

## 🐛 Debugging du cache

### Vérifier les headers de cache
```bash
curl -I https://preisradio.de/ | grep -i cache

# Devrait afficher :
# cache-control: public, max-age=0, s-maxage=60, must-revalidate
```

### Vérifier si le cache est le problème
1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet **Network**
3. Cochez **"Disable cache"**
4. Rechargez la page
5. Si les changements apparaissent, c'était bien un problème de cache

## ⚠️ Note importante

Les fichiers JavaScript/CSS dans `_next/static/` ont un cache de **1 an** car ils ont des hash uniques. Si vous modifiez le code, Next.js génère de nouveaux fichiers avec de nouveaux hash, donc pas besoin de purger ce cache.
