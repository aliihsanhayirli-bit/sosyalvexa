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
| 2 | Kurumsal Web Sitesi | `kurumsal-web-sitesi` | 22.500 TL | 7-10 gün |
| 3 | CRM Kurulumu | `crm-kurulumu` | 18.000 TL | 5-10 gün |
| 4 | Yapay Zeka Asistanı | `yapay-zeka-asistani` | 35.000 TL | 7-15 gün |
| 5 | VPS Özel Sunucu Kurulumu | `vps-ozel-kurulum` | 7.500 TL | 2-5 gün |
| 6 | Bakım & Destek | `bakim-destek` | 4.900 TL/ay | Sürekli |

> Hedef pazar: diş klinikleri, fizik tedavi merkezleri, güzellik merkezleri + KOBİ. Tüm fiyatlara %20 KDV eklenir.

## Fiyat Paketleri

| Paket | Fiyat (tek sefer) | Liste Değeri | Teslim |
|---|---|---|---|
| Dijital Başlangıç | 69.900 TL + KDV | 112.000 TL | 7-10 iş günü |
| Dijital Klinik Pro (öne çıkan) | 149.900 TL + KDV | 356.000 TL | 15-25 iş günü |

Bakım: Standart 4.900 TL/ay · Premium 9.900 TL/ay. İsteğe bağlı modüller `ADDON_MODULES`'te.
Çalışma şartları: %50 peşinat havale/EFT + %50 teslimde · 2 revizyon · lisans Vexabiz'de (kullanım hakkı satılır). Sözleşme şablonu: `docs/SOZLESME.md`.

## AI Randevu Sistemi

Bot müşteriyle gün+saat netleştirip onay alınca yanıt sonuna `[[RANDEVU:{...}]]` etiketi yazar; `chat.pb.js` bunu parse edip `appointments` koleksiyonuna `pending` kaydı açar (web + IG/Messenger). Etiket müşteriye gösterilmez. Admin `/admin/randevular`'dan onaylar/iptal eder. Çalışma saatleri prompt'ta: Pzt-Cmt 09:00-19:00. Tarih hesabı runtime'da prompt'a eklenir (Türkiye saati).

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
│   │   └── admin/         # Dashboard, Contacts, Conversations, Appointments, Bot, Users, Settings
│   ├── lib/               # pb, utils, constants ← şirket bilgileri
│   ├── types/             # TypeScript tipleri
│   ├── styles/            # globals.css
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── pocketbase*        # binary
│   ├── pb_migrations/     # PocketBase koleksiyon şemaları (21 adet)
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
- AI prompt değişikliği → 4 kopya birlikte: `backend/pb_hooks/chat.pb.js DEFAULT_SYSTEM` (×2 route) + `src/pages/admin/Bot.tsx DEFAULT_PROMPT` + `vite/api-plugin.js SYSTEM_PROMPT`. Prod DB'deki `bot_settings.system_prompt` kodu ezer — içerik değişikliğinde yeni bir prompt migration'ı gerekir (bkz. 1700000020)

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
