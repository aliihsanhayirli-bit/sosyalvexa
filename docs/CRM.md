# CRM Kullanım Kılavuzu

GYD CRM, **4 kanaldan** (Web, WhatsApp, Facebook Messenger, Instagram) gelen müşterileri tek yerde toplar. Alıcı/satıcı ayrımı, durum pipeline'ı ve tam konuşma geçmişi sunar.

Şirket: **GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ.** · Telefon: **+90 532 489 25 67** · info@gydgrup.com.tr

---

## Kanban Görünümü

7 sütun, soldan sağa pipeline:

| Sütun | Anlam | Aksiyon |
|---|---|---|
| 🆕 Yeni | İlk temas kurulmuş, yanıt bekleniyor | İlk mesajı gönder, 24 saat içinde ara |
| 📞 İletişimde | Müşteriyle konuşuluyor | Bütçe/bölge sor, portföy öner |
| ⭐ Nitelikli | Bütçe + bölge net | Yer gösterme randevusu al |
| 📅 Yer Görüşmesi | Randevu alındı | Arsa fotoğraflarını gönder, saha hazırlığı |
| 💰 Teklif | Fiyat müzakeresi | Tapu sorgusu, ekspertiz |
| ✅ Kazanıldı | Satış tamamlandı | Tapu devri, teşekkür, referans iste |
| ❌ Kaybedildi | Satış olmadı | 3 ay sonra yeniden iletişim kur |

**Drag & drop** ile durum değiştirin, otomatik timeline'a kayıt düşer.

---

## Kişi Kartı

`/admin/kisiler/[id]` adresinde:

### Sol Panel — Profil
- Avatar, ad, telefon, e-posta
- Alıcı/Satıcı/Yatırımcı rozeti
- Etiketler
- Bütçe aralığı
- Hızlı işlemler: **Ara** · **WhatsApp** (`+90 532 489 25 67` template) · **E-posta**

### Sol Panel — Konuşma
Tüm kanal mesajları kronolojik. Bot / Müşteri / Danışman renklerle ayrılır.

**Mesaj gönder:**
- Yaz + Enter veya gönder butonu
- 📷 Konum fotoğrafı: buton → çoklu dosya seç → gönder
- 🏠 Arsa paylaşımı: listeden arsa seç → link WhatsApp'tan gönder

### Sağ Panel — Timeline
Tüm olaylar kronolojik:
- 💬 Mesaj (gönderilen/alınan)
- ✅ Durum değişikliği
- 📝 Not (danışman tarafından)
- 🖼️ Fotoğraf gönderimi
- 🏠 Arsa paylaşımı
- 👤 Kişi oluşturuldu

---

## Lead Oluşturma (Otomatik)

### Web Chat'ten
1. Müşteri sitede "Arsa almak istiyorum" yazar
2. Bot ilk selamdan sonra `contacts` tablosuna yeni kayıt açar
3. Tip (buyer/seller) intent'e göre
4. Source: `web`
5. Status: `new`
6. **Timeline'a "Kişi oluşturuldu" + "Müşteri mesajı" event'leri düşer** (PocketBase hook)

### WhatsApp'tan
1. Müşteri **+90 532 489 25 67**'ye yazar
2. Meta webhook → `gyd-api` → PocketBase
3. `external_id` (whatsapp ID) ile duplicate kontrol
4. İlk mesajsa yeni contact, sonraki mesajlarda mevcut conversation'a ekle

### Facebook / Instagram'dan
Aynı akış, `source` alanı `messenger` veya `instagram`.

### İletişim formundan
- `/iletisim` form submit → `contact_submissions` tablosu
- Admin `/admin/konusalar` veya `/admin/kisiler`'dan takip eder

---

## Raporlar (Dashboard)

`/admin` ana sayfasında:
- Aktif arsa sayısı
- Toplam lead
- Açık konuşma
- Dönüşüm oranı
- Ziyaret/mesaj trendi (14 gün)
- Kanal dağılımı (web / whatsapp / messenger / instagram)
- Pipeline bar chart (hangi aşamada kaç kişi var)
- Son 5 lead listesi

---

## Çoklu Danışman Kullanımü

Her lead `assigned_to` alanı ile bir danışmana atanabilir:
- Admin tüm lead'leri görür
- Danışman sadece kendi lead'lerini görür (PocketBase rule)
- "Ata" butonu ile yeniden atama

---

## Veri Saklama & KVKK

- Tüm kişisel veriler PocketBase SQLite'ta
- Log'lar 2 yıl saklanır
- Müşteri "verilerimi sil" derse → admin panelden soft-delete
- KVKK uyumlu data export mümkün

---

## Sık Yapılan İşlemler

| Yapmak istediğin | Adımlar |
|---|---|
| Yeni müşteri ekle | `/admin/kisiler` → "+ Yeni Kişi" |
| WhatsApp'tan yazdı | `/admin/konusalar` → aç → "Devral" → yanıtla |
| Arsa paylaş | Kişi kartı → "Arsa Öner" → listeden seç → link WhatsApp'tan gönder |
| Fotoğraf gönder | Kişi kartı → sohbet → 📷 → çoklu seç |
| Durum değiştir | Kanban'da sürükle-bırak veya kişi kartında dropdown |
| Toplu mesaj | `/admin/bot` → "Yayın" ile tüm aktif sohbetlere (yakında) |
