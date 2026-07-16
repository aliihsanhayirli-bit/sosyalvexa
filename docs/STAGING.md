# GYD Staging Rehberi

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
- **Staging URL:** https://www.gydgrup.com.tr/gyd-staging/
- **Production URL:** https://www.gydgrup.com.tr/

### Banner
Staging build'de sayfanın üstünde turuncu banner görünür: "⚠ STAGING — Canlıya yansımaz, sadece test amaçlıdır"

### Production'a deploy
```bash
npm run deploy:prod
```

## Mimari

```
nginx (/gyd-staging/*  →  /var/www/gydgrup-staging/dist/)
   │
   ├── /api/* → aynı PocketBase prod
   └── /gyd-staging/* → aynı gyd-api prod
```

- **Frontend staging:** `/var/www/gydgrup-staging/dist/`
- **Frontend prod:** `/var/www/gydgrup/dist/`
- **API:** her ikisi de aynı `gyd-api.service` (port 8091) + `gyd-pocketbase.service` (port 8090)
- **Nginx:** `/gyd-staging/` location alias (`/etc/nginx/snippets/gyd-staging.conf`)
- **Datalar:** STAGING ve PROD aynı PB'yi paylaşır — staging'de yapılan tüm değişiklikler prod'da da görünür!

## Önemli notlar

- **Staging'de test verisi oluşturmayın** — prod'a yansır
- **Staging'de fotoğraf yüklemeyin** — prod'da görünür
- **Yeni arsa eklemeyin** — gerçek veri karışır
- Sadece UI testleri için kullanın
- Eğer staging'de değişiklik gerekirse, PB admin'de `test-` prefix'i ile geçici kayıt oluşturup sonra silin

## İdealler (henüz yapılmadı)

- Ayrı PB instance (port 8094'te ikinci PB)
- Kendi domain'i (staging.gydgrup.com.tr)
- Test verisi otomatik seed
- Pre-prod ortamında Vite preview server (`npm run preview`)

## İlgili dosyalar

- `scripts/deploy-staging.sh` — staging build + rsync
- `vite.config.ts` — `VITE_STAGING=1` build modunda banner inject
- `/etc/nginx/snippets/gyd-staging.conf` — nginx location alias
