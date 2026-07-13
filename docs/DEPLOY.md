# Production Deploy

## Mimari

```
┌────────────────────┐      ┌────────────────────┐
│  Vercel (free)     │      │  Oracle Cloud Free │
│  Vite + React SPA  │ ───> │  PocketBase + SSL  │
│  https://ycayatirim│      │  https://api.yca...│
└────────────────────┘      └────────────────────┘
        │                            │
        └──────┬─────────────────────┘
               ▼
        ┌────────────────────┐
        │  Gemini API        │
        │  (Google AI Studio)│
        └────────────────────┘
```

---

## 1. PocketBase Sunucusu (Oracle Cloud Free Tier — Önerilen)

Oracle Cloud "Always Free" tier ömür boyu ücretsiz:
- 4 vCPU, 24 GB RAM (AMD)
- 200 GB storage
- 10 TB egress/ay

### 1.1. Oracle hesabı
1. https://cloud.oracle.com ücretsiz hesap aç
2. Ana sayfa → "Create a VM instance"
3. Shape: `VM.Standard.E2.1.Micro` (AMD, ücretsiz) veya `VM.Standard.A1.Flex` (ARM, 4 OCPU/24GB, ücretsiz)
4. OS: Ubuntu 22.04 (veya 24.04)
5. SSH key'ini ekle, indir
6. Public IP ata, 22/8090/80/443 portlarını aç

### 1.2. Sunucu kurulumu
```bash
ssh ubuntu@<PUBLIC_IP>

sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# PocketBase (ARM veya AMD mimarisine göre)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip
unzip pocketbase_0.22.21_linux_amd64.zip
chmod +x pocketbase
sudo mv pocketbase /usr/local/bin/

# Çalışma dizini
sudo mkdir -p /opt/yca-pocketbase
sudo chown ubuntu:ubuntu /opt/yca-pocketbase
cd /opt/yca-pocketbase

# Migration'ları yükle
scp -r backend/pb_migrations ubuntu@<IP>:/opt/yca-pocketbase/
scp -r backend/pb_hooks ubuntu@<IP>:/opt/yca-pocketbase/

# PocketBase systemd servisi
sudo tee /etc/systemd/system/pocketbase.service > /dev/null <<EOF
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/yca-pocketbase
ExecStart=/usr/local/bin/pocketbase serve --http=127.0.0.1:8090 --encryptionEnv=PB_ENCRYPTION_KEY
Restart=always
RestartSec=5
Environment=PB_ENCRYPTION_KEY=<32 karakterlik rastgele key>

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl status pocketbase
```

### 1.3. Nginx reverse proxy + SSL
```bash
sudo tee /etc/nginx/sites-available/pocketbase > /dev/null <<EOF
server {
    listen 80;
    server_name api.ycayatirim.com.tr;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/pocketbase /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d api.ycayatirim.com.tr
```

### 1.4. Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 1.5. İlk admin
```bash
cd /opt/yca-pocketbase
pocketbase admin create admin@ycayatirim.com.tr "GucluSifre2024!"
```

---

## 2. Frontend (Vercel — Ücretsiz)

### 2.1. Repo hazırlığı
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:ycayatirim/yca-web.git
git push -u origin main
```

### 2.2. Vercel'e bağla
1. https://vercel.com → "New Project"
2. GitHub repo'yu seç
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. **Environment Variables:**
   - `VITE_POCKETBASE_URL` = `https://api.ycayatirim.com.tr`
   - `VITE_GEMINI_API_KEY` = (boş, server-side kullanılacak)
   - `VITE_GEMINI_MODEL` = `gemini-1.5-flash`
   - `VITE_SITE_URL` = `https://ycayatirim.com.tr`
7. Deploy

### 2.3. Domain bağla
Vercel → Project → Settings → Domains → `ycayatirim.com.tr` ekle.
DNS'te CNAME `ycayatirim.com.tr` → `cname.vercel-dns.com`

---

## 3. Gemini API Anahtarı (Server-side)

Üretimde API key **client bundle'a sızmamalı**. PocketBase tarafında kullanmak için:

1. Google AI Studio'dan key al: https://aistudio.google.com/app/apikey
2. PocketBase sunucusunda `.env`:
```bash
echo "GEMINI_API_KEY=AIza..." | sudo tee /etc/default/pocketbase
```
3. `pocketbase.service`'i güncelle (`EnvironmentFile=/etc/default/pocketbase` ekle)
4. Veya PocketBase hook'unda direkt `process.env.GEMINI_API_KEY` oku (Bkz. `pb_hooks/chat-bot.pb.js`)

---

## 4. WhatsApp Cloud API (Webhook)

Bkz. **[META-SETUP.md](META-SETUP.md)** — Meta Business hesabı kurulumu.

---

## 5. Yedekleme

PocketBase SQLite otomatik yedeklenir. Ek olarak:
```bash
# Cron: her gece 03:00'te yedekle
0 3 * * * cp /opt/yca-pocketbase/pb_data/data.db /opt/yca-pocketbase/backups/data-$(date +\%Y\%m\%d).db
```

---

## 6. Maliyet Özeti

| Hizmet | Aylık |
|---|---|
| Oracle Cloud Free Tier | $0 |
| Vercel | $0 |
| Domain (yıllık) | ~₺600 |
| SSL (Let's Encrypt) | $0 |
| Gemini ücretsiz | $0 |
| **Toplam** | **~₺50/ay** |
