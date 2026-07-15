# GYD Grup — AI Agent Rehberi

> **GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ.** için geliştirilmiş 3D lüks web sitesi, mini CRM ve çok kanallı (Web / WhatsApp / Messenger / Instagram) yapay zekâ destekli müşteri asistanı.

## Şirket (tek kaynak)

| Alan | Değer |
|---|---|
| Tam unvan | GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ. |
| Kısa marka | **GYD Grup** |
| Tagline | Emlak Yatırımında Doğru Adres |
| Kurucu | Ali İhsan Hayırlı |
| Telefon / WhatsApp | **+90 532 489 25 67** (`905324892567`) |
| E-posta | info@gydgrup.com.tr |
| Domain | gydgrup.com.tr (bu VPS'e yönlendirilmiş) |
| Kapsam | **Ankara geneli · sadece imarlı arsa** |
| Sosyal | [Instagram](https://www.instagram.com/gydgrup/) · [Facebook](https://www.facebook.com/gydgrupankara/) · [YouTube](https://www.youtube.com/@GydGrupGayrimenkul) |
| GitHub | https://github.com/aliihsanhayirli-bit/gyd |

> ⚠️ WhatsApp ve sosyal linkler için tek kaynak: `src/lib/constants.ts → COMPANY`. UI'da asla hard-code etme.

## Marka & Görsel Kimlik

- **Renkler**: koyu lacivert zemin (`#0E1320` civarı) + **altın aksan** (`hsl(43 80% 52%)`, `#D4A82B` ailesi). Kırmızı sadece kritik CTA için.
- **Logo**: `public/logo.png` (512×512, şeffaf arka plan). Koyu temada doğrudan kullanılır.
- **Tipografi**: Başlıklar Cormorant Garamond (serif, "font-display"), gövde Inter.
- **CSS değişkenleri**: `src/styles/globals.css` içindeki `--accent` (altın) ve `--primary` (lacivert) **dokunulmaz**. Tailwind token'ları (`tailwind.config.js` `gold` skalası) bunlarla tutarlı olmalı.

## Teknoloji Yığını

| Katman | Tek |
|---|---|
| Frontend | Vite 5, React 18, TypeScript |
| 3D | three.js, @react-three/fiber, drei, postprocessing |
| UI | Tailwind 3, shadcn-tarzı primitives, Framer Motion, Lucide ikonları |
| State | TanStack Query, Zustand |
| Forms | react-hook-form + Zod |
| Backend | PocketBase (Go + SQLite) — `backend/pocketbase*` |
| AI | Google Gemini 1.5 Flash + text-embedding-004 |
| Harita | MapLibre GL (ücretsiz OSM) |
| Chart | Recharts |
| DnD | @dnd-kit |

## Dizin Yapısı

```
gyd/
├── public/                 # logo.png, robots.txt, sitemap.xml
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, Form, Badge, Dialog (değiştirme)
│   │   ├── layout/        # SiteLayout, AdminLayout, Header, Footer
│   │   ├── three/         # Hero3D (Three.js sahnesi)
│   │   └── chat/          # ChatWidget
│   ├── pages/
│   │   ├── site/          # Müşteri: Home, About, Listings, Contact...
│   │   └── admin/         # Admin: Dashboard, Bot, CRM, Settings
│   ├── lib/               # pb, utils, constants ← şirket bilgileri
│   ├── types/             # TypeScript tipleri
│   ├── styles/            # globals.css
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── pocketbase*        # binary
│   ├── pb_migrations/     # PocketBase koleksiyon şemaları
│   ├── pb_hooks/          # mesaj/contact otomasyonu
│   └── pb_data/           # SQLite (git'lenmez)
├── vite/api-plugin.js     # dev /api/chat, /api/webhook/meta
├── docs/                  # SETUP, DEPLOY, META-SETUP, RAG
├── tailwind.config.js
├── vite.config.ts
├── package.json           # ad: gyd-grup
└── dev.mjs                # cross-platform başlatıcı
```

## Geliştirme Komutları

```bash
npm install                  # bağımlılıklar
npm run dev                  # sadece Vite (5173)
npm run dev:all              # Vite + PocketBase birlikte
npm run typecheck            # tsc strict
npm run typecheck:all        # tsc -b
npm run build                # production build → dist/
npm run build:check          # typecheck + build
npm run preview              # dist'i lokal serve
npm run deploy:prod          # build + rsync /var/www/gydgrup/dist/
```

## Ortam Değişkenleri

`.env.example` şablon olarak kullan. **Asla gerçek anahtarları commit etme.**

| Anahtar | Açıklama |
|---|---|
| `VITE_POCKETBASE_URL` | PocketBase REST adresi |
| `VITE_GEMINI_API_KEY` | Frontend Gemini (kullanıcıya sızar — dikkat) |
| `VITE_GEMINI_MODEL` | Varsayılan `gemini-1.5-flash` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp tıkla-yaz linkleri |
| `VITE_SITE_URL` | Tam site URL'i (canonical, OG) |
| `GEMINI_API_KEY` | Sunucu tarafı (Vite plugin, PocketBase hooks) |
| `GEMINI_MODEL` | Sunucu tarafı model |
| `META_VERIFY_TOKEN` | Webhook doğrulama — şu an `gyd-verify-token` |
| `META_WA_TOKEN` / `META_WA_PHONE_ID` | WhatsApp Cloud API |
| `META_PAGE_ACCESS_TOKEN` | FB/IG Graph API |
| `PB_ENCRYPTION_KEY` | PocketBase 32+ rastgele karakter |

## Meta Entegrasyonu

| Alan | Değer |
|---|---|
| Meta App adı | **gydgrup** (eskiden "n8nai") |
| App ID | `1721626692079061` |
| App Secret | `/opt/gyd-api/.env` → `META_APP_SECRET` |
| WABA adı | Gyd Grup |
| Webhook URL (Meta → n8n) | `https://n8n.srv885711.hstgr.cloud/webhook/...` (n8n tarafında) |
| Webhook URL (n8n → gyd-api) | `https://gydgrup.com.tr/api/webhook/meta` |
| Verify Token | `gyd-verify-token` |
| OAuth2 | PocketBase'te Facebook + Instagram `enabled=true` |
| Yetki verilmemiş | `META_WA_PHONE_ID`, `META_WA_TOKEN`, `META_PAGE_ACCESS_TOKEN` — Meta App dashboard'dan alınacak |

Meta App ID ve Secret bağlantıyı bozmaz, sadece PocketBase OAuth2 `clientId` alanı numeric ID tutar — rename sonrası dokunmaya gerek yok.

## Kodlama Kuralları

1. **Şirket bilgisi** tek kaynaktan gelsin: `COMPANY` (constants.ts). Yeni bir yere telefon/e-posta/adres hard-code etme.
2. **Dil**: UI Türkçe, kod İngilizce. Yorum/Commit Türkçe olabilir.
3. **Tipler**: `src/types/index.ts` ortak tipleri içerir. PocketBase kayıtlarında `unknown` yerine daraltılmış tip kullan.
4. **Renk**: `accent` altın, `primary` lacivert. Teal/cyan yeni kod ekleme. CTA'lar `bg-accent` ile.
5. **Responsive**: Mobil-first, lg breakpoint'te grid açılır. Three.js sahnesi mobile fallback ile.
6. **A11y**: Butonlarda `aria-label`, formlarda `<label htmlFor>`, ikon linklerinde metin alternatifi.
7. **Yorum yok** (kullanıcı talebi). Sadece neden açıklanmadığında TODO/FIXME bırakılabilir.
8. **Yapı değişikliği**: PocketBase migration'ı `backend/pb_migrations/` altında atomik dosya. Go hooks `backend/pb_hooks/` altında.

## Yapılacaklar İçin Kontrol Listesi

- Yeni bölge ekle → `src/lib/constants.ts REGIONS` + (opsiyonel) PocketBase `regions` collection'a kayıt
- Yeni sosyal link → `COMPANY.social` + `Footer.tsx` lucide ikonu import et
- Renk değişikliği → `globals.css` `--accent` ve `tailwind.config.js` `gold` skalası birlikte
- Logo değişikliği → `public/logo.png` (PNG, şeffaf arka plan, kare 512×512+)
- AI prompt değişikliği → hem `src/pages/admin/Bot.tsx DEFAULT_PROMPT` hem `vite/api-plugin.js SYSTEM_PROMPT`

## Bilinen Pre-existing Sorunlar (rebrand'le ilgisiz)

- `tsc --noEmit` 2 hata: `Doc.raw_text` (Bot.tsx) ve `Listing.featured` (ListingDetail.tsx) — tip tanımı eksik, runtime çalışır
- `docs/*` klasöründe hâlâ YCA yönlendirmeleri var (`ycayatirim.com.tr`, `temelliarsa.com`)
- `STATUS.md` eski prod mimarisini anlatıyor
