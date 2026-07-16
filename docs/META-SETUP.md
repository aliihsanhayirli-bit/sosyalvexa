# WhatsApp / Messenger / Instagram Kurulumu

> Meta Cloud API, üç kanalı tek noktadan yönetir: WhatsApp, Facebook Messenger, Instagram DM. Tüm mesajlar `contacts` + `conversations` + `messages` + `timeline_events` koleksiyonlarına ortak yazılır.

## 0. Ön Koşullar

- Aktif Meta (Facebook) kişisel hesabı
- Şirketin yasal bilgileri (Vergi no, adres, telefon)
- PocketBase + API server çalışıyor olmalı (bkz. [DEPLOY.md](DEPLOY.md))
- Public HTTPS domain: **https://www.gydgrup.com.tr**
- Meta App: **`gydgrup`** (App ID `1721626692079061`)

---

## 1. Meta Business Suite

### 1.1. Business hesabı
1. https://business.facebook.com → "Create Account"
2. İşletme adı: **GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ.**
3. E-posta + telefon doğrula
4. Security Center → 2FA aktif et

### 1.2. Business Verification
1. Business Settings → Security Center → Business Verification
2. Yasal bilgileri gir (vergi no, adres, telefon)
3. Belgeleri yükle (vergi levhası, imza sirküleri)
4. 1-3 iş günü bekle

---

## 2. WhatsApp Business API

### 2.1. App
1. https://developers.facebook.com → "My Apps"
2. **`gydgrup`** app'ini seç (App ID `1721626692079061`)
3. App Dashboard → "Add a Product" → **WhatsApp** → Set Up

### 2.2. WABA oluştur
- WhatsApp → API Setup → "Create or select a WhatsApp Business Account"
- WABA adı: **Gyd Grup**
- Business Manager'a bağla

### 2.3. Telefon numarası kayıt
1. API Setup → "Add phone number"
2. WhatsApp Business'ta kullanılacak **+90 532 489 25 67** numarası (veya ayrı bir numara)
3. Verify code SMS/voice ile gelir, girin
4. Display name: **GYD Grup**
5. Category: **Real Estate**
6. About: "Ankara genelinde imarlı arsa alım-satım ve yatırım danışmanlığı"
7. Profile photo: `public/logo.png`

> ⚠️ Bu numara kişisel WhatsApp'tan **bağımsız** olmalı (ayrı SIM veya VoIP). Zaten WhatsApp Business hesabı varsa taşınabilir, yoksa yeni hat gerekir.

### 2.4. Webhook ayarla
1. WhatsApp → Configuration → **Webhook**
2. **Callback URL**: `https://www.gydgrup.com.tr/api/webhook/meta`
3. **Verify Token**: `gyd-verify-token` (server'da `META_VERIFY_TOKEN` ile aynı olmalı)
4. Webhook Fields abone ol:
   - `messages` — gelen mesaj
   - `message_template_status_update` — şablon onay durumu
5. Webhook verification otomatik çalışır — Meta `GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...` isteği atar, sunucu `challenge` ile 200 dönmeli

> Akış isteğe bağlı olarak **Meta → n8n → gyd-api** şeklinde de olabilir (mevcut: `n8n.srv885711.hstgr.cloud/webhook/...` → `https://www.gydgrup.com.tr/api/webhook/meta`).

### 2.5. Permanent token al
1. App → Settings → Business Use Cases → System Users → **Add** (Admin rolü)
2. "Generate Token" → `whatsapp_business_management` + `whatsapp_business_messaging` izinleri
3. Token'i **kopyala, client bundle'a koyma** — sadece `/opt/gyd-api/.env` içinde `META_WA_TOKEN`
4. Telefon numarası ID'yi de `META_WA_PHONE_ID` olarak kaydet (API Setup sayfasında yazar)

---

## 3. Facebook Messenger

### 3.1. Facebook Page
1. https://facebook.com/pages/create
2. Sayfa adı: **GYD Grup**
3. Kategori: **Real Estate**

### 3.2. Messenger'ı App'a bağla
1. App → "Add Product" → **Messenger** → Set Up
2. "Connect a Facebook Page" → GYD Grup sayfasını seç
3. Webhook:
   - Callback URL: `https://www.gydgrup.com.tr/api/webhook/meta`
   - Verify Token: `gyd-verify-token`
   - Fields: `messages`, `messaging_postbacks`

### 3.3. Page Access Token
1. Messenger → Settings → "Generate Token"
2. `META_PAGE_ACCESS_TOKEN` olarak `/opt/gyd-api/.env`'e kaydet

---

## 4. Instagram DM

### 4.1. Instagram Business hesabı
1. Instagram uygulaması → Ayarlar → Hesap → "Professional Account" → Business
2. Facebook Page'e bağla (aynı GYD Grup sayfası)

### 4.2. Instagram ürünü
1. App → "Add Product" → **Instagram** → Set Up
2. Business hesabını bağla
3. Webhook:
   - Callback URL: `https://www.gydgrup.com.tr/api/webhook/meta`
   - Verify Token: `gyd-verify-token`
   - Fields: `messages`

---

## 5. Sunucu tarafı entegrasyon

`/opt/gyd-api/.env` (üretim):
```bash
META_VERIFY_TOKEN=gyd-verify-token
META_APP_ID=1721626692079061
META_APP_SECRET=<meta-app-secret>
META_WA_PHONE_ID=<phone-number-id>
META_WA_TOKEN=<permanent-system-user-token>
META_PAGE_ACCESS_TOKEN=<page-access-token>
```

Webhook handler `/opt/gyd-api/server.mjs` içinde:
- `GET /api/webhook/meta` → Meta doğrulama (verify token karşılaştır, challenge döndür)
- `POST /api/webhook/meta` → Gelen mesajı parse et → PocketBase `messages` + `conversations` + `contacts` yaz → bot cevabı veya danışmana devir

> Detaylı implementasyon `server.mjs` ve PocketBase hook'larında (`/opt/gyd-pocketbase/pb_hooks/`).

---

## 6. Mesaj Şablonları

WhatsApp Cloud API **24 saat sonra** serbest mesaj gönderemez. Onaylı template gerekir.

Meta Business Manager → WhatsApp → Message Templates:

| Şablon Adı | Kategori | İçerik |
|---|---|---|
| `welcome_gyd` | Utility | "GYD Grup'a hoş geldiniz! Ankara genelinde imarlı arsa..." |
| `agent_handoff` | Utility | "Sizi danışmanımız {{1}} ile buluşturuyorum" |
| `property_alert` | Marketing | "Yeni arsa: {{1}} - {{2}} m² - {{3}}" |
| `visit_confirm` | Utility | "Yer gösterme randevunuz {{1}} saat {{2}} için onaylandı" |

Onay süresi: 1-24 saat.

---

## 7. Test

```bash
# 1) Webhook doğrulama
curl "https://www.gydgrup.com.tr/api/webhook/meta?hub.mode=subscribe&hub.verify_token=gyd-verify-token&hub.challenge=test123"
# Beklenen çıktı: test123

# 2) WhatsApp'tan +90 532 489 25 67'ye "Merhaba" yaz
# 3) Bot cevap vermeli, admin panelde görünmeli
```

PocketBase kontrol:
```bash
curl http://127.0.0.1:8090/api/collections/conversations/records | jq .
curl http://127.0.0.1:8090/api/collections/messages/records | jq .
```

Log:
```bash
journalctl -u gyd-api -f
```

---

## 8. Fiyatlandırma

| Tür | Maliyet (yaklaşık) |
|---|---|
| Marketing template | ~₺0.65/mesaj |
| Utility template | ~₺0.15/mesaj |
| Service window (24 saat içi) | Ücretsiz |
| Messenger | Ücretsiz |
| Instagram DM | Ücretsiz |

**Tahmini aylık** (300 konuşma, %50 marketing): ~₺200-400/ay

---

## 9. KVKK & Yasal

- WhatsApp'ta ilk mesajda **"Devam etmek için KVKK onayı"** butonu sunulmalı
- Mesaj logları **2 yıl** saklanabilir (PocketBase'te)
- Müşteri "iptal" derse iletişim kesilmeli
- Soft-delete: admin panelden "verilerimi sil"
