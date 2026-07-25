#!/usr/bin/env bash
# Vexabiz Digital — production deploy (sos.vexabiz.com)
#   • Frontend build → /var/www/vexabiz-sos/dist/
#   • PB hooks → /opt/vexabiz-pocketbase/pb_hooks/
#   • PB migrations → /opt/vexabiz-pocketbase/pb_migrations/ + migrate up
#   • Restart: vexabiz-pocketbase, reload nginx
#
# Not: seed bilinçli olarak burada YOK — pb_scripts/seed.js idempotent değil,
# tekrar çalıştırmak services/packages/references kayıtlarını çiftler.
#
# Kullanım: scripts/deploy-prod.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PB_HOME="/opt/vexabiz-pocketbase"
DIST_HOME="/var/www/vexabiz-sos/dist"
PB_URL="${PB_URL:-http://127.0.0.1:8096}"

echo "▶ Vexabiz prod deploy — $ROOT"

if [ -f "$ROOT/.env" ]; then
  set -a; . "$ROOT/.env"; set +a
fi

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

echo "  → PB migrate up (servis kısa süre durur)"
systemctl stop vexabiz-pocketbase
"$PB_HOME/pocketbase" --dir "$PB_HOME/pb_data" --encryptionEnv=PB_ENCRYPTION_KEY migrate up
systemctl start vexabiz-pocketbase

echo "  → reload nginx"
nginx -t >/dev/null
systemctl reload nginx

echo "  → health check"
for i in 1 2 3 4 5; do
  if curl -s -o /dev/null -w "%{http_code}" "$PB_URL/api/health" 2>/dev/null | grep -q 200; then
    echo "  ✓ PocketBase sağlıklı ($PB_URL)"
    break
  fi
  sleep 1
done

echo "✓ Vexabiz prod deploy tamam."
