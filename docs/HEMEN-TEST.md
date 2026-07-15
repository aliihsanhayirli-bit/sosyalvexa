# Hemen Test Rehberi — PocketBase + Admin + RAG

> 1 saat içinde çalışır demo. Bu dosyayı takip et, sonra docs/ROADMAP'a dön.

---

## 1. PocketBase admin hesabı oluştur

```bash
cd /root/yca/backend
./pocketbase admin create admin@ycayatirim.com.tr 'GucluSifre123!'
# Eğer zaten hesap varsa "account already exists" der, mevcut şifreyle giriş yap.
```

---

## 2. PocketBase'i başlat (migration'lar otomatik uygulanır)

```bash
cd /root/yca/backend
./pocketbase serve
# → http://127.0.0.1:8090/_/  (Admin UI)
# → http://127.0.0.1:8090/api/ (REST API)
# Migration'lar otomatik uygulanır:
#   ✓ 1700000009_create_settings  (Settings.tsx artık çalışır)
#   ✓ 1700000010_relax_bot_documents_rules  (RAG public okuma aktif)
# Log'da "Successfully applied migration" mesajlarını gör.
```

---

## 3. Vite dev server (ayrı terminal)

```bash
cd /root/yca
npm run dev
# → http://localhost:5173
# → http://localhost:5173/admin
```

---

## 4. Admin'e giriş

`http://localhost:5173/admin/login`
- E-posta: `admin@ycayatirim.com.tr`
- Şifre: `GucluSifre123!`

---

## 5. İlk 5 Temelli arsası (PocketBase admin UI'dan ekle)

`http://127.0.0.1:8090/_/` → Collections → **listings** → **New record**

Aşağıdaki 5 kaydı sırayla ekle (veya `pb_data/seed/listings.json` dosyasını import et — Collections → listings → Import).

| # | title | slug | region | area_m2 | price | currency | imar_status | tapu_status | status | published |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Temelli Merkez 500 m² Arsa | temelli-merkez-500 | temelli | 500 | 2500000 | TRY | Konut İmarlı (%25) | Tapu Hazır | available | true |
| 2 | Temelli Kuzey 1200 m² Yatırımlık | temelli-kuzey-1200 | temelli | 1200 | 4800000 | TRY | Konut İmarlı (%15) | Tapu Hazır | available | true |
| 3 | Temelli Güney 800 m² Tarla | temelli-guney-800 | temelli | 800 | 1800000 | TRY | Tarla | Tapu Hazır | available | true |
| 4 | Sincan Temelli Sınırı 2000 m² | sincan-temelli-2000 | sincan | 2000 | 7500000 | TRY | Konut İmarlı (%30) | İpotekli | reserved | true |
| 5 | Temelli Doğu 350 m² Köşe Parsel | temelli-dogu-350 | temelli | 350 | 1750000 | TRY | Konut İmarlı (%25) | Tapu Hazır | available | true |

> **Alanlar:** title, slug, description, region (slug), area_m2 (number), price (number), currency ("TRY"), imar_status, tapu_status, status (available/reserved/sold), published (bool).

Örnek description (1. arsa için):
> "Temelli merkezde, okula ve ana caddeye 5 dakika mesafede, %25 imarlı, altyapısı (yol, su, elektrik) hazır, köşe parsel. Yatırıma veya kendi evinizi yapmaya uygun."

---

## 6. İlk 3 RAG dokümanı (Bot bilgi tabanı)

`/admin/bot` → **Doküman Yükle** → aşağıdaki metinleri `.md` veya `.txt` olarak kaydet, yükle.

### 📄 6.1 `temelli-imar-durumu.md`

```markdown
# Temelli Bölgesi İmar Durumu

Temelli, Ankara'nın batısında, Polatlı sınırında yer alan gelişmekte olan bir bölgedir. Bölgenin imar durumu parsel bazında değişir ve aşağıdaki kategorilere ayrılır:

## Konut İmarlı Parseller (TAKS %25, KAKS %1.5)
Temelli merkez ve kuzey bölgelerinde yoğunlaşır. Bu parseller yapılaşmaya açıktır, 3 kata kadar konut veya ticari alan inşa edilebilir. Altyapı (yol, su, elektrik, kanalizasyon) genellikle hazırdır. Yatırım için en cazip kategoridir.

## Ticari İmarlı Parseller (Ana Cadde Üzeri)
Temelli merkez ana cadde (Ankara-Polatlı yolu) üzerinde sınırlı sayıda parsel ticari imara açıktır. Bu parseller mağaza, ofis, akaryakıt istasyonu gibi amaçlarla kullanılabilir. Fiyatlar konut imarına göre %30-50 daha yüksektir.

## Tarla Vasıflı Parseller
Güney ve doğu bölgelerinde yaygın. İmara kapalı, sadece tarımsal amaçlı kullanılabilir. Fiyatlar konut imarına göre %40-60 daha düşüktür. Yatırımcılar için orta-uzun vadede imar planı değişikliği beklentisiyle stratejik bir seçenektir.

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

YCA Yatırım olarak tüm müşterilerimizin tapu süreçlerinde yanındayız. Aşağıda bilmeniz gereken temel adımlar:

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

## Vergi ve Masraflar (2024 Güncel)

| Kalem | Oran | Ödeyen |
|---|---|---|
| **Tapu Harcı** | %4 (alıcı) + %4 (satıcı) | Her iki taraf kendi payını |
| **KDV** | %0 (konut imarlı arsa) | Muaf |
| **Emlak Vergisi** | %0.1-0.3 (yıllık) | Tapu sahibi |
| **Değer Artış Payı** | Satış fiyatı - alış fiyatı (eğer 5 yıl içinde satılırsa) | Satıcı (stopaj) |
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

## YCA Desteği

Tüm bu süreçleri sizin adınıza takip ediyoruz. Sözleşme öncesi kontrolden tapu devrine kadar her aşamada yanınızdayız. **Ücretsiz ön danışmanlık için:** 0545 655 10 70
```

### 📄 6.3 `yatirim-analizi-ve-getiri.md`

```markdown
# Temelli Bölgesi Yatırım Analizi

Son 5 yıllık verilere göre Temelli bölgesi, Ankara'nın en hızlı değer kazanan arsa bölgelerinden biridir. Bu rapor, yatırımcılarımız için hazırlanmıştır.

## Tarihsel Değer Artışı (2020-2024)

| Yıl | Konut İmarlı m² Fiyatı | Yıllık Artış |
|---|---|---|
| 2020 | 1.800 TL | — |
| 2021 | 2.400 TL | %33 |
| 2022 | 3.500 TL | %46 |
| 2023 | 5.200 TL | %49 |
| 2024 | 6.800 TL | %31 |

**5 yıllık kümülatif artış: %278** (konut imarlı, ortalama)

## Temelli'yi Cazip Kılan Faktörler

### 1. Konum Avantajı
- Ankara merkezine 45 km, Polatlı'ya 25 km
- Ankara-İstanbul yüksek hızlı tren hattına 8 km mesafede (YHT istasyonu planlanıyor)
- TEM otoyoluna direkt bağlantı

### 2. Altyapı Yatırımları (Devam Eden / Planlanan)
- YHT istasyonu projesi (2026 hedefli)
- Yeni sanayi bölgesi (Toplu Konut İdaresi projesi)
- 3. havalimanı bağlantı yolu planlaması
- Doğalgaz altyapısı 2024 tamamlandı

### 3. OSB ve Sanayi Yakınlığı
- Sincan Organize Sanayi Bölgesi 12 km
- OSTİM 35 km
- Yeni sanayi bölgesi planlaması içinde

## Yatırım Stratejileri

### Kısa Vade (0-2 yıl) — Al-Sat
- İmara açık, altyapısı hazır parsellerde
- Hedef: %30-50 değer artışı
- Risk: Orta (piyasa dalgalanması)

### Orta Vade (2-5 yıl) — Geliştirme
- YHT istasyonu yakınındaki parseller
- Hedef: %80-120 toplam getiri
- Risk: Düşük (altyapı tamamlandıkça)

### Uzun Vade (5+ yıl) — Portföy
- Sanayi bölgesi yakını, tarla vasıflı parseller
- İmar değişikliği beklentisi
- Hedef: %200-400 toplam getiri
- Risk: Düşük (uzun vadede imar artışı)

## Dikkat Edilmesi Gerekenler

1. **Lokasyon seçimi** — YHT istasyonu, ana cadde, OSB yakınlığı kritik
2. **İmar durumu** — Kesinlikle imara açık olmalı
3. **Tapu temizliği** — İpotek, haciz, şerh olmamalı
4. **Altyapı durumu** — Yol, su, elektrik, doğalgaz mevcut mu?
5. **Komşu parseller** — Gelişme potansiyeli olan bölgeler tercih edilmeli

## Vergi Optimizasyonu

- 5 yıldan önce satışta **değer artış payı stopajı** ödenir (%15-40)
- 5 yıl sonra satışta stopaj yok
- Emlak vergisi yıllık ödenir, düşük tutarlıdır
- Yatırım amaçlı alımlarda **KDV muafiyeti** vardır
```

Yükleme sonrası: her dosya için "X parça embed edildi" toast'u çıkmalı. ~800 karakterlik chunk'lara bölünür, Gemini `text-embedding-004` ile vektörleştirilir.

---

## 7. Canlı test senaryosu

### ✅ Adım 1: Sitesi aç
`http://localhost:5173/`
- 3D harita yüklensin (Temelli topografik)
- 5 arsa portföyde görünsün (`/arsalar`)
- 6 bölge listesi (`/bolgeler`)

### ✅ Adım 2: Chat widget testi (RAG'sız)
- Sağ alt köşedeki chat balonuna tıkla
- "Merhaba" yaz → "Merhaba! Arsa almak mı, satmak mı istiyorsunuz?" al (intent: general)
- "Arsa almak istiyorum" yaz → "Bütçeniz ne kadar?" (intent: buyer)

### ✅ Adım 3: Chat RAG testi (yüklenen dokümanlarla)
- "Temelli'de imar durumu nasıl?" yaz
- Cevap **imar dokümanından** parça içermeli (system prompt'a `[temelli-imar-durumu]` inject edilir)
- Network sekmesinde `/api/chat` response'unda `ragUsed: true` gör

### ✅ Adım 4: Bot ayarları
- `/admin/bot`
- System prompt, hoşgeldin mesajı, model adı düzenle → Kaydet
- Test konsolunda "Tapu süreci nasıl işler?" yaz → RAG cevabı + "Danışman görüşmesi" önerisi

### ✅ Adım 5: Settings sayfası (artık çalışmalı)
- `/admin/ayarlar`
- Firma bilgileri, telefon, WhatsApp numarası düzenle
- Entegrasyon durumları: PocketBase ✅, Gemini ✅, Meta ⏳ (token yok)

### ✅ Adım 6: Dashboard
- `/admin`
- 4 KPI kartı (PocketBase'ten canlı count): 5 arsa, 0 kişi, 0 konuşma, %24 dönüşüm (hardcoded)
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
4. **Zernio OAuth flow tamamla** — WhatsApp Business hesabı
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

---

## 10. Kontrol listesi (checklist)

Canlı demoya başlamadan önce:

- [ ] PB admin hesabı oluşturuldu
- [ ] PB serve çalışıyor, `/api/health` 200
- [ ] Vite dev çalışıyor, port 5173 açık
- [ ] Admin login başarılı
- [ ] 5 arsa eklendi, `/arsalar` listede görünüyor
- [ ] 3 RAG dokümanı yüklendi, chunk_count > 0
- [ ] Site chat'ten "Temelli imar" sorusuna RAG cevabı geldi
- [ ] `/admin/ayarlar` açıldı, firma bilgileri kaydedildi
- [ ] (Opsiyonel) Mobil görünüm test edildi

Tamamlandığında → docs/ROADMAP'a dön, sıradaki gruba geç (🟡 Kısa vade).
