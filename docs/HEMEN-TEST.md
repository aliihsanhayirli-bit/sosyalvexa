# Hemen Test Rehberi — PocketBase + Admin + RAG

> 1 saat içinde çalışır demo. Bu dosyayı takip et, sonra docs/ROADMAP'a dön.

---

## 1. PocketBase admin hesabı oluştur

```bash
cd /root/gyd/gyd/backend
./pocketbase admin create admin@gydgrup.com.tr 'GucluSifre2026!'
# Eğer zaten hesap varsa "account already exists" der, mevcut şifreyle giriş yap.
```

---

## 2. PocketBase'i başlat (migration'lar otomatik uygulanır)

```bash
cd /root/gyd/gyd/backend
./pocketbase serve
# → http://127.0.0.1:8090/_/  (Admin UI)
# → http://127.0.0.1:8090/api/ (REST API)
# Migration'lar otomatik uygulanır:
#   ✓ 1700000009_create_settings  (Settings.tsx artık çalışır)
#   ✓ 1700000010_relax_bot_documents_rules  (RAG public okuma aktif)
#   ✓ 1700000012_create_regions  (9 bölge seed)
# Log'da "Successfully applied migration" mesajlarını gör.
```

---

## 3. Vite dev server (ayrı terminal)

```bash
cd /root/gyd/gyd
npm run dev
# → http://localhost:5173
# → http://localhost:5173/admin
```

---

## 4. Admin'e giriş

`http://localhost:5173/admin/login`
- E-posta: `admin@gydgrup.com.tr`
- Şifre: `GucluSifre2026!`

---

## 5. İlk 9 Ankara arsası (PocketBase admin UI'dan ekle)

`http://127.0.0.1:8090/_/` → Collections → **listings** → **New record**

Aşağıdaki kayıtları bölgelere dağıtılmış şekilde ekle (veya `pb_data/seed/listings.json` dosyasını import et — Collections → listings → Import).

| # | title | slug | region | area_m2 | price | currency | imar_status | tapu_status | status | published |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Çankaya Kızılay 450 m² Konut İmarlı | cankaya-kizilay-450 | cankaya | 450 | 4500000 | TRY | Konut İmarlı (%30) | Tapu Hazır | available | true |
| 2 | Çankaya Çukurambar 800 m² Karma İmarlı | cankaya-cukurambar-800 | cankaya | 800 | 9600000 | TRY | Karma İmarlı (%40) | Tapu Hazır | available | true |
| 3 | Etimesgut Bağlıca 600 m² Konut İmarlı | etimesgut-baglica-600 | etimesgut | 600 | 3600000 | TRY | Konut İmarlı (%25) | Tapu Hazır | available | true |
| 4 | Mamak Akdere 1000 m² Yatırımlık | mamak-akdere-1000 | mamak | 1000 | 3200000 | TRY | Konut İmarlı (%20) | Tapu Hazır | available | true |
| 5 | Yenimahalle Demetevler 350 m² Köşe | yenimahalle-demetevler-350 | yenimahalle | 350 | 2100000 | TRY | Konut İmarlı (%25) | Tapu Hazır | available | true |
| 6 | Sincan Fatih 1200 m² Konut İmarlı | sincan-fatih-1200 | sincan | 1200 | 4200000 | TRY | Konut İmarlı (%20) | İpotekli | reserved | true |
| 7 | Pursaklar Saray 700 m² Konut İmarlı | pursaklar-saray-700 | pursaklar | 700 | 2450000 | TRY | Konut İmarlı (%20) | Tapu Hazır | available | true |
| 8 | Altındağ Aydınlıkevler 500 m² Karma | altindag-aydinlikevler-500 | altindag | 500 | 1800000 | TRY | Karma İmarlı (%30) | Tapu Hazır | available | true |
| 9 | Polatlı Yeni Mahalle 2000 m² Yatırımlık | polatli-yeni-mahalle-2000 | polatli | 2000 | 5400000 | TRY | Konut İmarlı (%15) | Tapu Hazır | available | true |

> **Alanlar:** title, slug, description, region (slug), area_m2 (number), price (number), currency ("TRY"), imar_status, tapu_status, status (available/reserved/sold), published (bool).

Örnek description (1. arsa için):
> "Çankaya Kızılay merkezde, metro ve ana caddeye 3 dakika mesafede, %30 imarlı, altyapısı (yol, su, elektrik, doğalgaz) hazır, köşe parsel. Yatırıma veya kendi evinizi yapmaya uygun. **Sadece imarlı arsa** — GYD Grup güvencesiyle."

---

## 6. İlk 2 RAG dokümanı (Bot bilgi tabanı)

> ⚠️ Eski YCA RAG dokümanları Temelli özelinde; GYD için Ankara geneli + imarlı arsa odaklı yeniden yazılacak. Aşağıdaki 2 doküman starter olarak kullanılabilir.

`/admin/bot` → **Doküman Yükle** → aşağıdaki metinleri `.md` veya `.txt` olarak kaydet, yükle.

### 📄 6.1 `ankara-imarli-arsa-rehberi.md`

```markdown
# Ankara Geneli İmarlı Arsa Rehberi (GYD Grup)

Ankara'nın tüm merkez ilçelerinde (Çankaya, Etimesgut, Mamak, Altındağ, Yenimahalle, Keçiören, Sincan, Pursaklar, Polatlı) imarlı arsa almak isteyenler için kapsamlı rehber. **GYD Grup sadece imarlı arsa** ile ilgilenir; imarsız, hisseli, tapuya hazır olmayan arsalar için uygun şekilde yönlendirme yaparız.

## İmar Durumu Kategorileri

### Konut İmarlı Parseller (TAKS %20-30, KAKS %1.0-1.5)
Ankara merkez ilçelerin tamamında yaygın. 3-5 kata kadar konut inşa edilebilir. Altyapı (yol, su, elektrik, kanalizasyon, doğalgaz) genellikle hazır. Yatırım için en cazip kategoridir.

### Karma İmarlı Parseller (Alt Zemin Ticaret + Üst Konut)
Genellikle ana cadde üzerinde. Zemin katta mağaza/ofis, üst katlarda konut. Yatırım getirisi yüksek, ama yatırım süresi daha uzundur.

### Ticari İmarlı Parseller
Ankara'nın ana caddeleri (Kızılay, Çukurambar, Bahçelievler, Tunalı) üzerinde sınırlı sayıda parsel ticari imara açıktır. Fiyatlar konut imarına göre %50-100 daha yüksektir.

### Tarla Vasıflı Parseller
İmara kapalı, sadece tarımsal amaçlı kullanılabilir. **GYD Grup tarla vasıflı arsalarla ilgilenmez.**

## İmar Süreci
1. Parsel sahibi veya alıcı belediyeye imar durumu başvurusu yapar
2. Belediye 15 iş günü içinde yanıt verir
3. İtiraz hakkı mevcuttur (30 gün)
4. İmar planı değişiklikleri yılda 2 kez (Nisan, Ekim) askıya çıkar

## Önemli Uyarılar
- İmarsız arsa kesinlikle alınmamalıdır
- İpotek, haciz, şerh gibi kısıtlamalar tapu müdürlüğünden kontrol edilmelidir
- "İmara açılacak" vaatlerine temkinli yaklaşılmalı, resmi belediye yazısı istenmelidir
```

### 📄 6.2 `tapu-surecleri-ve-vergiler.md`

```markdown
# Tapu İşlemleri ve Vergiler

GYD Grup olarak tüm müşterilerimizin tapu süreçlerinde yanındayız. Aşağıda bilmeniz gereken temel adımlar:

## Alım-Satım Süreci (Tipik 5-10 İş Günü)

1. **Sözleşme Öncesi**
   - Tapu müdürlüğünden "şerh, ipotek, haciz yoktur" belgesi alınır
   - Belediyeden güncel imar durumu yazısı alınır
   - Yapı kayıt belgesi (varsa) kontrol edilir

2. **Sözleşme Aşaması**
   - Alıcı ve satıcı arasında "Arsa Satış Vaadi Sözleşmesi" imzalanır
   - Genellikle %10 kaparo, kalan bakiye tapuda ödenir
   - Sözleşme noter onaylı olmalıdır

3. **Tapu Devri**
   - Her iki taraf (veya vekilleri) tapu müdürlüğüne gelir
   - Kimlik, vergi numarası, fotoğraf ibraz edilir
   - Tapu harcı peşin ödenir
   - Yeni tapu alıcı adına çıkarılır

## Vergi ve Masraflar (2026 Güncel)

| Kalem | Oran | Ödeyen |
|---|---|---|
| **Tapu Harcı** | %4 (alıcı) + %4 (satıcı) | Her iki taraf kendi payını |
| **KDV** | %0 (konut imarlı arsa) | Muaf |
| **Emlak Vergisi** | %0.1-0.3 (yıllık) | Tapu sahibi |
| **Değer Artış Payı** | Satış fiyatı - alış fiyatı (5 yıl içinde satılırsa) | Satıcı (stopaj) |
| **Danışman Komisyonu** | %2-3 | Genellikle alıcı |

## Önemli Belgeler (Her Zaman İstenmeli)

- ✅ Tapu müdürlüğü "şerh/ipotek/haciz yoktur" belgesi
- ✅ Belediye imar durumu yazısı
- ✅ Kadastro paftası
- ✅ 1/1000 ölçekli imar planı paftası
- ✅ Yapı kayıt belgesi (üzerinde yapı varsa)
- ✅ Çap belgesi (sınır tespiti)
- ✅ Vekaletname (temsilci varsa)

## Sık Yapılan Hatalar

1. ❌ İmara kapalı arsa almak
2. ❌ İpotekli/hacizli tapu devralmak
3. ❌ Sözleşmesiz kaparo vermek
4. ❌ Komşu parsel ile sınır ihtilafı yaşamak (çap belgesi ile önlenir)
5. ❌ Değer artış payı stopajını hesaplamamak

## GYD Desteği

Tüm bu süreçleri sizin adınıza takip ediyoruz. Sözleşme öncesi kontrolden tapu devrine kadar her aşamada yanınıdayız. **Ücretsiz ön danışmanlık için:** 0532 489 25 67
```

Yükleme sonrası: her dosya için "X parça embed edildi" toast'u çıkmalı. ~800 karakterlik chunk'lara bölünür, Gemini `gemini-embedding-001` ile vektörleştirilir.

---

## 7. Canlı test senaryosu

### ✅ Adım 1: Sitesi aç
`http://localhost:5173/`
- 3D harita yüklensin (Ankara topografik)
- 9 arsa portföyde görünsün (`/arsalar`)
- 9 bölge listesi (`/bolgeler`)

### ✅ Adım 2: Chat widget testi (RAG'sız)
- Sağ alt köşedeki chat balonuna tıkla
- "Merhaba" yaz → "Merhaba! İmarlı arsa almak mı, satmak mı, yoksa yatırım danışmanlığı mı istiyorsunuz?" al (intent: general)
- "Arsa almak istiyorum" yaz → "Bütçeniz ne kadar?" (intent: buyer)

### ✅ Adım 3: Chat RAG testi (yüklenen dokümanlarla)
- "Çankaya'da imar durumu nasıl?" yaz
- Cevap **imar dokümanından** parça içermeli (system prompt'a `[ankara-imarli-arsa-rehberi]` inject edilir)
- Network sekmesinde `/api/chat` response'unda `ragUsed: true` gör

### ✅ Adım 4: Bot ayarları
- `/admin/bot`
- System prompt, hoşgeldin mesajı, model adı düzenle → Kaydet
- Test konsolunda "Tapu süreci nasıl işler?" yaz → RAG cevabı + "Danışman görüşmesi" önerisi

### ✅ Adım 5: Settings sayfası
- `/admin/ayarlar`
- Firma bilgileri, telefon, WhatsApp numarası düzenle
- Entegrasyon durumları: PocketBase ✅, Gemini ✅, Meta ⏳ (token yok)

### ✅ Adım 6: Dashboard
- `/admin`
- 4 KPI kartı (PocketBase'ten canlı count): 9 arsa, 0 kişi, 0 konuşma, %24 dönüşüm (hardcoded)
- Trafik grafiği (mock data, gerçek analytics değil)
- Son lead'ler listesi (mock isimler — Ahmet Yılmaz vs.)

### ✅ Adım 7: Lead testi (PocketBase → Site iletişim formu)
- `/iletisim` formu doldur, gönder
- PocketBase admin UI → `contact_submissions` collection'ında kayıt gör
- Veya `/admin/kisiler` → yeni kişi oluştur (Kanban'a düşer)

### ✅ Adım 8: Mobil uyumluluk
- Chrome DevTools → responsive mode → iPhone
- 3D hero mobile fallback, hamburger menü, chat balonu

---

## 8. Yapılması gerekenler (test sonrası)

Eğer her şey çalışıyorsa:

1. **Gemini key client'tan kaldır** (`Bot.tsx:70`) — güvenlik
2. **PB_ENCRYPTION_KEY rotate** — git history temizle
3. **Meta WhatsApp/Messenger/IG bağla** — gerçek müşteri mesajları
4. **Meta OAuth2 flow tamamla** — Facebook + Instagram
5. **Production deploy** — Vercel + Oracle Cloud (docs/DEPLOY.md)
6. **Backup stratejisi** — `pb_data/data.db` günlük snapshot

---

## 9. Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|---|---|
| "admin already exists" | Mevcut şifreyle giriş yap, yeni hesap gerekmiyor |
| "failed to connect to PocketBase" | PB çalışıyor mu? `curl http://127.0.0.1:8090/api/health` |
| Migration uygulanmadı | PB'yi durdur, `./pocketbase serve` ile yeniden başlat, log'u kontrol et |
| "API Key Eksik" badge | `.env`'de `VITE_GEMINI_API_KEY` ve `GEMINI_API_KEY` dolu mu? |
| RAG cevap gelmiyor | `bot_documents.chunks` dolu mu? `/api/rag/embed` hata log'u (PB log'da) |
| 3D sahne yüklenmiyor | WebGL destekli tarayıcı, GPU acceleration açık |
| `/api/chat` 500 | PB'ye `VITE_POCKETBASE_URL` ile erişilebiliyor mu? |
| "YCA kalıntısı görüyorum" | Yanlış proje klasöründe çalışıyorsun. GYD: `/root/gyd/gyd`. YCA ayrı proje. |

---

## 10. Kontrol listesi (checklist)

Canlı demoya başlamadan önce:

- [ ] PB admin hesabı oluşturuldu
- [ ] PB serve çalışıyor, `/api/health` 200
- [ ] Vite dev çalışıyor, port 5173 açık
- [ ] Admin login başarılı
- [ ] 9 arsa eklendi, `/arsalar` listede görünüyor
- [ ] 2 RAG dokümanı yüklendi, chunk_count > 0
- [ ] Site chat'ten "Ankara imar" sorusuna RAG cevabı geldi
- [ ] `/admin/ayarlar` açıldı, firma bilgileri kaydedildi
- [ ] (Opsiyonel) Mobil görünüm test edildi

Tamamlandığında → docs/ROADMAP'a dön, sıradaki gruba geç (🟡 Kısa vade).
