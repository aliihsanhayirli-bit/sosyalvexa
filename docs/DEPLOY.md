# Production Deploy

## Mimari (mevcut)

```
┌──────────────────────────────────────────────────────────────┐
│ VPS (Hetzner / Oracle Cloud Free Tier / herhangi bir Linux)  │
│                                                              │
│  ┌────────────────────┐   ┌────────────────────┐             │
│  │ Nginx :443         │   │ Certbot            │             │
│  │ www.gydgrup.com.tr │   │ Let's Encrypt      │             │
│  └────────┬───────────┘   └────────────────────┘             │
│           │                                                  │
│  ┌────────┼─────────┬──────────────┬─────────────┐           │
│  ▼        ▼         ▼              ▼             ▼           │
│  /       /api/chat /api/rag/      /api/webhook/  /api/        │
│  dist/  →8091      →8091          →8091          →8090        │
│  (Vite) (gyd-api)  (gyd-api)      (gyd-api)      (PB)         │
│                                                              │
│  /gyd-staging/  → /var/www/gydgrup-staging/dist/            │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
   ┌────────────────────┐
   │ Google Gemini API  │
   │ (text-embedding-   │
   │  001 + Flash)      │
   └────────────────────┘
```

**Sürekli servisler (systemd):**
- `gyd-pocketbase.service` → `/opt/gyd-pocketbase/pocketbase serve` (port 8090)
- `gyd-api.service` → `/opt/gyd-api/server.mjs` (port 8091)

---

## 1. İlk kurulum (sıfırdan)

### 1.1. Sunucu hazırlığı
```bash
ssh root@<SUNUCU_IP>
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx ufw rsync

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 1.2. PocketBase
```bash
mkdir -p /opt/gyd-pocketbase
cd /opt/gyd-pocketbase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip
unzip pocketbase_0.22.21_linux_amd64.zip
chmod +x pocketbase

# Migration + hook'ları yükle
scp -r backend/pb_migrations root@<IP>:/opt/gyd-pocketbase/
scp -r backend/pb_hooks root@<IP>:/opt/gyd-pocketbase/
```

`.env` (sadece PB'nin görebildiği):
```bash
tee /opt/gyd-pocketbase/.env <<EOF
PB_ENCRYPTION_KEY=$(openssl rand -hex 16)
GEMINI_API_KEY=<gemini-api-key>
META_VERIFY_TOKEN=gyd-verify-token
EOF
chmod 600 /opt/gyd-pocketbase/.env
```

systemd unit:
```ini
# /etc/systemd/system/gyd-pocketbase.service
[Unit]
Description=GYD PocketBase
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gyd-pocketbase
ExecStart=/opt/gyd-pocketbase/pocketbase serve --http=127.0.0.1:8090 --encryptionEnv=PB_ENCRYPTION_KEY
EnvironmentFile=/opt/gyd-pocketbase/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now gyd-pocketbase
systemctl status gyd-pocketbase
```

### 1.3. API server (chat / RAG / webhook)
```bash
mkdir -p /opt/gyd-api
scp -r vite/api-plugin.js root@<IP>:/opt/gyd-api/   # şablon olarak
# server.mjs'i repodan al
```

`/opt/gyd-api/.env`:
```bash
PORT=8091
HOST=127.0.0.1
VITE_POCKETBASE_URL=http://127.0.0.1:8090
GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-1.5-flash
META_VERIFY_TOKEN=gyd-verify-token
META_APP_ID=1721626692079061
META_APP_SECRET=<meta-app-secret>
META_WA_PHONE_ID=<phone-number-id>
META_WA_TOKEN=<permanent-system-user-token>
META_PAGE_ACCESS_TOKEN=<fb-page-token>
```

systemd unit:
```ini
# /etc/systemd/system/gyd-api.service
[Unit]
Description=GYD API server
After=network.target gyd-pocketbase.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gyd-api
ExecStart=/usr/bin/node /opt/gyd-api/server.mjs
EnvironmentFile=/opt/gyd-api/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now gyd-api
systemctl status gyd-api
```

### 1.4. Frontend build & deploy
```bash
# Lokalde
git clone https://github.com/aliihsanhayirli-bit/gyd.git
cd gyd
npm install

VITE_POCKETBASE_URL=https://www.gydgrup.com.tr \
VITE_WHATSAPP_NUMBER=905324892567 \
VITE_SITE_URL=https://www.gydgrup.com.tr \
npm run build

# Sunucuya rsync
rsync -a --delete dist/ root@<IP>:/var/www/gydgrup/dist/
```

veya repodaki script:
```bash
npm run deploy:prod    # build + rsync /var/www/gydgrup/dist/
```

### 1.5. Nginx + SSL
Bkz. **[nginx-www.md](nginx-www.md)** (yoksa) veya `AGENTS.md` → "VPS hızlı referans".

```bash
# Site config
ln -s /etc/nginx/sites-available/gydgrup /etc/nginx/sites-enabled/

# SSL (Let's Encrypt — www otomatik eklenir)
certbot --nginx -d gydgrup.com.tr -d www.gydgrup.com.tr

nginx -t && systemctl reload nginx
```

---

## 2. Deploy döngüsü (günlük)

```bash
cd /root/gyd/gyd
git pull
npm install                # sadece package.json değiştiyse
npm run typecheck          # hata varsa push etmeyin
npm run build
npm run deploy:prod
```

Migration değiştiyse:
```bash
scp -r backend/pb_migrations/* root@<IP>:/opt/gyd-pocketbase/pb_migrations/
ssh root@<IP> "systemctl restart gyd-pocketbase"
```

API değiştiyse:
```bash
scp vite/api-plugin.js root@<IP>:/opt/gyd-api/server.mjs
ssh root@<IP> "systemctl restart gyd-api"
```

---

## 3. Domain & SSL

- Domain: `gydgrup.com.tr` — DNS A kaydı VPS IP'sine
- Canonical: **www.gydgrup.com.tr** (gydgrup.com.tr 301 → www)
- SSL: Let's Encrypt ECDSA, otomatik yenileme (`certbot.timer`)
- Sertifika `/etc/letsencrypt/live/gydgrup.com.tr/` altında
- Yenileme kontrol: `certbot renew --dry-run`

---

## 4. WhatsApp Cloud API

Bkz. **[META-SETUP.md](META-SETUP.md)**.

---

## 5. Yedekleme

```bash
# PocketBase SQLite — her gece 03:00
sudo crontab -e
0 3 * * * cp /opt/gyd-pocketbase/pb_data/data.db /opt/gyd-pocketbase/backups/data-$(date +\%Y\%m\%d).db && find /opt/gyd-pocketbase/backups/ -name "data-*.db" -mtime +30 -delete

# Frontend dist (gerektiğinde)
tar -czf /var/backups/gydgrup-dist-$(date +\%Y\%m\%d).tar.gz -C /var/www/gydgrup dist
```

---

## 6. Maliyet

| Bileşen | Aylık |
|---|---|
| VPS (Hetzner CX22 veya Oracle A1) | $0 (free tier) — ~$5 tier'lı |
| Domain (.com.tr) | ~₺600/yıl |
| SSL (Let's Encrypt) | $0 |
| Gemini API (free tier) | $0 — 1500 istek/gün |
| Meta WhatsApp (utility şablonlar) | ~₺0.15/mesaj |
| **Toplam** | **~₺100-200/ay** (aktif kullanımda) |

---

## 7. Sorun Giderme

### Site açılmıyor
```bash
systemctl status nginx
systemctl status gyd-pocketbase
systemctl status gyd-api
journalctl -u gyd-api -n 50 --no-pager
curl -i https://www.gydgrup.com.tr/api/health
```

### Migration çalışmadı
```bash
journalctl -u gyd-pocketbase -n 100 --no-pager | grep -i migrat
# Manuel çalıştırma
cd /opt/gyd-pocketbase
./pocketbase migrate
```

### SSL yenilenmedi
```bash
certbot renew --dry-run
certbot certificates
```
