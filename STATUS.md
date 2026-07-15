# GYD Grup — Agent Env Status & Roadmap

> **Son güncelleme:** 2026-07-16 (YCA → GYD Grup rebrand; klasör/servis/domain rename; SSL cert gydgrup.com.tr; chat prompt güncel)
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

---

## 1. Project Snapshot

| Alan | Değer |
|---|---|
| Ürün | Ankara geneli **imarlı arsa** alım-satım, proje geliştirme & yatırım danışmanlığı |
| Şirket | GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ. |
| Domain | `https://gydgrup.com.tr` (SSL: 16 Tem-26 → 13 Eki-26) |
| Versiyon | `0.3.0` (rebrand) |
| Stack | Vite 5 · React 18 · TypeScript · Three.js · PocketBase · Gemini 1.5 Flash → Lite |
| Mimari | Müşteri yüzü (`/`) + Admin (`/admin`) + gyd-api (chat/RAG/webhook) + PB |

---

## 2. Servisler (VPS'te çalışan)

| Servis | Port | systemd unit | Yönetim |
|---|---|---|---|
| nginx 1.24 | 80, 443 | nginx.service | TLS: Let's Encrypt (gydgrup.com.tr 16 Tem-26 → 13 Eki-26; temelliarsa.com 14 Tem-26 → 12 Eki-26) |
| pocketbase 0.22.21 | 8090 (loopback) | gyd-pocketbase.service | 12/12 migration, override.conf ile GEMINI_API_KEY; veri: `/opt/gyd-pocketbase/pb_data` |
| gyd-api (Node 18+) | 8091 (loopback) | gyd-api.service | `/opt/gyd-api/server.mjs`, systemd env: GEMINI key, model |
| (geliştirme) Vite dev | 5173 | (manuel) | local geliştirme, prod'da kullanılmıyor |

### Nginx akışı
```
İnternet → nginx:443
  ├─ /api/chat, /api/rag/, /api/webhook/, /api/v1/  → 127.0.0.1:8091 (yca-api)
  ├─ /api/* (geri kalan: collections, realtime, health) → 127.0.0.1:8090 (PocketBase)
  ├─ /_/ (PB admin UI) → 127.0.0.1:8090
  ├─ /assets/* → /var/www/temelliarsa/dist/assets/ (1y immutable cache)
  └─ /* (HTML SPA) → /var/www/temelliarsa/dist/
```

### Security header'lar (snippet: `/etc/nginx/snippets/yca-security-headers.conf`)
Tüm location'larda: HSTS, X-Frame-Options=SAMEORIGIN, X-Content-Type-Options=nosniff, Referrer-Policy, Permissions-Policy, Content-Security-Policy (Vite için unsafe-eval + unsafe-inline).

---

## 3. Environment Status (`.env`)

| Key | Status | Değer / Not |
|---|---|---|
| `VITE_POCKETBASE_URL` | ✅ dolu | `https://temelliarsa.com` (prod) |
| `VITE_GEMINI_API_KEY` | ✅ dolu | `REDACTED_GEMINI_KEY` |
| `VITE_GEMINI_MODEL` | ✅ dolu | `gemini-flash-lite-latest` (lite çalışıyor) |
| `VITE_WHATSAPP_NUMBER` | ✅ dolu | `905456551070` |
| `VITE_SITE_URL` | ✅ dolu | `https://temelliarsa.com` |
| `GEMINI_API_KEY` (PB) | ✅ systemd override | aynı key, embed hook için |
| `GEMINI_MODEL` (PB) | ✅ systemd override | `gemini-flash-lite-latest` |
| `META_VERIFY_TOKEN` | ✅ dolu | `yca-verify-token` |
| `META_WA_TOKEN` | ❌ **boş** | WhatsApp Cloud API |
| `META_WA_PHONE_ID` | ❌ **boş** | WhatsApp phone ID |
| `META_PAGE_ACCESS_TOKEN` | ❌ **boş** | Messenger + Instagram DM |
| `PB_ENCRYPTION_KEY` | ⚠️ **plaintext** | rotate edilmeli |

**Özet:** 10/12 anahtar dolu, 3 Meta boş, 1 güvenlik riski (PB key rotate).

---

## 4. Migrations (PB)

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

**Hook'lar (`/opt/yca-pocketbase/pb_hooks/`):**
- `messages.pb.js` ✅ aktif
- `embed.pb.js` ✅ aktif (text-embedding-004 → gemini-embedding-001)
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
- `site/Contact.tsx` — form PocketBase'e `contact_submissions` POST ediyor (önceki stub kaldırıldı)

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
- `chat/` — ChatWidget (Gemini + RAG via yca-api)

### Code-splitting (vite.config.ts manualChunks)
- `three` (1.0MB), `pocketbase` (33KB), `gemini` (28KB)
- Per-page chunks: Home, Listings, ListingDetail, Contact, About, vb.

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
| POST | `/api/chat` | yca-api 8091 | public, RAG + Gemini |
| POST | `/api/rag/embed` | yca-api 8091 | public (admin panelden çağrılır) |
| GET/POST | `/api/webhook/meta` | yca-api 8091 | public (verify_token kontrolü) |
| GET | `/api/v1/health` | yca-api 8091 | public |

---

## 7. RAG Bilgi Tabanı (`bot_documents`)

| # | Başlık | Chunk | Embedding | Aktif |
|---|---|---|---|---|
| 1 | Temelli ve Ankara Bölgesi Arsa Danışmanlık Bilgi Tabanı | 17 | 680 KB | ✅ |
| 2 | Temelli Bölgesi Sık Sorulan Sorular ve Müşteri Senaryoları | 14 | 560 KB | ✅ |
| 3 | Ankara İmar Rehberi ve Mevzuat Bilgi Tabanı | 18 | 720 KB | ✅ |
| **Toplam** | | **49 chunk** | **1.96 MB** | |

**Model:** `gemini-embedding-001` (3072-dim)
**Chunk stratejisi:** 800 char, 100 overlap
**Retrieval:** cosine similarity, top-4

---

## 8. Veri Durumu (anlık)

| Tablo | Kayıt | Yorum |
|---|---|---|
| `listings` | 1 | Temelli Hürriyet 3019/17, 599K TL, featured, 1 fotoğraf |
| `contacts` | 1 | Ahmet Yılmaz (test) |
| `conversations` | 1 | web kanalı, bot aktif |
| `messages` | 1 | customer'dan ilk mesaj |
| `timeline_events` | 2 | 1 manuel + 1 messages hook'undan |
| `bot_documents` | 3 | yukarıdaki tablo |
| `bot_settings` | 1 | mevcut |
| `settings` | 1 | tam, VKN dahil |
| `regions` | 4 | Temelli, Polatlı, Çankaya, Etimesgut |
| `users` | 1 | admin verified |
| `_admins` | 1 | `admin@ycayatirim.com.tr` / Yca2024!AdminPass! |

**Backups:** 7 günlük retention, `/opt/yca-pocketbase/pb_data/backups/`, cron 03:00.

---

## 9. Bilinen Riskler

### 🔴 Yüksek risk
- **`PB_ENCRYPTION_KEY` plaintext** (git'te olabilir) → rotate + history temizle
- **Meta token'lar boş** → omnichannel kapalı

### 🟡 Orta risk
- **Tek RAG chunk store** (PB SQLite) → embed'ler büyüdükçe bloat olabilir
- **Backup'lar VPS-local** → VPS çökerse backup da gider
- **Sentry/UptimeRobot yok** → sorun olduğunda geç haber alma

### 🟢 Düşük risk
- **Frontend statik fallback'ler** (Listings, RegionDetail, Home) — PB boşsa graceful degradation
- **Staging ortamı yok** — prod'da test

---

## 10. Roadmap

### 🟢 Tamamlandı (son 24 saat)
- [x] Production HTTPS, tüm sayfalar 200
- [x] PocketBase admin auth + CRM test (1 contact, conv, msg, timeline)
- [x] Fotoğraf yükleme + public URL erişim
- [x] PB backup + cron (her gün 03:00, 7 gün retention)
- [x] Listings/ListingDetail/Regions/RegionDetail → PocketBase
- [x] Home FEATURED → PocketBase
- [x] Contact form → PocketBase (önceki stub kaldırıldı)
- [x] Haymana + Bala bölgeleri kaldırıldı (4 bölge kaldı)
- [x] /api/chat + /api/rag/embed + /api/webhook/meta production'da
- [x] Nginx security headers (snippet ile tüm location'lar)
- [x] Gemini model switch: gemini-flash-latest → gemini-flash-lite-latest (kota çözümü)
- [x] Embedding model: text-embedding-004 → gemini-embedding-001
- [x] 3 RAG dokümanı (49 chunk, 1.96 MB)
- [x] Sitemap + robots.txt düzeltme (domain temiz, 4 bölge)
- [x] Settings: tax_office + vkn eklendi (migration 11)
- [x] Regions collection + 4 bölge seed

### 🟡 Orta vadeli (1-2 hafta)
- [ ] PB_ENCRYPTION_KEY rotate + git history temizle
- [ ] YCA admin şifre rotate (Yca2024!AdminPass! plaintext bırakıldı)
- [ ] Meta WhatsApp Cloud API setup (WABA onayı 1-2 gün)
- [ ] Sentry error tracking
- [ ] UptimeRobot veya BetterStack monitoring
- [ ] Backup'ı VPS dışına taşı (S3 veya başka VPS'e rsync)
- [ ] 2. arsa ekleme (portföy zenginleştirme)
- [ ] Bot system prompt admin panelden (bot_settings collection zaten var)

### 🔵 Uzun vadeli (1+ ay)
- [ ] Staging ortamı
- [ ] A/B test (bot vs insan response time)
- [ ] KVKK aydınlatma metni (form'da referans var, henüz sayfa yok)
- [ ] Mobile app veya PWA
- [ ] Zernio entegrasyonu (omnichannel inbox)

---

## 11. Sık Kullanılan Komutlar

```bash
# Servisleri kontrol
systemctl status nginx pocketbase yca-api

# Loglar
journalctl -u pocketbase -n 30 --no-pager
journalctl -u yca-api -n 30 --no-pager
tail -f /var/log/nginx/access.log

# Yeni arsa ekle (PB admin API)
TOKEN=$(curl -s -X POST https://temelliarsa.com/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@ycayatirim.com.tr","password":"Yca2024!AdminPass!"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
curl -X POST https://temelliarsa.com/api/collections/listings/records \
  -H "Authorization: $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"...","slug":"...","price":...,"currency":"TRY","area_m2":...,...}'

# Yeni RAG dökümanı ekle
# 1) bot_documents'a INSERT (raw_text ile)
# 2) /api/rag/embed tetikle → chunk + Gemini embed
# 3) active=true yap

# Deploy frontend
cd /root/yca && npm run build && rsync -a --delete dist/ /var/www/temelliarsa/dist/

# Backup al (manuel)
/opt/yca-pocketbase/backup.sh
```

---

*Bu dosya opencode tarafından otomatik güncellendi. Cumulative: Temmuz 15 2026 - haymana/bala, listings/regions PB, RAG 49 chunk, yca-api, cron backup, security headers, contact fix.*
