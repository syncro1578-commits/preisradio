#!/bin/bash

# Script pour basculer entre les 2 sites web

if [ "$1" == "site1" ] || [ "$1" == "preisradio" ]; then
    echo "🔄 Basculement vers SITE 1 - PrixRadio..."
    cp .env.site1 .env
    echo "✅ Environnement .env activé pour Site 1 (PrixRadio)"
    echo "   Base: cluster0.pzd9gka.mongodb.net"
    echo "   URL: https://preisradio.de"

elif [ "$1" == "site2" ] || [ "$1" == "mediamarkt" ]; then
    echo "🔄 Basculement vers SITE 2 - MediaMarkt..."
    cp .env.site2 .env
    echo "✅ Environnement .env activé pour Site 2 (MediaMarkt)"
    echo "   Base: mediamarkt.iwjamu6.mongodb.net"
    echo "   URL: https://mediamarkt.preisradio.de"

elif [ "$1" == "status" ]; then
    echo "📋 Configuration actuelle:"
    if [ -f .env ]; then
        echo ""
        echo "Domaine (ALLOWED_HOSTS):"
        grep "ALLOWED_HOSTS" .env
        echo ""
        echo "MongoDB Host:"
        grep "MONGODB_HOST" .env
        echo ""
        echo "Base de données:"
        grep "MONGODB_DB_NAME" .env
    else
        echo "❌ Pas de fichier .env trouvé"
    fi

else
    echo "Usage: ./switch-env.sh [site1|site2|preisradio|mediamarkt|status]"
    echo ""
    echo "Exemples:"
    echo "  ./switch-env.sh site1        # Basculer vers Site 1 (PrixRadio)"
    echo "  ./switch-env.sh site2        # Basculer vers Site 2 (MediaMarkt)"
    echo "  ./switch-env.sh status       # Voir la configuration actuelle"
    exit 1
fi
