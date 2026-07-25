# Vexabiz Digital — AI Agent Rehberi

> **Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.** için geliştirilmiş premium 3D web sitesi, mini CRM ve çok kanallı (Web / WhatsApp / Messenger / Instagram) yapay zekâ destekli dijital dönüşüm asistanı.

## Şirket (tek kaynak)

| Alan | Değer |
|---|---|
| Tam unvan | Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti. |
| Kısa marka | **Vexabiz Digital** |
| Slogan | Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz? |
| Kısa tagline | Dijital Dönüşüm Ortağınız |
| Telefon / WhatsApp | **+90 545 278 80 73** (`905452788073`) |
| E-posta | info@vexabiz.com |
| Domain | **sos.vexabiz.com** |
| Kapsam | Türkiye geneli · KOBİ ve işletmeler · dijital dönüşüm |
| Sosyal | Instagram · Facebook · LinkedIn · YouTube |

> ⚠️ WhatsApp ve sosyal linkler için tek kaynak: `src/lib/constants.ts → COMPANY`. UI'da asla hard-code etme.

## Marka & Görsel Kimlik

- **Renkler**: koyu lacivert zemin (`#0E1320` civarı) + **altın aksan** (`hsl(43 80% 52%)`, `#D4A82B` ailesi). Kırmızı sadece kritik CTA için.
- **Logo**: `public/logo.png` (512×512, şeffaf arka plan). Koyu temada doğrudan kullanılır.
- **Tipografi**: Başlıklar Cormorant Garamond (serif, "font-display"), gövde Inter.
- **CSS değişkenleri**: `src/styles/globals.css` içindeki `--accent` (altın) ve `--primary` (lacivert) **dokunulmaz**. Tailwind token'ları (`tailwind.config.js` `gold` skalası) bunlarla tutarlı olmalı.

## Ana Hizmetler

| # | Hizmet | Slug | Başlangıç | Teslim |
|---|---|---|---|---|
| 1 | Meta Business Manager Kurulumu | `meta-business-manager` | 7.500 TL | 3-7 gün |
| 2 | Kurumsal Web Sitesi | `kurumsal-web-sitesi` | 20.000 TL | 15-30 gün |

## Fiyat Paketleri

| Paket | Kurulum | Aylık |
|---|---|---|
| Başlangıç | 15.000 - 25.000 TL | 5.000 - 8.000 TL |
| Profesyonel (öne çıkan) | 40.000 - 75.000 TL | 15.000 - 25.000 TL |
| Kurumsal | 100.000 - 200.000+ TL | 30.000 - 60.000 TL |

## Referanslar (sosyal kanıt)

1. www.gydgrup.com.tr
2. temelliarsa.com
3. https://www.xn--aslangrupaltndagmanitousaatlikgnlkkepcekiralama-74ec14x.com/
4. www.autotube.vip
5. https://app.dijitalvarlikyonetim.com/tr

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
| Harita | MapLibre GL (opsiyonel, henüz kullanılmıyor) |
| Chart | Recharts |
| DnD | @dnd-kit |

## Dizin Yapısı

```
gyd/
├── public/                 # logo.png, robots.txt, sitemap.xml
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, Form, Badge, Dialog
│   │   ├── layout/        # SiteLayout, AdminLayout, Header, Footer
│   │   ├── three/         # Hero3D (3D ofis sahnesi)
│   │   └── chat/          # ChatWidget
│   ├── pages/
│   │   ├── site/          # Home, About, Services, ServiceDetail, Packages, References, Contact, KVKK
│   │   └── admin/         # Dashboard, Contacts, Conversations, Bot, Users, Settings
│   ├── lib/               # pb, utils, constants ← şirket bilgileri
│   ├── types/             # TypeScript tipleri
│   ├── styles/            # globals.css
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── pocketbase*        # binary
│   ├── pb_migrations/     # PocketBase koleksiyon şemaları (17 adet)
│   ├── pb_hooks/          # chat API + Meta webhook (chat.pb.js) + mesaj/contact otomasyonu
│   └── pb_data/           # SQLite (git'lenmez)
├── vite/api-plugin.js     # dev /api/chat, /api/webhook/meta
├── docs/                  # SETUP, DEPLOY, META-SETUP, RAG
├── tailwind.config.js
├── vite.config.ts
├── package.json           # ad: vexabiz-digital
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
npm run build:check         # typecheck + build
npm run preview              # dist'i lokal serve
npm run deploy:prod          # build → /var/www/vexabiz-sos/dist + PB hooks/migrate + vexabiz-pocketbase restart
```

## Ortam Değişkenleri

`.env.example` şablon olarak kullan. **Asla gerçek anahtarları commit etme.**

| Anahtar | Açıklama |
|---|---|
| `VITE_POCKETBASE_URL` | PocketBase REST adresi |
| `VITE_GEMINI_API_KEY` | Frontend Gemini (kullanıcıya sızar — dikkat) |
| `VITE_GEMINI_MODEL` | Varsayılan `gemini-1.5-flash` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp tıkla-yaz linkleri |
| `VITE_SITE_URL` | Tam site URL'i (canonical, OG) — `https://sos.vexabiz.com` |
| `GEMINI_API_KEY` | Sunucu tarafı (Vite plugin, PocketBase hooks) |
| `GEMINI_MODEL` | Sunucu tarafı model |
| `META_VERIFY_TOKEN` | Webhook doğrulama |
| `META_WA_TOKEN` / `META_WA_PHONE_ID` | WhatsApp Cloud API |
| `META_PAGE_ACCESS_TOKEN` | FB/IG Graph API |
| `PB_ENCRYPTION_KEY` | PocketBase 32+ rastgele karakter |

## Meta Entegrasyonu (Vexabiz markası)

| Alan | Değer |
|---|---|
| Meta App adı | Vexabiz (kullanıcı panelde ayarlanır) |
| Webhook URL (Meta → n8n veya doğrudan) | `https://sos.vexabiz.com/api/webhook/meta` |
| Verify Token | `vexabiz-verify-token` |
| OAuth2 | PocketBase'te Facebook + Instagram `enabled=true` (gerektiğinde) |

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

- Yeni hizmet ekle → `src/lib/constants.ts SERVICES` + (opsiyonel) PocketBase `services` collection'a kayıt
- Yeni paket ekle → `src/lib/constants.ts PACKAGES` + PocketBase `packages` kayıt
- Yeni referans → `src/lib/constants.ts REFERENCES` + PocketBase `references` kayıt
- Yeni sosyal link → `COMPANY.social` + `Footer.tsx` lucide ikonu import et
- Renk değişikliği → `globals.css` `--accent` ve `tailwind.config.js` `gold` skalası birlikte
- Logo değişikliği → `public/logo.png` (PNG, şeffaf arka plan, kare 512×512+)
- AI prompt değişikliği → hem `src/pages/admin/Bot.tsx DEFAULT_PROMPT` hem `vite/api-plugin.js SYSTEM_PROMPT`

## Bilinen Pre-existing Sorunlar

- `tsc --noEmit` 2 hata: `Doc.raw_text` (Bot.tsx) ve `Listing.featured` (kaldırıldı, kontrol et) — tip tanımı eksik, runtime çalışır
- `docs/*` klasöründe hâlâ GYD Grup yönlendirmeleri var (gydgrup.com.tr, temelliarsa.com) — bunlar referans projeler olarak kasıtlı
- `STATUS.md` eski GYD prod mimarisini anlatıyor, güncellenmeli
- `bootstrap.pb.js.disabled` — PocketBase v0.22'de `onServe` tanımsız

## İlk Kurulum Checklist

1. `npm install`
2. `pocketbase admin create admin@vexabiz.com "GucluSifre2026!"` (PB UI admin)
3. `.env` dosyasını `.env.example`'dan kopyala, anahtarları doldur
4. `npm run dev:all` — Vite (5173) + PocketBase (8090) birlikte
5. `npm run typecheck && npm run build` — production build doğrula
6. Deploy: `npm run deploy:prod` (rsync + systemd)
