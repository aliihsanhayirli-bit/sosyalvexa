#!/bin/bash
# GYD Grup — GYD staging build & deploy
# Production'a dokunmaz. /var/www/gydgrup-staging/ altına koyar.
set -e

cd "$(dirname "$0")/.."

echo "→ Build (GYD staging mode)"
VITE_GYD_STAGING=1 npm run build

echo "→ Deploy to /var/www/gydgrup-staging/"
mkdir -p /var/www/gydgrup-staging
rsync -a --delete dist/ /var/www/gydgrup-staging/dist/

echo "OK. GYD staging built. nginx location /gyd-staging/ aktif."
