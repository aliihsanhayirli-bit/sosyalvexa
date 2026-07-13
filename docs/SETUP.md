# Kurulum Rehberi

## 1. Yerel Geliştirme (Local)

### 1.1. Gereksinimler
- Node.js ≥ 20 (`node --version`)
- PocketBase binary (depoda mevcut, cross-platform için [release](https://github.com/pocketbase/pocketbase/releases))

### 1.2. Kurulum
```bash
git clone <repo> yca
cd yca
npm install
```

### 1.3. İlk admin hesabı
```bash
cd backend
./pocketbase admin create admin@ycayatirim.com.tr "GüçlüŞifre2024!"
cd ..
```

### 1.4. Ortam değişkenleri
```bash
cp .env.example .env
# .env dosyasını düzenle
```

### 1.5. Başlat
```bash
npm run dev:all
```

- Site → http://localhost:5173
- Admin → http://localhost:5173/admin
- PB Admin UI → http://localhost:8090/_/

---

## 2. Production Yapılandırması

`.env.production`:
```env
VITE_POCKETBASE_URL=https://api.ycayatirim.com.tr
VITE_GEMINI_API_KEY=
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_SITE_URL=https://ycayatirim.com.tr
```

> **Not:** Gemini API anahtarı **server-side** (PocketBase hook veya Vercel function) için ayrıca `GEMINI_API_KEY` (VITE_ olmadan) tanımlanmalıdır. Client'a API key sızmamalı.

---

## 3. Veritabanı Kurulumu

PocketBase ilk açılışta `pb_migrations/` klasöründeki tüm migration'ları otomatik çalıştırır.

8 collection otomatik oluşur:

| Collection | Amaç |
|---|---|
| `users` | PocketBase auth (admin/danışman) |
| `listings` | Arsalar (fotoğraf, imar, tapu, fiyat, konum) |
| `contacts` | CRM kişiler (alıcı/satıcı, durum, etiketler) |
| `conversations` | Kanal bazlı sohbet threadleri |
| `messages` | Mesajlar (bot/müşteri/danışman) |
| `timeline_events` | CRM kronolojik olaylar |
| `bot_documents` | RAG embedding'leri |
| `bot_settings` | Bot system prompt singleton |
| `contact_submissions` | Site formundan gelen mesajlar |

---

## 4. Seed Verisi (Opsiyonel)

Gerçek verileri admin panelden girebilirsiniz. Hızlı başlangıç için örnek veri:

PocketBase UI'a gidin → `listings` collection → "New record" → Formu doldurun → "Create".

Veya toplu seed için:
```bash
# backend/seed/listings.json oluşturup aşağıdaki komutla içeri alın
cd backend
./pocketbase import --dir ./pb_data
```

---

## 5. Sorun Giderme

### PocketBase başlamıyor
- Port 8090 kullanımda mı? `netstat -an | findstr 8090` ile kontrol edin.
- `backend/pb_data/data.db` bozulmuş olabilir. Silip yeniden başlatın (tüm verileri siler).

### CORS hatası
PocketBase varsayılan olarak tüm origin'lere izin verir. Eğer sorun yaşarsanız `pb_hooks/` içine:
```js
onBeforeServe((e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*');
}, null);
```

### 3D sahne düşük FPS
- Mobil cihazda otomatik fallback (parallax gradient)
- Masaüstünde GPU acceleration kapalıysa (Chrome `chrome://flags`) etkinleştirin
- Vite dev'de HMR sırasında FPS düşer, prod build daha iyi

### Gemini API 429
Ücretsiz tier günde 1500 istek. Aşılırsa 24 saat bekleyin veya ücretli tier'a geçin.

---

## 6. Yararlı Komutlar

```bash
npm run dev          # Sadece Vite
npm run dev:all      # PocketBase + Vite (önerilen)
npm run build        # Production build
npm run preview      # Build'i lokal serve
npm run typecheck    # TypeScript kontrol
```

```bash
# PocketBase
cd backend
./pocketbase serve                                    # Başlat
./pocketbase admin create <email> <password>          # Admin oluştur
./pocketbase admin update <email>                     # Şifre değiştir
./pocketbase migrate                                  # Manuel migrate
```
