# YCA Staging Rehberi

## Amaç
Production'a geçmeden önce frontend değişikliklerini güvenli bir ortamda test etmek. Aynı PocketBase API'sini paylaşır, veri etkilenmez.

## Kullanım

### Staging build
```bash
npm run build:staging
# veya otomatik deploy ile
npm run deploy:staging
```

### Erişim
- Staging URL: `https://temelliarsa.com/staging/`
- Production URL: `https://temelliarsa.com/`

### Banner
Staging build'de sayfanın üstünde turuncu banner görünür: "⚠ STAGING — Canlıya yansımaz, sadece test amaçlıdır"

### Production'a deploy
```bash
npm run deploy:prod
```

## Mimari
- Frontend: `/var/www/yca-staging/dist/` (staging) + `/var/www/temelliarsa/dist/` (prod)
- API: her ikisi de aynı PocketBase instance'ını kullanır (`https://temelliarsa.com/api/`)
- Nginx: `/staging/` location alias ile staging dist'e yönlendirilir
- Datalar: STAGING ve PROD aynı PB'yi paylaşır — staging'de yapılan tüm değişiklikler prod'da da görünür!

## Önemli notlar
- **Staging'de test verisi oluşturmayın** — prod'a yansır
- **Staging'de fotoğraf yüklemeyin** — prod'da görünür
- **Yeni arsa eklemeyin** — gerçek veri karışır
- Sadece UI testleri için kullanın
- Eğer staging'de değişiklik gerekirse, PB admin'de `test-` prefix'i ile geçici kayıt oluşturup sonra silin

## İdealler (henüz yapılmadı)
- Ayrı PB instance (port 8091'de ikinci PB)
- Kendi domain'i (staging.temelliarsa.com)
- Test verisi otomatik seed
