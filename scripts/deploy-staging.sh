#!/bin/bash
# YCA Yatırım — Staging build & deploy
# Production'a dokunmaz. /var/www/yca-staging/ altına koyar.
set -e

cd "$(dirname "$0")/.."

echo "→ Build (staging mode)"
VITE_STAGING=1 npm run build

echo "→ Deploy to /var/www/yca-staging/"
mkdir -p /var/www/yca-staging
rsync -a --delete dist/ /var/www/yca-staging/dist/

echo "→ Restart nothing (static build)"
echo "OK. Staging built. Şimdi nginx'e /staging/ location ekleyin ve reload edin."
