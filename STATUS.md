# YCA Yatırım — Agent Env Status & Roadmap

> **Son güncelleme:** 2026-07-15
> **Hazırlayan:** opencode (MiniMax-M3) — agent context
> **Repo:** `/root/yca`

---

## 1. Project Snapshot

| Alan | Değer |
|---|---|
| Ürün | Temelli bölgesi arsa alım-satım & yatırım danışmanlığı (Ankara) |
| Şirket | YCA TİCARİ YATIRIM DANIŞMANLIK LTD. ŞTİ. |
| Domain | `https://temelliarsa.com` |
| Versiyon | `0.1.0` |
| Stack | Vite 5 · React 18 · TypeScript · Three.js · PocketBase · Gemini 1.5 Flash |
| Mimari | Müşteri yüzü (`/`) + Admin (`/admin`) + Omnichannel bot (Web/WhatsApp/Messenger/IG) |

---

## 2. Environment Status (`.env`)

| Key | Status | Değer / Not |
|---|---|---|
| `VITE_POCKETBASE_URL` | ✅ dolu | `https://temelliarsa.com` (prod URL) |
| `VITE_GEMINI_API_KEY` | ✅ dolu | `REDACTED_GEMINI_KEY` |
| `VITE_GEMINI_MODEL` | ✅ dolu | `gemini-flash-latest` (alias, en güncel stable Flash) |
| `VITE_WHATSAPP_NUMBER` | ✅ dolu | `905456551070` |
| `VITE_SITE_URL` | ✅ dolu | `https://temelliarsa.com` |
| `GEMINI_API_KEY` (server) | ✅ dolu | Vite plugin / PocketBase hook için |
| `GEMINI_MODEL` | ✅ dolu | `gemini-flash-latest` (alias) |
| `META_VERIFY_TOKEN` | ✅ dolu | `yca-verify-token` (webhook doğrulama) |
| `META_WA_TOKEN` | ❌ **boş** | WhatsApp Cloud API |
| `META_WA_PHONE_ID` | ❌ **boş** | WhatsApp phone number ID |
| `META_PAGE_ACCESS_TOKEN` | ❌ **boş** | Messenger + Instagram DM |
| `PB_ENCRYPTION_KEY` | ⚠️ **plaintext** | `47e22...` rotate edilmeli, güvenlik riski |

**Özet:** 8/12 anahtar dolu, 3 kritik boş (Meta × 3), 1 güvenlik riski (PB key).

---

## 3. Agent Status (opencode runtime)

| Alan | Değer |
|---|---|
| Çalışma dizini | `/root` |
| Proje konumu | `/root/yca` (eski: `/tmp/opencode/yca`) |
| Aktif servisler | ❌ yok (PocketBase/Vite çalışmıyor) |
| Zernio API | ✅ canlı, sandbox hazır (`sk_ede16...cd1be9f5`) |
| Proje son değişiklik | `2026-07-15 02:46` (dist build) |
| Proje oluşturma | `2026-07-14 00:02` |
| Disk envanteri | node_modules (244 paket), pocketbase binary 40MB, dist build mevcut |

---

## 4. Mimari & Özellik Durumu

### 4.1 Backend (PocketBase)

**Binary:** `backend/pocketbase` (Linux, 40MB, çalıştırılabilir)
**Data:** `backend/pb_data/` (SQLite, git'te yok)
**Migrations (8 collection):**
- `1700000001_create_listings` — arsa portföyü
- `1700000002_create_contacts` — CRM kişileri (alıcı/satıcı)
- `1700000003_create_conversations` — konuşma thread'leri
- `1700000004_create_messages` — mesajlar (tüm kanallar)
- `1700000005_create_timeline_events` — aktivite timeline
- `1700000006_create_bot_documents` — RAG dokümanları
- `1700000007_create_bot_settings` — bot system prompt, hoşgeldin
- `1700000008_create_contact_submissions` — iletişim formu

**Hooks:**
- `messages.pb.js` ✅ aktif (mesaj alındığında otomatik timeline)
- `bootstrap.pb.js.disabled` ❌ pasif

**Admin UI:** `http://localhost:8090/_/` (henüz hesap oluşturulmadı)

### 4.2 Frontend (Vite + React)

**Pages:**
- `site/` — Müşteri yüzü (anasayfa, portföy, arsa detay, 6 bölge, iletişim)
- `admin/` — Yönetim paneli (dashboard, arsa CRUD, CRM Kanban, kişi kartı, konuşmalar, bot/RAG, takım, ayarlar)
- `NotFound.tsx`

**Components:**
- `ui/` — shadcn-tarzı primitives
- `layout/` — SiteLayout, AdminLayout, Header, Footer
- `three/` — Hero3D (Three.js sahnesi)
- `chat/` — ChatWidget (Gemini client + RAG)

**Vite plugin:** `vite/api-plugin.js` → dev'de `/api/chat` + `/api/webhook/meta` endpoint'leri

**Build:** ✅ `dist/` mevcut (Vite production build)

### 4.3 Özellik Matrisi

| Özellik | Durum |
|---|---|
| 3D Hero (Temelli topografik harita) | ✅ tamamlandı |
| Arsa portföyü (grid + harita + filtre) | ✅ tamamlandı |
| 6 bölge için SEO sayfaları | ✅ tamamlandı |
| Admin dashboard (KPI, trend, pipeline) | ✅ tamamlandı |
| Arsa CRUD (çoklu fotoğraf) | ✅ tamamlandı |
| CRM Kanban (drag-drop, dikey) | ✅ tamamlandı |
| Kişi kartı (timeline, konum foto) | ✅ tamamlandı |
| Bot & RAG (system prompt, doküman yükleme) | ✅ UI tamamlandı, ❌ içerik yok |
| Web Chat (Gemini + RAG) | ⚠️ UI hazır, key eksik |
| WhatsApp Cloud API | ⚠️ kod hazır, token eksik |
| Facebook Messenger | ⚠️ kod hazır, token eksik |
| Instagram DM | ⚠️ kod hazır, token eksik |
| Zernio entegrasyonu | ❌ kod yok (kararlaştırıldı) |
| RAG dokümanları | ❌ hiç yüklenmemiş |
| PocketBase admin hesabı | ❌ oluşturulmadı |
| Production veri (arsalar) | ❌ PocketBase boş |

---

## 5. Roadmap

### 🟢 Kısa Vade (1-2 hafta) — "Çalışır hale getir"

| # | Görev | Bağımlılık | Effort |
|---|---|---|---|
| 1 | `.env`'e Gemini key ekle (client + server) | key paylaşıldı, 1 dk | XS |
| 2 | PocketBase admin hesabı oluştur (`./pocketbase admin create ...`) | — | XS |
| 3 | İlk 5-10 Temelli arsası ekle (gerçek veri) | PocketBase admin | S |
| 4 | RAG dokümanları yükle (imar durumu, tapu süreçleri, fiyat analizi PDF/MD) | admin hesabı | S |
| 5 | Meta WhatsApp Cloud API setup → `META_WA_TOKEN`, `META_WA_PHONE_ID` | business.facebook.com'da WABA | M |
| 6 | Meta Messenger + Instagram setup → `META_PAGE_ACCESS_TOKEN` | aynı Meta App | S |
| 7 | Webhook signature doğrulama (X-Hub-Signature-256) | `META_VERIFY_TOKEN` var | S |
| 8 | `PB_ENCRYPTION_KEY` rotate + `.env`'i `.gitignore`'dan koruma | — | S |

### 🟡 Orta Vade (1-2 ay) — "Gerçek müşteri akışı"

| # | Görev | Not |
|---|---|---|
| 9 | **Zernio entegrasyonu** (kararlaştırıldı) | `lib/zernio.ts` + `lib/zernio-webhook.ts`, broadcasts + inbox API, sandbox'ı atla (gerçek bağlantı gerekli) |
| 10 | Bot akış testi (alıcı/satıcı intent, danışmana devir) | Gemini key ile birlikte |
| 11 | Rate limiting (Gemini API + webhook'lar) | abuse önleme |
| 12 | Admin panel güvenliği (IP whitelist, 2FA, role-based) | production öncesi |
| 13 | CRM pipeline görselleştirme (recharts) | dashboard zaten trend gösteriyor |
| 14 | Contact submission → contact otomatik merge (formdan gelen lead) | pb_hooks |
| 15 | Konuşma arşivleme + retention policy | veri büyümesi |

### 🔵 Uzun Vade (3+ ay) — "Ölçek & multi-tenant"

| # | Görev | Not |
|---|---|---|
| 16 | Production deploy (Vercel frontend + Oracle Cloud Free Tier PocketBase) | docs/DEPLOY.md takip et |
| 17 | Monitoring (UptimeRobot, Sentry, log aggregation) | PocketBase Go log + Sentry |
| 18 | A/B test (bot vs insan, response time) | Gemini token tracking |
| 19 | Multi-tenant (her müşteri = 1 profile) | Zernio multi-tenant rehberi uygulanabilir |
| 20 | Zernio MCP server entegrasyonu | `mcp.zernio.com` → AI agent'lar (Claude, Cursor) |
| 21 | Mobile app (React Native + Three.js) | 3D harita + CRM |
| 22 | Click-to-WhatsApp Ads (Meta CTWA) | Zernio `platforms/whatsapp/ctwa` |

---

## 6. Bilinen Riskler & Kararlar

### 🔴 Yüksek risk
- **`PB_ENCRYPTION_KEY` plaintext `.env`'de** — git history'de de olabilir, rotate + history temizle
- **Meta token'lar boş** → WhatsApp/Messenger/IG tamamen devre dışı
- **Production PocketBase'da admin hesabı yok** → yönetim kilitli

### 🟡 Orta risk
- **Gemini key boş** → chat widget 401 verir
- **RAG dokümanı yok** → bot generic cevap verir
- **PocketBase veri yok** → portföy boş, demo yapılamaz

### 🟢 Çözülmüş
- **Zernio yönü kararlaştırıldı** (önceki tur, kullanıcı onayı)
- **Proje iskeleti sağlam** (8 migration, hooks, 3D, Kanban CRM)
- **Vite plugin çalışıyor** (dev'de API endpoint'leri hazır)
- **Build çıktısı mevcut** (`dist/` deploy edilebilir)

### 💡 Mimari kararlar
- **Zernio seçildi, direkt Meta değil** — tek API, OAuth karmaşıklığı yok, sandbox test edildi
- **PocketBase + Vite** — self-hosted, ~$0/ay maliyet (Oracle Free Tier)
- **Gemini 1.5 Flash** — ücretsiz tier (1500 istek/gün), RAG için yeterli

---

## 7. Hemen Sonraki Adımlar (1 saat içinde)

```bash
# 1. PocketBase admin hesabı oluştur
cd /root/yca/backend
./pocketbase admin create admin@ycayatirim.com.tr 'GucluSifre!'

# 2. .env'e Gemini key ekle (key paylaşıldı, eklenmedi)
# /root/yca/.env → VITE_GEMINI_API_KEY ve GEMINI_API_KEY satırları

# 3. Dev server başlat (PocketBase + Vite)
cd /root/yca && npm run dev:all
# → http://localhost:5173 (site)
# → http://localhost:8090/_/ (admin)
```

Sonra admin UI'dan:
- İlk 5 arsayı ekle (fotoğraflı, imar bilgisi, fiyat, konum)
- Bot system prompt'u ayarla
- RAG için 2-3 temel doküman yükle (PDF)

---

## 8. Bağlantılı Kaynaklar

- `docs/SETUP.md` — Detaylı kurulum
- `docs/DEPLOY.md` — Vercel + Oracle Cloud deploy
- `docs/META-SETUP.md` — WhatsApp/Messenger/Instagram bağlama
- `docs/RAG.md` — RAG pipeline, embedding yükleme
- `docs/CRM.md` — CRM kullanım kılavuzu
- Zernio API: `https://docs.zernio.com` (Turkish kapsam dışı, İngilizce)
- Zernio MCP: `https://mcp.zernio.com` (AI agent integration)

---

*Bu dosya opencode tarafından otomatik oluşturuldu. Güncelleme için: `> regenerate status` komutu veya manuel düzenleme.*
