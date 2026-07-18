#!/usr/bin/env bash
# GYD GRUP — production deploy
#   • Frontend build → /var/www/gydgrup/dist/
#   • PB migrations/hooks → /opt/gyd-pocketbase/ (pb_data DOKUNULMAZ)
#   • Restart: gyd-pocketbase + gyd-api, reload nginx
#
# Kullanım: scripts/deploy-prod.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PB_HOME="/opt/gyd-pocketbase"
DIST_HOME="/var/www/gydgrup/dist"

echo "▶ GYD prod deploy — $ROOT"

echo "  → build"
npm run build

echo "  → frontend → $DIST_HOME"
rsync -a --delete "$ROOT/dist/" "$DIST_HOME/"

echo "  → PB hooks → $PB_HOME/pb_hooks/"
rsync -a --delete \
  --exclude='.gitkeep' \
  "$ROOT/backend/pb_hooks/" "$PB_HOME/pb_hooks/"

echo "  → PB migrations → $PB_HOME/pb_migrations/"
rsync -a --delete \
  --exclude='.gitkeep' \
  --exclude='journal/' \
  "$ROOT/backend/pb_migrations/" "$PB_HOME/pb_migrations/"

echo "  → reload nginx + restart gyd-pocketbase + gyd-api"
nginx -t >/dev/null
systemctl reload nginx
systemctl restart gyd-pocketbase gyd-api

echo "  → seed (idempotent: 9 bölge + 9 arsa + 2 RAG + bot_settings)"
# PB'nin tamamen ayağa kalkması için kısa bekleme
for i in 1 2 3 4 5; do
  if curl -s -o /dev/null -w "%{http_code}" "${PB_URL:-http://127.0.0.1:8090}/api/health" 2>/dev/null | grep -q 200; then
    break
  fi
  sleep 1
done
if [ -f "$ROOT/.env" ]; then
  set -a; . "$ROOT/.env"; set +a
fi
node "$ROOT/scripts/seed-prod.mjs" 2>&1 | sed 's/^/    /'

echo "✓ GYD prod deploy tamam."
