# WhatsApp / Messenger / Instagram Kurulumu

> ⚠️ **Önemli:** Bu entegrasyon Meta Business hesabı, geliştirici hesabı ve kurumsal doğrulama gerektirir. TC/Vergi no ile doğrulama 1-3 iş günü sürebilir.

## 0. Ön Koşullar

- Aktif bir Meta (Facebook) kişisel hesabı
- Şirketin yasal bilgileri (TC/Vergi no, adres, telefon)
- Marka/logo
- PocketBase sunucusu (Bkz. [DEPLOY.md](DEPLOY.md))
- Bir domain + SSL (`https://api.ycayatirim.com.tr`)

---

## 1. Meta Business Suite Kurulumu

### 1.1. Business hesabı
1. https://business.facebook.com adresine gidin
2. "Create Account" → İşletme adı: **YCA TİCARİ YATIRIM DANIŞMANLIK LTD. ŞTİ.**
3. E-posta, telefon doğrula
4. "Security Center" → 2FA aktif et

### 1.2. Business Verification
1. Business Settings → Security Center → Business Verification
2. "Start Verification" → Yasal bilgileri gir:
   - Şirket ünvanı
   - TC/Vergi numarası
   - Adres
   - Telefon
3. Belgeleri yükle (vergi levhası, imza sirküleri vb.)
4. 1-3 iş günü bekle

---

## 2. WhatsApp Business API

### 2.1. App oluşturma
1. https://developers.facebook.com → "My Apps" → "Create App"
2. Type: **Business**
3. App name: `YCA Yatırım Chat`
4. Use Cases: **Other** → tümünü seç
5. Business: yeni oluşturduğunuz business

### 2.2. WhatsApp ürünü ekle
1. App Dashboard → "Add a Product" → **WhatsApp** → Set Up
2. "WhatsApp Business API" → "Get Started"

### 2.3. Phone number kayıt
1. API Setup → "Add phone number"
2. **Business phone number** = `0545 655 10 70` (sizin fiziksel numaranız olmamalı, yeni bir numara olabilir veya mevcut WhatsApp Business hesabı varsa kullanabilirsiniz)
3. Verify code SMS veya voice ile gelir, girin
4. Display name: `YCA Yatırım`
5. Category: **Real Estate**

### 2.4. Webhook ayarla
1. App → WhatsApp → Configuration → **Webhook**
2. Callback URL: `https://api.ycayatirim.com.tr/api/webhook/meta`
3. Verify Token: `yca-verify-token` (server'da `META_VERIFY_TOKEN` env'inde aynı olmalı)
4. Webhook Fields abone ol:
   - `messages` (mesaj aldığında)
   - `message_template_status_update` (şablon onay durumu)

### 2.5. Permanent token al
1. App → Settings → Basic → "Generate Access Token" → **System User** seç
2. Permissions: `whatsapp_business_management`, `whatsapp_business_messaging`
3. Token'i **asla client'a koymayın** — sadece PocketBase hook'unda kullanın

---

## 3. Facebook Messenger

### 3.1. Facebook Page
1. https://facebook.com/pages/create → Business veya Brand
2. Sayfa adı: `YCA Yatırım`
3. Kategori: **Real Estate**

### 3.2. Messenger'ı App'a bağla
1. App Dashboard → "Add Product" → **Messenger** → Set Up
2. "Connect a Facebook Page" → sayfayı seç
3. Webhook ayarla:
   - Callback URL: `https://api.ycayatirim.com.tr/api/webhook/meta`
   - Verify Token: `yca-verify-token`
   - Fields: `messages`, `messaging_postbacks`

### 3.3. Page Access Token
1. Messenger → Settings → "Generate Token"
2. Server'a kaydet (`META_PAGE_ACCESS_TOKEN`)

---

## 4. Instagram DM

### 4.1. Instagram Business hesabı
1. Instagram uygulaması → Ayarlar → Hesap → "Professional Account" → Business
2. Facebook Page'e bağla

### 4.2. Instagram ürünü ekle
1. App Dashboard → "Add Product" → **Instagram** → Set Up
2. Business hesabını bağla
3. Webhook:
   - Callback URL: `https://api.ycayatirim.com.tr/api/webhook/meta`
   - Verify Token: `yca-verify-token`
   - Fields: `messages`

---

## 5. PocketBase Hook (Server-side)

`backend/pb_hooks/meta-webhook.pb.js` oluştur:

```js
/// <reference path="../pb_data/types.d.ts" />

const META_API = 'https://graph.facebook.com/v18.0';

onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'conversations') return e.next();
  // Yeni konuşma oluştuysa agent'lara bildirim gönder (opsiyonel)
  return e.next();
});

// Yardımcı: Meta'dan gelen webhook payload'unu parse et
function parseMetaPayload(body) {
  // Bkz. https://developers.facebook.com/docs/messenger-platform/webhooks
  // WhatsApp için: body.entry[0].changes[0].value.messages
  // Messenger için: body.entry[0].messaging[0]
  // Instagram için: body.entry[0].messaging[0]
}

// Yardımcı: cevap gönder
async function sendWhatsApp(to, text) {
  const phoneId = process.env.META_WA_PHONE_ID;
  const token = process.env.META_WA_TOKEN;
  await fetch(`${META_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}
```

Webhook'un tam implementasyonu için Meta'nın [official quickstart](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)'ına bakın.

---

## 6. Mesaj Şablonları

WhatsApp Cloud API, **24 saat sonra** kullanıcıya serbest mesaj gönderemez. Onaylı template gerekir.

Gerekli şablonlar (Meta Business Manager → WhatsApp → Message Templates):

| Şablon Adı | Kategori | İçerik |
|---|---|---|
| `welcome_yca` | Utility | "YCA Yatırım'a hoş geldiniz! 15+ yıllık tecrübemizle..." |
| `agent_handoff` | Utility | "Sizi danışmanımız {{1}} ile buluşturuyorum" |
| `property_alert` | Marketing | "Yeni arsa: {{1}} - {{2}} m² - {{3}}" |
| `visit_confirm` | Utility | "Yer gösterme randevunuz {{1}} saat {{2}} için onaylandı" |

Onay süresi: 1-24 saat.

---

## 7. Test

1. WhatsApp'tan `0545 655 10 70`'ye "Merhaba" yazın
2. Bot cevap vermeli (Vite plugin `/api/chat` mantığı)
3. PocketBase admin UI → `conversations` tablosunda yeni kayıt olmalı
4. Admin panel → Konuşmalar → mesajı görmelisiniz

---

## 8. Fiyatlandırma

| Tür | Maliyet (yaklaşık) |
|---|---|
| Marketing template | ~₺0.65/mesaj |
| Utility template | ~₺0.15/mesaj |
| Service window (24 saat içi) | Ücretsiz |

**Tahmini aylık** (300 konuşma, %50 marketing): ~₺200-400/ay

---

## 9. İlk 24 Saat Sınırı Hakkında

Müşteri size ilk kez yazdığında 24 saatlik "service window" açılır. Bu sürede:
- ✅ Serbest metin gönderebilirsiniz
- ❌ Sadece marketing template gönderemezsiniz

Müşteri son yazışmadan 24 saat sonra tekrar yazmalı veya onaylı utility template kullanılmalı.

---

## 10. KVKK & Yasal

- WhatsApp'ta ilk mesajda **"Devam etmek için KVKK onayı"** butonu sunulmalı
- Mesaj logları **2 yıl** saklanabilir (PocketBase'te)
- Kullanıcı "iptal" derse iletişim kesilmeli
