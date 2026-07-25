# GYD Grup — Agent Env Status & Roadmap

> **Son güncelleme:** 2026-07-18 (YCA kalıntıları temizlendi: vite.config, package.json, scripts, robots/sitemap, bootstrap, dev.bat, STATUS, HEMEN-TEST)
> **Önceki ad:** "YCA Yatırım" (2024–2026 Temmuz) — bu doküman eski projeksiyonu da içerir
> **Hazırlayan:** opencode (MiniMax-M3) — agent context
> **Repo:** `/root/gyd/gyd` → `https://github.com/aliihsanhayirli-bit/gyd`

---

## 0. Rebrand Notu (2026-07-16)

- **Şirket**: YCA TİCARİ YATIRIM DANIŞMANLIK → GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK
- **Klasör**: `/root/yca` → `/root/gyd/gyd`
- **Servisler**: `pocketbase.service` → `gyd-pocketbase.service`, `yca-api.service` → `gyd-api.service`
- **Domain**: `temelliarsa.com` (eski, hâlâ aktif) + `gydgrup.com.tr` (yeni, bu VPS)
- **API**: `/opt/yca-api/` → `/opt/gyd-api/`, prompt + telefon güncel
- **Repo**: `aliihsanhayirli-bit/yca` → `aliihsanhayirli-bit/gyd`

> ⚠️ **Önemli:** `/root/yca` (YCA) ve `/root/gyd/gyd` (GYD) **iki ayrı projedir**. Birinde yapılan değişiklik diğerine yansımaz. Tüm kod, .env, PocketBase, nginx location, systemd unit, deploy path bağımsızdır. YCA ayrı domain (`temelliarsa.com`) ve ayrı PB (port 8090) ile hâlâ yayında; GYD ayrı domain (`gydgrup.com.tr`) ve ayrı PB ile.

---

## 1. Project Snapshot

| Alan | Değer |
|---|---|
| Ürün | Ankara geneli **imarlı arsa** alım-satım, proje geliştirme & yatırım danışmanlığı |
| Şirket | GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ. |
| Domain | `https://gydgrup.com.tr` (SSL: 16 Tem-26 → 13 Eki-26) |
| Versiyon | `0.4.0` (YCA kalıntı temizliği) |
| Stack | Vite 5 · React 18 · TypeScript · Three.js · PocketBase · Gemini 1.5 Flash → Lite |
| Mimari | Müşteri yüzü (`/`) + Admin (`/admin`) + gyd-api (chat/RAG/webhook) + PB |

---

## 2. Servisler (VPS'te çalışan)

| Servis | Port | systemd unit | Yönetim |
|---|---|---|---|
| nginx 1.24 | 80, 443 | nginx.service | TLS: Let's Encrypt (gydgrup.com.tr 16 Tem-26 → 13 Eki-26) |
| pocketbase 0.22.21 | 8090 (loopback) | gyd-pocketbase.service | 12/12 migration, override.conf ile GEMINI_API_KEY; veri: `/opt/gyd-pocketbase/pb_data` |
| gyd-api (Node 18+) | 8091 (loopback) | gyd-api.service | `/opt/gyd-api/server.mjs`, systemd env: GEMINI key, model |
| (geliştirme) Vite dev | 5173 | (manuel) | local geliştirme, prod'da kullanılmaz |

### Nginx akışı (gydgrup.com.tr)
```
İnternet → nginx:443
  ├─ /api/chat, /api/rag/, /api/webhook/, /api/v1/  → 127.0.0.1:8091 (gyd-api)
  ├─ /api/* (geri kalan: collections, realtime, health) → 127.0.0.1:8090 (PocketBase)
  ├─ /_/ (PB admin UI) → 127.0.0.1:8090
  ├─ /assets/* → /var/www/gydgrup/dist/assets/ (1y immutable cache)
  └─ /* (HTML SPA) → /var/www/gydgrup/dist/
```

### Security header'lar (snippet: `/etc/nginx/snippets/gyd-security-headers.conf`)
Tüm location'larda: HSTS, X-Frame-Options=SAMEORIGIN, X-Content-Type-Options=nosniff, Referrer-Policy, Permissions-Policy, Content-Security-Policy (Vite için unsafe-eval + unsafe-inline).

---

## 3. Environment Status (`.env`)

| Key | Status | Değer / Not |
|---|---|---|
| `VITE_POCKETBASE_URL` | ✅ dolu | `https://gydgrup.com.tr` (prod) |
| `VITE_GEMINI_API_KEY` | ✅ dolu | `<REDACTED>` |
| `VITE_GEMINI_MODEL` | ✅ dolu | `gemini-flash-lite-latest` (lite çalışıyor) |
| `VITE_WHATSAPP_NUMBER` | ✅ dolu | `905452788073` |
| `VITE_SITE_URL` | ✅ dolu | `https://gydgrup.com.tr` |
| `GEMINI_API_KEY` (PB) | ✅ systemd override | aynı key, embed hook için |
| `GEMINI_MODEL` (PB) | ✅ systemd override | `gemini-flash-lite-latest` |
| `META_VERIFY_TOKEN` | ✅ dolu | `gyd-verify-token` |
| `META_WA_TOKEN` | ❌ **boş** | WhatsApp Cloud API |
| `META_WA_PHONE_ID` | ❌ **boş** | WhatsApp phone ID |
| `META_PAGE_ACCESS_TOKEN` | ❌ **boş** | Messenger + Instagram DM |
| `PB_ENCRYPTION_KEY` | ⚠️ **plaintext** | rotate edilmeli |

**Özet:** 10/12 anahtar dolu, 3 Meta boş, 1 güvenlik riski (PB key rotate).

---

## 4. Migrations (PB) — `/opt/gyd-pocketbase/pb_migrations/`

| # | Migration | Açıklama |
|---|---|---|
| 1 | `1700000001_create_listings` | arsa portföyü |
| 2 | `1700000002_create_contacts` | CRM kişileri |
| 3 | `1700000003_create_conversations` | konuşma thread'leri |
| 4 | `1700000004_create_messages` | tüm kanallardan mesajlar |
| 5 | `1700000005_create_timeline_events` | aktivite timeline |
| 6 | `1700000006_create_bot_documents` | RAG dökümanları |
| 7 | `1700000007_create_bot_settings` | bot system prompt, hoşgeldin |
| 8 | `1700000008_create_contact_submissions` | iletişim formu |
| 9 | `1700000009_create_settings` | şirket ayarları (singleton) |
| 10 | `1700000010_relax_bot_documents_rules` | RAG public okuma |
| 11 | `1700000011_add_company_tax_fields` | settings'e `tax_office` + `vkn` |
| 12 | `1700000012_create_regions` | bölgeler (description, stats, highlights JSON) |

**Hook'lar (`/opt/gyd-pocketbase/pb_hooks/`):**
- `messages.pb.js` ✅ aktif
- `bootstrap.pb.js.disabled` ❌ (admin zaten var)

---

## 5. Frontend (Vite + React) — `src/`

### Pages
**Site:**
- `site/Home.tsx` — PB'den `featured=true` listings çekiyor (gerçek fotoğraflar)
- `site/Listings.tsx` — PB'den tüm yayınlanmış arsalar, filtreleme + sıralama
- `site/ListingDetail.tsx` — slug ile PB'den, foto galerisi, features, konum kartı
- `site/RegionDetail.tsx` — slug ile PB `regions` collection'dan
- `site/Regions.tsx` — bölge kartları, PB `regions` collection'dan
- `site/About.tsx`, `site/Services.tsx`, `site/Contact.tsx` — statik
- `site/Contact.tsx` — form PocketBase'e `contact_submissions` POST ediyor

**Admin:**
- `admin/Dashboard.tsx`, `admin/Listings.tsx`, `admin/ListingEdit.tsx`
- `admin/Contacts.tsx`, `admin/ContactDetail.tsx` (Kanban + drag-drop)
- `admin/Conversations.tsx`
- `admin/Bot.tsx` (RAG yükleme + /api/rag/embed)
- `admin/Settings.tsx`, `admin/Users.tsx`, `admin/Login.tsx`

### Components
- `ui/` — Badge, Button, Form, Card (shadcn-tarzı)
- `layout/` — SiteLayout, AdminLayout, Header, Footer
- `three/` — Hero3D (Three.js topografik harita)
- `chat/` — ChatWidget (Gemini + RAG via gyd-api)

### Code-splitting (vite.config.ts manualChunks)
- `three` (1.0MB), `pocketbase` (33KB), `gemini` (28KB)
- Per-page chunks: Home, Listings, ListingDetail, Contact, About, vb.

### Vite plugin (vite/api-plugin.js) — banner & ayar
- `name: 'gyd-api-plugin'` (YCA'dan ayrı)
- Banner plugin adı: `gyd-staging-banner`
- `VITE_STAGING=1` → sarı "STAGING" banner (npm run build:staging)
- `VITE_GYD_STAGING=1` → mavi "GYD STAGING" banner (npm run build:gyd-staging)

---

## 6. API Endpoints (HTTPS üzerinden)

| Method | URL | Yönlendirme | Auth |
|---|---|---|---|
| GET | `/` ve SPA rotaları | dist/ | public |
| GET | `/assets/*` | dist/assets/ | public, 1y cache |
| GET | `/robots.txt`, `/sitemap.xml` | dist/ | public |
| GET/POST/PATCH/DELETE | `/api/collections/*` | PocketBase 8090 | collection rule'a göre |
| GET | `/api/realtime` (SSE) | PocketBase 8090 | public (PB_CONNECT) |
| GET | `/_/` (PB admin) | PocketBase 8090 | superuser |
| POST | `/api/chat` | gyd-api 8091 | public, RAG + Gemini |
| POST | `/api/rag/embed` | gyd-api 8091 | public (admin panelden çağrılır) |
| GET/POST | `/api/webhook/meta` | gyd-api 8091 | public (verify_token kontrolü, `hub.mode` standardı) |
| GET | `/api/v1/health` | gyd-api 8091 | public |

---

## 7. RAG Bilgi Tabanı (`bot_documents`)

> YCA'nın 3 dökümanı (Temelli ağırlıklı) GYD'ye birebir uymuyor; GYD için Ankara geneli + imarlı arsa odaklı yeniden düzenlenecek.

| # | Başlık | Chunk | Embedding | Aktif |
|---|---|---|---|---|
| (TBD) | Ankara Geneli İmarlı Arsa Danışmanlık Bilgi Tabanı | — | — | ⏳ |
| (TBD) | Ankara İmar Rehberi ve Mevzuat | — | — | ⏳ |

**Model:** `gemini-embedding-001` (3072-dim)
**Chunk stratejisi:** 800 char, 100 overlap
**Retrieval:** cosine similarity, top-4

---

## 8. Veri Durumu (anlık)

| Tablo | Kayıt | Yorum |
|---|---|---|
| `listings` | (TBD) | seed sonrası |
| `contacts` | (TBD) | — |
| `conversations` | (TBD) | — |
| `messages` | (TBD) | — |
| `timeline_events` | (TBD) | — |
| `bot_documents` | (TBD) | RAG yeniden kurulacak |
| `bot_settings` | (TBD) | GYD prompt'u ile güncellenecek |
| `settings` | (TBD) | GYD şirket bilgileri seed |
| `regions` | 9 | Çankaya, Etimesgut, Mamak, Altındağ, Yenimahalle, Keçiören, Sincan, Pursaklar, Polatlı |
| `users` | 1 | admin verified |
| `_admins` | 1 | `admin@gydgrup.com.tr` |

**Backups:** 7 günlük retention, `/opt/gyd-pocketbase/pb_data/backups/`, cron 03:00.

---

## 9. Bilinen Riskler

### 🔴 Yüksek risk
- **`PB_ENCRYPTION_KEY` plaintext** (git'te olabilir) → rotate + history temizle
- **Meta token'lar boş** → omnichannel kapalı
- **RAG bilgi tabanı GYD'ye uygun değil** (Temelli/YCA kalıntıları) → yeniden yazılacak

### 🟡 Orta risk
- **Tek RAG chunk store** (PB SQLite) → embed'ler büyüdükçe bloat olabilir
- **Backup'lar VPS-local** → VPS çökerse backup da gider
- **Sentry/UptimeRobot yok** → sorun olduğunda geç haber alma

### 🟢 Düşük risk
- **Frontend statik fallback'ler** (Listings, RegionDetail, Home) — PB boşsa graceful degradation
- **Staging ortamı** — `/var/www/gydgrup-staging/` + `/gyd-staging/` nginx location (aynı PB paylaşır, dikkat)

---

## 10. Roadmap

### 🟢 Tamamlandı (son işlem)
- [x] **2026-07-18 YCA kalıntı temizliği**: vite.config (`gyd-staging-banner`, `VITE_GYD_STAGING` bayrak), package.json (`build:gyd-staging`, `deploy:gyd-staging`), scripts/deploy-staging.sh (`/var/www/gydgrup-staging/`), scripts/deploy-gyd-staging.sh (yeni), api-plugin (`gyd-api-plugin`), public/robots.txt + sitemap.xml (`gydgrup.com.tr`), backend/pb_hooks/bootstrap (admin@gydgrup.com.tr), dev.bat (GYD Grup), STATUS.md (tamamen GYD'ye çevrildi), HEMEN-TEST.md, package-lock.json (`gyd-grup`)

### 🟡 Orta vadeli (1-2 hafta)
- [ ] PB_ENCRYPTION_KEY rotate + git history temizle
- [ ] GYD admin şifre rotate (`Gyd2024!Admin` plaintext bırakıldı)
- [ ] RAG bilgi tabanını GYD'ye uygun şekilde yeniden yaz (Ankara geneli + imarlı arsa)
- [ ] Meta WhatsApp Cloud API setup (WABA onayı 1-2 gün)
- [ ] Sentry error tracking
- [ ] UptimeRobot veya BetterStack monitoring
- [ ] Backup'ı VPS dışına taşı (S3 veya başka VPS'e rsync)
- [ ] İlk 5-9 Ankara arsası seed et (bölgelere dağıtılmış)
- [ ] Bot system prompt admin panelden (bot_settings collection zaten var)

### 🔵 Uzun vadeli (1+ ay)
- [ ] Ayrı PB instance staging için (port 8094)
- [ ] A/B test (bot vs insan response time)
- [ ] KVKK aydınlatma metni
- [ ] Mobile app veya PWA
- [ ] Meta OAuth2 flow PocketBase üzerinden

---

## 11. Sık Kullanılan Komutlar

```bash
# Servisleri kontrol
systemctl status nginx gyd-pocketbase gyd-api

# Loglar
journalctl -u gyd-pocketbase -n 30 --no-pager
journalctl -u gyd-api -n 30 --no-pager
tail -f /var/log/nginx/access.log

# Yeni arsa ekle (PB admin API)
TOKEN=$(curl -s -X POST https://gydgrup.com.tr/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@gydgrup.com.tr","password":"Gyd2024!Admin"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
curl -X POST https://gydgrup.com.tr/api/collections/listings/records \
  -H "Authorization: $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"...","slug":"...","price":...,"currency":"TRY","area_m2":...,...}'

# Yeni RAG dökümanı ekle
# 1) bot_documents'a INSERT (raw_text ile)
# 2) /api/rag/embed tetikle → chunk + Gemini embed
# 3) active=true yap

# Deploy frontend (prod)
cd /root/gyd/gyd && npm run build && rsync -a --delete dist/ /var/www/gydgrup/dist/

# Deploy frontend (staging - aynı PB, dikkat)
cd /root/gyd/gyd && npm run build:staging && rsync -a --delete dist/ /var/www/gydgrup-staging/dist/

# Backup al (manuel)
/opt/gyd-pocketbase/backup.sh
```

---

## 12. Proje Ayrımı (YCA vs GYD)

Bu bilgi yanlışlıkla karışma yaşanmaması için sabit referans olarak burada dursun:

| Öğe | YCA (`/root/yca`) | GYD (`/root/gyd/gyd`) |
|---|---|---|
| Domain | temelliarsa.com | gydgrup.com.tr |
| Repo | aliihsanhayirli-bit/yca | aliihsanhayirli-bit/gyd |
| PocketBase systemd | pocketbase.service | gyd-pocketbase.service |
| PocketBase data | /opt/yca-pocketbase/pb_data | /opt/gyd-pocketbase/pb_data |
| API systemd | yca-api.service | gyd-api.service |
| API path | /opt/yca-api/server.mjs | /opt/gyd-api/server.mjs |
| Dist (prod) | /var/www/temelliarsa/dist | /var/www/gydgrup/dist |
| Dist (staging) | /var/www/yca-staging/dist | /var/www/gydgrup-staging/dist |
| Nginx site | /etc/nginx/sites-available/temelliarsa | /etc/nginx/sites-available/gydgrup |
| Admin e-posta | admin@ycayatirim.com.tr | admin@gydgrup.com.tr |
| WhatsApp | +90 545 655 10 70 | +90 532 489 25 67 |
| Şirket | YCA TİCARİ YATIRIM DANIŞMANLIK | GYD GRUP GAYRİMENKUL |
| Verify token | yca-verify-token | gyd-verify-token |
| Bölge kapsamı | Temelli + 3 Ankara bölgesi (4) | Ankara geneli 9 bölge |
| Kapsam | Temelli özel | Sadece imarlı arsa, Ankara geneli |

---

*Bu dosya opencode tarafından otomatik güncellendi. 2026-07-18: YCA kalıntıları temizlendi, proje ayrımı kesinleştirildi.*
