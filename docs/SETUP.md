# Kurulum Rehberi

## 1. Yerel Geliştirme

### 1.1. Gereksinimler
- Node.js ≥ 20 (`node --version`)
- PocketBase binary (depoda `backend/pocketbase` Linux binary mevcut, Windows için [release](https://github.com/pocketbase/pocketbase/releases))

### 1.2. Kurulum
```bash
git clone https://github.com/aliihsanhayirli-bit/gyd.git
cd gyd
npm install
```

### 1.3. İlk admin hesabı
```bash
cd backend
./pocketbase admin create admin@gydgrup.com.tr "GucluSifre2026!"
cd ..
```

### 1.4. Ortam değişkenleri
```bash
cp .env.example .env
# .env dosyasını düzenle
```

`.env` anahtarları:

| Anahtar | Zorunlu | Açıklama |
|---|---|---|
| `VITE_POCKETBASE_URL` | evet | PB REST adresi, dev: `http://127.0.0.1:8090` |
| `VITE_GEMINI_API_KEY` | evet | https://aistudio.google.com/app/apikey |
| `VITE_GEMINI_MODEL` | hayır | Varsayılan `gemini-1.5-flash` |
| `VITE_WHATSAPP_NUMBER` | evet | `905324892567` (ülke kodu + numara, başında 0 yok) |
| `VITE_SITE_URL` | evet | Dev: `http://localhost:5173` |
| `GEMINI_API_KEY` | evet (server) | Vite plugin + PB hook için |
| `GEMINI_MODEL` | hayır | Server-side model |
| `META_VERIFY_TOKEN` | evet (WhatsApp) | `gyd-verify-token` |
| `META_WA_TOKEN` | evet (WhatsApp) | Meta permanent token |
| `META_WA_PHONE_ID` | evet (WhatsApp) | WABA phone number ID |
| `META_PAGE_ACCESS_TOKEN` | Messenger/IG | Facebook page token |
| `PB_ENCRYPTION_KEY` | evet (prod) | 32+ rastgele karakter |

> **Önemli:** `GEMINI_API_KEY` ve Meta token'lar **VITE_** prefix'i olmadan ayrıca tanımlanmalı — Vite client bundle'a `VITE_` ile başlayanları gömer.

### 1.5. Başlat
```bash
npm run dev:all     # Vite (5173) + PocketBase (8090)
```

veya ayrı terminaller:
```bash
npm run dev         # sadece Vite
npm run pb          # sadece PocketBase
```

| Servis | URL |
|---|---|
| Site | http://localhost:5173 |
| Admin | http://localhost:5173/admin |
| PocketBase Admin UI | http://127.0.0.1:8090/_/ |
| PocketBase REST | http://127.0.0.1:8090/api/ |

---

## 2. Production Yapılandırması

VPS'te `/opt/gyd-pocketbase/.env` ve `/opt/gyd-api/.env` ayrı tutulur. Detay: [DEPLOY.md](DEPLOY.md).

`VITE_*` değişkenleri build anında bundle'a gömülür — production build öncesi güncellenmeli:
```bash
VITE_POCKETBASE_URL=https://www.gydgrup.com.tr \
VITE_WHATSAPP_NUMBER=905324892567 \
VITE_SITE_URL=https://www.gydgrup.com.tr \
npm run build
```

---

## 3. Veritabanı

PocketBase ilk açılışta `backend/pb_migrations/` altındaki 12 migration'ı otomatik çalıştırır:

| Migration | Koleksiyon |
|---|---|
| `1700000001` | `listings` |
| `1700000002` | `contacts` |
| `1700000003` | `conversations` |
| `1700000004` | `messages` |
| `1700000005` | `timeline_events` |
| `1700000006` | `bot_documents` (RAG) |
| `1700000007` | `bot_settings` (singleton) |
| `1700000008` | `contact_submissions` (site formu) |
| `1700000009` | `settings` (firma bilgileri) |
| `1700000010` | `bot_documents` rule relax |
| `1700000011` | Şirket vergi/vergi dairesi alanları |
| `1700000012` | `regions` |

---

## 4. Sorun Giderme

### PocketBase başlamıyor
- Port 8090 kullanımda mı? `sudo lsof -i :8090`
- `backend/pb_data/data.db` bozulmuşsa yedekten dön (bkz. [DEPLOY.md](DEPLOY.md) yedekleme bölümü)

### CORS hatası
PocketBase varsayılan olarak tüm origin'lere izin verir. Sıkı kurallar için `backend/pb_hooks/` içine:
```js
onBeforeServe((e) => {
  e.response.header().set('Access-Control-Allow-Origin', 'https://www.gydgrup.com.tr');
}, null);
```

### 3D sahne düşük FPS
- Mobil cihazda otomatik parallax gradient fallback
- Masaüstünde GPU acceleration kapalıysa Chrome `chrome://flags` içinden açın
- Prod build dev'den daha iyi çalışır

### Gemini API 429
Ücretsiz tier **1500 istek/gün**. Aşılırsa 24 saat bekleyin veya ücretli tier'a geçin.

### WhatsApp mesajı gelmiyor
- `/api/webhook/meta` 200 dönüyor mu? `curl -X GET https://www.gydgrup.com.tr/api/webhook/meta?hub.mode=subscribe&hub.verify_token=gyd-verify-token&hub.challenge=ok`
- PocketBase log: `sudo journalctl -u gyd-api -f`

---

## 5. Yararlı Komutlar

```bash
npm run dev              # Vite dev
npm run dev:all          # Vite + PocketBase
npm run build            # Prod build → dist/
npm run build:check      # typecheck + build
npm run build:staging    # Staging build (banner'lı)
npm run typecheck        # TS strict
npm run typecheck:all    # TS -b
npm run deploy:prod      # build + rsync /var/www/gydgrup/dist/
npm run deploy:staging   # scripts/deploy-staging.sh

# PocketBase
cd backend
./pocketbase serve                                       # Başlat
./pocketbase admin create <email> <password>             # Admin oluştur
./pocketbase admin update <email>                        # Şifre değiştir
./pocketbase migrate                                     # Manuel migrate
```
