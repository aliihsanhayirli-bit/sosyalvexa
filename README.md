# Vexabiz Digital — Premium 3D Web + CRM + Omnichannel Bot

> **Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.** için geliştirilmiş, 3D lüks web sitesi, mini CRM ve çok kanallı (Web / WhatsApp / Messenger / Instagram) yapay zekâ destekli dijital dönüşüm asistanı. **sos.vexabiz.com** alanında yayınlanır.

![Tech: Vite + React + Three.js + PocketBase + Gemini](https://img.shields.io/badge/stack-Vite%20%2B%20React%20%2B%20Three.js%20%2B%20PocketBase%20%2B%20Gemini-blue)

---

## ✨ Özellikler

### Müşteri Yüzü (`/`)
- **3D Hero Sahnesi** — 3D ofis simülasyonu (laptop, monitör, telefonlar, CRM paneli, network connections), postprocessing, mobile fallback
- **Slogan**: "Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?"
- **Anasayfa** — Öne çıkan hizmetler, 5 referans proje (sosyal kanıt), 3 değer önerisi (Hemen / Doğru / Tam), istatistikler, CTA
- **Hizmetler** — Meta BM Kurulumu · Kurumsal Web Sitesi · CRM Kurulumu · Yapay Zeka Çalışanı + Tam Dijital Dönüşüm paketi
- **Hizmet Detay** — Her hizmet için ayrı slug sayfa, fiyat + süre + kapsam
- **Paketler** — 3 fiyat paketi (Başlangıç / Profesyonel / Kurumsal), detaylı fiyat karşılaştırma tablosu
- **Referanslar** — 5 tamamlanan proje (gydgrup.com.tr, temelliarsa.com, autotube.vip, vb.)
- **Hakkımızda** — Hikâye, değerler, zaman çizelgesi, ekip
- **İletişim** — Form, telefon, WhatsApp, e-posta
- **Yüzen Chat Widget** — Gemini AI, RAG, intent tespiti, danışmana devir

### Yönetim Paneli (`/admin`)
- **Dashboard** — KPI, lead trendi, kanal dağılımı, pipeline grafiği
- **CRM · Kişiler** — Dikey Kanban + Liste, drag-drop, alıcı/satıcı filtre, kanal bazlı
- **Kişi Kartı** — Konuşma, timeline, konum fotoğrafı gönderme, durum değiştirme, notlar
- **Konuşmalar** — Aktif oturumlar, bot/devral, kanal filtre
- **Bot & RAG** — System prompt, hoşgeldin mesajı, doküman yükleme (PDF/MD/TXT/DOCX), test konsolu, embedding sayısı
- **Takım** — Rol bazlı (admin/danışman), davet sistemi
- **Ayarlar** — Firma bilgileri, sosyal, entegrasyon durumu

### Omnichannel
- **Web Chat** — Vite plugin + Gemini API (server-side key, RAG)
- **WhatsApp Cloud API** — Meta webhook endpoint hazır
- **Facebook Messenger** — Meta Graph API
- **Instagram DM** — Meta Graph API
- Tüm kanallar `contacts` + `conversations` + `messages` + `timeline_events` tablolarına ortak yazılır

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js ≥ 20
- PocketBase binary (depoda `backend/pocketbase` mevcut, Linux/macOS için [indirin](https://github.com/pocketbase/pocketbase/releases))

### Kurulum (3 adım)

```bash
# 1) Bağımlılıkları yükle
npm install

# 2) İlk admin hesabını oluştur (sadece bir kez)
cd backend
./pocketbase admin create admin@vexabiz.com "GucluSifre2026!"
cd ..

# 3) Hem PocketBase hem Vite'ı başlat
npm run dev:all
```

Veya **Windows**'ta:
```cmd
dev.bat
```

| Servis | URL |
|---|---|
| Site | http://localhost:5173 |
| Admin Panel | http://localhost:5173/admin |
| PocketBase Admin UI | http://localhost:8090/_/ |
| PocketBase REST API | http://localhost:8090/api/ |

**Admin paneline giriş:** `admin@vexabiz.com` / oluşturduğunuz şifre

---

## ⚙️ Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_GEMINI_API_KEY=AIza...           # https://aistudio.google.com
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_WHATSAPP_NUMBER=905452788073
VITE_SITE_URL=http://localhost:5173
```

> **Önemli:** `GEMINI_API_KEY`'i (VITE_ olmadan) sunucu tarafında da tanımlayın. Vite API plugin (dev) ve PocketBase hooks (prod) tarafında okunur.

---

## 📁 Proje Yapısı

```
vexabiz/
├── public/                 # Logo, statik dosyalar
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, Form, Badge, Dialog
│   │   ├── layout/        # SiteLayout, AdminLayout, Header, Footer
│   │   ├── three/         # Hero3D (3D ofis — Three.js)
│   │   └── chat/          # ChatWidget
│   ├── pages/
│   │   ├── site/          # Müşteri sayfaları (Home, About, Services, ServiceDetail, Packages, References, Contact, KVKK)
│   │   └── admin/         # Yönetim sayfaları
│   ├── lib/               # pb, utils, constants ← şirket bilgileri
│   ├── types/             # TS tipleri
│   ├── styles/            # globals.css
│   ├── App.tsx            # Router
│   └── main.tsx           # Entry
├── backend/
│   ├── pocketbase         # Backend binary
│   ├── pb_migrations/     # 17 collection migration
│   ├── pb_hooks/          # mesajlar, contacts otomatik timeline
│   └── pb_data/           # SQLite (git'e dahil değil)
├── vite/
│   └── api-plugin.js      # /api/chat, /api/webhook/meta
├── docs/                  # SETUP, DEPLOY, META-SETUP
├── dev.mjs                # Cross-platform başlatıcı
├── dev.bat                # Windows başlatıcı
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Vite 5, React 18, TypeScript |
| 3D | three.js, @react-three/fiber, drei, postprocessing |
| UI | Tailwind CSS 3, shadcn-tarzı primitives, Framer Motion |
| State | TanStack Query, Zustand |
| Forms | react-hook-form + Zod |
| Backend | PocketBase (Go + SQLite) — Auth, DB, Storage, Realtime, Hooks |
| AI | Google Gemini 1.5 Flash + text-embedding-004 |
| Map | MapLibre GL (ücretsiz OSM) |
| Charts | Recharts |
| DnD | @dnd-kit |

---

## 💰 Maliyet

| Bileşen | Aylık |
|---|---|
| Vercel (frontend) | **$0** (free tier) |
| Oracle Cloud Free Tier (PocketBase, 4 vCPU/24GB kalıcı) | **$0** |
| Domain (sos.vexabiz.com subdomain) | $0 (parent: vexabiz.com) |
| SSL (Let's Encrypt) | $0 |
| Gemini API (free tier) | $0 — 1500 istek/gün |
| **Toplam** | **~$0/ay** |

---

## 📚 Dokümantasyon

- **[docs/SETUP.md](docs/SETUP.md)** — Detaylı kurulum
- **[docs/DEPLOY.md](docs/DEPLOY.md)** — Production'a alma (Vercel + Oracle/Hetzner)
- **[docs/META-SETUP.md](docs/META-SETUP.md)** — WhatsApp/Messenger/Instagram bağlama
- **[docs/RAG.md](docs/RAG.md)** — RAG pipeline ve embedding yükleme
- **[docs/CRM.md](docs/CRM.md)** — Mini CRM kullanım kılavuzu

---

## 🤝 Desteklenen İçerik

- **Vite plugin (`vite/api-plugin.js`)** — Dev server'da `/api/chat` ve `/api/webhook/meta` endpoint'lerini sağlar. Production'da bu görev PocketBase Go hooks'a veya serverless function'a taşınır.

---

## 📜 Lisans

© 2018-2026 Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti. Tüm hakları saklıdır.
