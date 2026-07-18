#!/usr/bin/env node
// GYD Grup — production seed (idempotent)
//   • Admin credentials: PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD env (or PB env file)
//   • Schema fix: regions.stats/highlights JSON maxSize 0 → 10000 (PB 0.22 default bug)
//   • 9 bölge (Çankaya, Etimesgut, Mamak, Altındağ, Yenimahalle, Keçiören, Sincan, Pursaklar, Polatlı)
//   • 9 örnek arsa (3 featured, 6 normal)
//   • 2 RAG dokümanı (Ankara geneli + Tapu süreçleri)
//   • Default bot_settings
// Tüm create'ler idempotent: varsa atlar, hata varsa loglar.
// RAG embedding tetiklemez (admin panelden veya /api/rag/embed ile ayrıca).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Config ─────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const PB_URL = (process.env.PB_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || process.env.VITE_POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || process.env.VITE_POCKETBASE_ADMIN_PASSWORD;
const DRY_RUN = process.env.SEED_DRY_RUN === '1';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('✗ PB_ADMIN_EMAIL ve PB_ADMIN_ENV gerekli (.env veya env var)');
  process.exit(1);
}

// ── API helper ─────────────────────────────────────────
async function api(method, path, body, token) {
  const res = await fetch(`${PB_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return data;
}

const isUniqueErr = (e) =>
  e.message.includes('UNIQUE') ||
  e.message.includes('must be unique') ||
  e.message.includes('idx_regions_slug');

// ── Schema fix: regions JSON maxSize ──────────────────
async function fixRegionsSchema(TOKEN) {
  const col = await api('GET', '/api/collections/regions', null, TOKEN);
  let dirty = false;
  for (const f of col.schema) {
    if ((f.name === 'stats' || f.name === 'highlights') && (f.options?.maxSize ?? 0) === 0) {
      f.options = { ...(f.options || {}), maxSize: 10000 };
      dirty = true;
    }
  }
  if (!dirty) return false;
  if (DRY_RUN) { console.log('  → [dry-run] regions schema PATCH atlanır'); return true; }
  await api('PATCH', '/api/collections/regions', col, TOKEN);
  console.log('  ✓ regions.stats/highlights maxSize 0 → 10000 düzeltildi');
  return true;
}

// ── Idempotent create ─────────────────────────────────
async function upsert(coll, key, record, TOKEN) {
  const filter = `${key}="${String(record[key]).replace(/"/g, '\\"')}"`;
  const existing = await api('GET', `/api/collections/${coll}/records?filter=${encodeURIComponent(filter)}&perPage=1`, null, TOKEN);
  if (existing.items.length > 0) {
    return { status: 'skipped', id: existing.items[0].id };
  }
  if (DRY_RUN) return { status: 'would-create' };
  try {
    const res = await api('POST', `/api/collections/${coll}/records`, record, TOKEN);
    return { status: 'created', id: res.id };
  } catch (e) {
    if (isUniqueErr(e)) return { status: 'skipped' };
    throw e;
  }
}

// ── Seed data ─────────────────────────────────────────
const REGIONS = [
  { slug: 'cankaya', name: 'Çankaya', district: 'Çankaya', highlight: true,
    description: "Ankara'nın merkez ilçesi; Kızılay, Çukurambar, Bahçelievler, Tunalı gibi prestijli bölgeleri kapsar. Metro ve ana ulaşım ağına yakın, %20-40 imar oranlarına sahip, kurumsal ve bireysel yatırımcılar için en likit pazar.",
    stats: [{ value: '%38', label: '5 yıllık değer artışı' }, { value: '₺9.5K', label: 'Ortalama m² fiyatı' }, { value: '210+', label: 'Aktif ilan' }],
    highlights: ['Metro & otobüs ağı', 'İmara açık parseller', 'Kurumsal kiracı havuzu', 'Prestijli adresler'] },
  { slug: 'etimesgut', name: 'Etimesgut', district: 'Etimesgut', highlight: true,
    description: "Bağlıca, Eryaman, Göksu gibi gelişmekte olan konut bölgeleriyle dikkat çeker. %20-30 imar oranları, yeni açılan metro hattı ve yüksek kira getirisi ile yatırımcıların gözdesi.",
    stats: [{ value: '%42', label: '5 yıllık değer artışı' }, { value: '₺6.2K', label: 'Ortalama m² fiyatı' }, { value: '180+', label: 'Aktif ilan' }],
    highlights: ['Yeni metro hattı', 'Aile dostu projeler', 'Yüksek kira getirisi', 'Altyapı hazır'] },
  { slug: 'mamak', name: 'Mamak', district: 'Mamak',
    description: "Ankara'nın doğusunda yer alan, son yıllarda kentsel dönüşüm projeleriyle öne çıkan ilçe. Akdere, Hüseyin Gazi, Tuzluçayır gibi bölgelerde imara açık arsalar mevcut.",
    stats: [{ value: '%28', label: '5 yıllık değer artışı' }, { value: '₺4.8K', label: 'Ortalama m² fiyatı' }, { value: '90+', label: 'Aktif ilan' }],
    highlights: ['Kentsel dönüşüm', 'Uygun fiyat', 'Orta vadeli getiri'] },
  { slug: 'altindag', name: 'Altındağ', district: 'Altındağ',
    description: "Ankara'nın tarihi merkezi. Aydınlıkevler, Ulus, Hamamönü gibi bölgelerde karma imarlı arsalar bulunur. Hem konut hem ticari kullanıma uygun, düşük giriş maliyetli yatırım fırsatları.",
    stats: [{ value: '%24', label: '5 yıllık değer artışı' }, { value: '₺4.1K', label: 'Ortalama m² fiyatı' }, { value: '70+', label: 'Aktif ilan' }],
    highlights: ['Tarihi merkez', 'Karma imar', 'Düşük giriş'] },
  { slug: 'yenimahalle', name: 'Yenimahalle', district: 'Yenimahalle',
    description: 'Demetevler, Batıkent, Çayyolu gibi düzenli yapılaşmış bölgeleri kapsar. Konut imarı ağırlıklı, orta-üst segment yatırımlar için ideal.',
    stats: [{ value: '%31', label: '5 yıllık değer artışı' }, { value: '₺5.4K', label: 'Ortalama m² fiyatı' }, { value: '120+', label: 'Aktif ilan' }],
    highlights: ['Düzenli yapılaşma', 'Konut ağırlıklı', 'Orta segment'] },
  { slug: 'kecioren', name: 'Keçiören', district: 'Keçiören',
    description: "Ankara'nın kuzeybatısında, Keçiören merkez ve çevresinde %20-25 imar oranlarına sahip, ulaşım ağına yakın, aile yerleşimi için uygun bölgeler.",
    stats: [{ value: '%22', label: '5 yıllık değer artışı' }, { value: '₺3.9K', label: 'Ortalama m² fiyatı' }, { value: '85+', label: 'Aktif ilan' }],
    highlights: ['Aile yerleşimi', 'Ulaşım ağı', 'Uygun fiyat'] },
  { slug: 'sincan', name: 'Sincan', district: 'Sincan', highlight: true,
    description: "Ankara'nın batı kapısı. Sincan merkez ve Temelli sınırında organize sanayi bölgesine yakın, yüksek hızlı tren istasyonu planlanan, orta-uzun vadede yüksek getiri potansiyeli taşıyan arsalar.",
    stats: [{ value: '%52', label: '5 yıllık değer artışı' }, { value: '₺3.5K', label: 'Ortalama m² fiyatı' }, { value: '140+', label: 'Aktif ilan' }],
    highlights: ['OSB yakın', 'YHT planı', 'Yüksek getiri', 'Sanayi yatırımı'] },
  { slug: 'pursaklar', name: 'Pursaklar', district: 'Pursaklar',
    description: "Ankara'nın kuzeyinde küçük ama gelişmekte olan bir ilçe. Düşük yoğunluklu konut imarı, uygun fiyatlarla uzun vadeli yatırım için ideal.",
    stats: [{ value: '%19', label: '5 yıllık değer artışı' }, { value: '₺3.2K', label: 'Ortalama m² fiyatı' }, { value: '45+', label: 'Aktif ilan' }],
    highlights: ['Düşük yoğunluk', 'Uygun giriş', 'Uzun vadeli yatırım'] },
  { slug: 'polatli', name: 'Polatlı', district: 'Polatlı',
    description: "Ankara'nın batısında, tarım ve hayvancılık merkezi. İmara açık arsalar sınırlı, ancak orta vadede değer artışı potansiyeli yüksek. OSB yakınlığı avantaj.",
    stats: [{ value: '%26', label: '5 yıllık değer artışı' }, { value: '₺2.7K', label: 'Ortalama m² fiyatı' }, { value: '60+', label: 'Aktif ilan' }],
    highlights: ['OSB yakın', 'Düşük m² fiyatı', 'Orta vadeli getiri'] },
];

const LISTINGS = [
  { title: 'Çankaya Kızılay 450 m² Konut İmarlı Arsa', slug: 'cankaya-kizilay-450',
    description: 'Çankaya Kızılay merkezde, metro ve ana caddeye 3 dakika mesafede, %30 imarlı, altyapısı (yol, su, elektrik, doğalgaz) hazır, köşe parsel. Yatırıma veya kendi evinizi yapmaya uygun. GYD Grup güvencesiyle.',
    price: 4500000, currency: 'TRY', area_m2: 450, region: 'cankaya', city: 'Ankara', neighborhood: 'Kızılay',
    imar_status: 'Konut İmarlı (TAKS %30, KAKS %1.5)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: true,
    features: ['Köşe parsel', 'Metro 3 dk', 'Doğalgaz var', 'Ana cadde cephesi'] },
  { title: 'Çankaya Çukurambar 800 m² Karma İmarlı', slug: 'cankaya-cukurambar-800',
    description: "Çukurambar'ın yükselen bölgesinde, ana cadde üzeri 800 m² karma imarlı arsa. Zemin kat ticari, üst kat konut olarak değerlendirilebilir. Yüksek yatırım getirisi.",
    price: 9600000, currency: 'TRY', area_m2: 800, region: 'cankaya', city: 'Ankara', neighborhood: 'Çukurambar',
    imar_status: 'Karma İmarlı (TAKS %40, KAKS %2.0)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: true,
    features: ['Ana cadde', 'Ticari+konut', 'Yüksek getiri', 'Yeni proje'] },
  { title: 'Etimesgut Bağlıca 600 m² Konut İmarlı', slug: 'etimesgut-baglica-600',
    description: "Bağlıca'nın gelişen bölgesinde, yeni açılan metro hattına 500 m mesafede, %25 imarlı, 3+1 villa yapımına uygun, altyapısı hazır parsel. Aile yerleşimi için ideal.",
    price: 3600000, currency: 'TRY', area_m2: 600, region: 'etimesgut', city: 'Ankara', neighborhood: 'Bağlıca',
    imar_status: 'Konut İmarlı (TAKS %25, KAKS %1.25)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: true,
    features: ['Metro 500m', 'Villa imarı', 'Aile yerleşimi', 'Site uyumu'] },
  { title: 'Mamak Akdere 1000 m² Yatırımlık', slug: 'mamak-akdere-1000',
    description: 'Akdere bölgesinde, kentsel dönüşüm bölgesi ilan edilen alanda 1000 m² %20 imarlı arsa. Orta vadede (3-5 yıl) değer artışı beklentisi yüksek.',
    price: 3200000, currency: 'TRY', area_m2: 1000, region: 'mamak', city: 'Ankara', neighborhood: 'Akdere',
    imar_status: 'Konut İmarlı (TAKS %20, KAKS %1.0)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: false,
    features: ['Kentsel dönüşüm', 'Yatırımlık', 'Orta vade', 'Büyük parsel'] },
  { title: 'Yenimahalle Demetevler 350 m² Köşe Parsel', slug: 'yenimahalle-demetevler-350',
    description: "Demetevler'in ana caddesinde, köşe başında 350 m² %25 imarlı, 2+1 veya 3+1 yapılaşmaya uygun küçük parsel. Hemen inşaata başlanabilir.",
    price: 2100000, currency: 'TRY', area_m2: 350, region: 'yenimahalle', city: 'Ankara', neighborhood: 'Demetevler',
    imar_status: 'Konut İmarlı (TAKS %25, KAKS %1.25)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: false,
    features: ['Köşe parsel', 'Hemen yapılaşma', 'Ana cadde', 'Küçük bütçe'] },
  { title: 'Sincan Fatih 1200 m² Konut İmarlı', slug: 'sincan-fatih-1200',
    description: "Sincan'ın hızla gelişen Fatih mahallesinde, OSB'ye 8 km mesafede, %20 imarlı büyük parsel. Site/toplanma imarı için uygun, orta-uzun vadeli yatırım.",
    price: 4200000, currency: 'TRY', area_m2: 1200, region: 'sincan', city: 'Ankara', neighborhood: 'Fatih',
    imar_status: 'Konut İmarlı (TAKS %20, KAKS %1.0)', tapu_status: 'İpotekli (çözülebilir)', status: 'reserved', published: true, featured: false,
    features: ['OSB yakın', 'Toplu yapı', 'Büyük parsel', 'Yatırımlık'] },
  { title: 'Pursaklar Saray 700 m² Konut İmarlı', slug: 'pursaklar-saray-700',
    description: 'Pursaklar Saray bölgesinde, düşük yoğunluklu villalar arasında 700 m² %20 imarlı arsa. Sessiz, huzurlu, doğayla iç içe yaşam için ideal.',
    price: 2450000, currency: 'TRY', area_m2: 700, region: 'pursaklar', city: 'Ankara', neighborhood: 'Saray',
    imar_status: 'Konut İmarlı (TAKS %20, KAKS %0.8)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: false,
    features: ['Düşük yoğunluk', 'Villa bölgesi', 'Huzurlu', 'Geniş parsel'] },
  { title: 'Altındağ Aydınlıkevler 500 m² Karma İmarlı', slug: 'altindag-aydinlikevler-500',
    description: "Aydınlıkevler'in ticaret aksında, zemin kat dükkan + üst kat konut yapımına uygun 500 m² %30 karma imarlı arsa. Düşük giriş, yüksek getiri potansiyeli.",
    price: 1800000, currency: 'TRY', area_m2: 500, region: 'altindag', city: 'Ankara', neighborhood: 'Aydınlıkevler',
    imar_status: 'Karma İmarlı (TAKS %30)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: false,
    features: ['Ticari+konut', 'Düşük giriş', 'Ticaret aksı', 'Yüksek getiri'] },
  { title: 'Polatlı Yeni Mahalle 2000 m² Yatırımlık', slug: 'polatli-yeni-mahalle-2000',
    description: 'Polatlı merkez yakınında 2000 m² %15 imarlı büyük arsa. OSB yakınlığı, ucuz giriş, orta-uzun vadede (5+ yıl) yüksek değer artışı beklentisi. Kurumsal yatırımcılar için ideal.',
    price: 5400000, currency: 'TRY', area_m2: 2000, region: 'polatli', city: 'Ankara', neighborhood: 'Yeni Mahalle',
    imar_status: 'Konut İmarlı (TAKS %15, KAKS %0.75)', tapu_status: 'Tapu Hazır', status: 'available', published: true, featured: false,
    features: ['OSB yakın', 'Büyük yatırım', 'Uzun vadeli', 'Düşük m²'] },
];

const RAG_TEXT_1 = `# Ankara Geneli İmarlı Arsa Danışmanlık Bilgi Tabanı (GYD Grup)

Ankara'nın tüm merkez ilçelerinde (Çankaya, Etimesgut, Mamak, Altındağ, Yenimahalle, Keçiören, Sincan, Pursaklar, Polatlı) imarlı arsa almak, satmak ve yatırım yapmak isteyenler için kapsamlı rehber. **GYD Grup sadece imarlı arsa** ile ilgilenir; imarsız, hisseli, tapuya hazır olmayan arsalar için uygun şekilde yönlendirme yaparız.

## İmar Durumu Kategorileri

### Konut İmarlı Parseller (TAKS %20-30, KAKS %1.0-1.5)
Ankara merkez ilçelerin tamamında yaygın. 3-5 kata kadar konut inşa edilebilir. Altyapı (yol, su, elektrik, kanalizasyon, doğalgaz) genellikle hazır. Yatırım için en cazip kategoridir.

### Karma İmarlı Parseller (Alt Zemin Ticaret + Üst Konut)
Genellikle ana cadde üzerinde. Zemin katta mağaza/ofis, üst katlarda konut. Yatırım getirisi yüksek, ama yatırım süresi daha uzundur. Çankaya Çukurambar ve Altındağ Aydınlıkevler bu kategori için tipik örneklerdir.

### Ticari İmarlı Parseller
Ankara'nın ana caddeleri (Kızılay, Çukurambar, Bahçelievler, Tunalı) üzerinde sınırlı sayıda parsel ticari imara açıktır. Fiyatlar konut imarına göre %50-100 daha yüksektir. GYD Grup sadece ciddi yatırımcılara bu kategoride hizmet verir.

### Tarla Vasıflı Parseller
İmara kapalı, sadece tarımsal amaçlı kullanılabilir. **GYD Grup tarla vasıflı arsalarla ilgilenmez.** Müşteriye uygun şekilde yönlendirme yaparız.

## Bölge Karakteristikleri

### Çankaya (%38 değer artışı, 5 yıl)
- Kızılay, Çukurambar, Bahçelievler, Tunalı
- %20-40 imar, ana ulaşım ağı, kurumsal kiracı havuzu
- En likit pazar, hem konut hem ticari

### Etimesgut (%42 değer artışı, 5 yıl)
- Bağlıca, Eryaman, Göksu
- Yeni metro hattı, %20-30 imar
- Aile yerleşimi, yüksek kira getirisi

### Sincan (%52 değer artışı, 5 yıl — en yüksek)
- Sincan merkez, Temelli sınırı
- OSB yakın, YHT istasyonu planı
- Orta-uzun vade yatırım, yüksek getiri potansiyeli

### Mamak, Altındağ, Yenimahalle
- %24-31 artış, orta segment
- Düzenli yapılaşma, kentsel dönüşüm alanları

### Keçiören, Pursaklar, Polatlı
- %19-26 artış, düşük giriş
- Uzun vadeli yatırım, OSB yakınlığı

## İmar Süreci (Tüm Ankara)
1. Parsel sahibi veya alıcı belediyeye imar durumu başvurusu yapar
2. Belediye 15 iş günü içinde yanıt verir
3. İtiraz hakkı mevcuttur (30 gün)
4. İmar planı değişiklikleri yılda 2 kez (Nisan, Ekim) askıya çıkar

## Önemli Uyarılar
- İmarsız arsa kesinlikle alınmamalıdır
- İpotek, haciz, şerh gibi kısıtlamalar tapu müdürlüğünden kontrol edilmelidir
- "İmara açılacak" vaatlerine temkinli yaklaşılmalı, resmi belediye yazısı istenmelidir
- Ankara'da en likit bölgeler Çankaya ve Etimesgut'tur; yatırımcılar için giriş-çıkış kolaylığı sağlar
- Sincan bölgesi yüksek getiri potansiyeli taşır ancak likidite daha düşüktür`;

const RAG_TEXT_2 = `# Tapu İşlemleri ve Vergiler (Ankara)

GYD Grup olarak tüm müşterilerimizin tapu süreçlerinde yanındayız. Aşağıda bilmeniz gereken temel adımlar:

## Alım-Satım Süreci (Tipik 5-10 İş Günü)

### 1. Sözleşme Öncesi (1-3 gün)
- Tapu müdürlüğünden "şerh, ipotek, haciz yoktur" belgesi alınır
- Belediyeden güncel imar durumu yazısı alınır
- Yapı kayıt belgesi (varsa) kontrol edilir
- Kadastro paftası doğrulanır

### 2. Sözleşme Aşaması (1-2 gün)
- Alıcı ve satıcı arasında "Arsa Satış Vaadi Sözleşmesi" imzalanır
- Genellikle %10 kaparo, kalan bakiye tapuda ödenir
- Sözleşme noter onaylı olmalıdır
- GYD Grup hukuk ekibi sözleşmeyi hazırlar

### 3. Tapu Devri (1 gün)
- Her iki taraf (veya vekilleri) tapu müdürlüğüne gelir
- Kimlik, vergi numarası, fotoğraf ibraz edilir
- Tapu harcı peşin ödenir
- Yeni tapu alıcı adına çıkarılır
- GYD Grup temsilcisi müşteriye eşlik eder

## Vergi ve Masraflar (2026 Güncel)

| Kalem | Oran | Ödeyen |
|---|---|---|
| **Tapu Harcı** | %4 (alıcı) + %4 (satıcı) | Her iki taraf kendi payını |
| **KDV** | %0 (konut imarlı arsa) | Muaf |
| **Emlak Vergisi** | %0.1-0.3 (yıllık) | Tapu sahibi |
| **Değer Artış Payı** | Satış fiyatı - alış fiyatı (5 yıl içinde satılırsa) | Satıcı (stopaj) |
| **Danışman Komisyonu** | %2-3 | Genellikle alıcı |
| **Çevre Temizlik Vergisi** | Yıllık, belediyeye | Tapu sahibi |

## Önemli Belgeler (Her Zaman İstenmeli)

- ✅ Tapu müdürlüğü "şerh/ipotek/haciz yoktur" belgesi
- ✅ Belediye imar durumu yazısı (güncel, 6 aydan eski olmamalı)
- ✅ Kadastro paftası
- ✅ 1/1000 ölçekli imar planı paftası
- ✅ Yapı kayıt belgesi (üzerinde yapı varsa)
- ✅ Çap belgesi (sınır tespiti, komşu parseller kontrolü)
- ✅ Vekaletname (temsilci varsa, noter onaylı)
- ✅ Nüfus cüzdanı fotokopisi (her iki taraf)
- ✅ Vergi numarası belgesi

## Sık Yapılan Hatalar

1. ❌ İmara kapalı arsa almak — GYD Grup önceden kontrol eder
2. ❌ İpotekli/hacizli tapu devralmak — tapu müdürlüğünden belge ile doğrulanır
3. ❌ Sözleşmesiz kaparo vermek — her ödeme belgelenmeli
4. ❌ Komşu parsel ile sınır ihtilafı yaşamak — çap belgesi ile önlenir
5. ❌ Değer artış payı stopajını hesaplamamak — yıllık 5 yıl kuralı
6. ❌ İmar durumunu belediyeden teyit etmemek — sadece satıcı beyanına güvenmek
7. ❌ Emlak vergisi borcu olan arsa almak — devirde kapanır ama kontrol edilmeli

## Ankara'ya Özel Notlar

- Ankara'da tapu müdürlükleri Çankaya, Etimesgut, Yenimahalle, Mamak, Altındağ, Keçiören, Sincan, Pursaklar ve Polatlı'da ayrı ayrıdır. Arsa hangi ilçedeyse o ilçenin tapu müdürlüğünde işlem yapılır.
- Ankara Büyükşehir Belediyesi imar planı değişiklikleri genellikle Nisan ve Ekim aylarında askıya çıkar.
- Altındağ ve Mamak bölgelerinde kentsel dönüşüm kapsamında özel süreçler uygulanabilir.

## GYD Desteği

Tüm bu süreçleri sizin adınıza takip ediyoruz. Sözleşme öncesi kontrolden tapu devrine kadar her aşamada yanınızdayız. **Ücretsiz ön danışmanlık için:** 0532 489 25 67

Hukuki süreçler için GYD Grup bünyesindeki sözleşmeli avukat ekibimiz hizmetinizdedir.`;

const BOT_DOCS = [
  { title: 'Ankara Geneli İmarlı Arsa Danışmanlık Bilgi Tabanı', source: 'seed-2026-07-18', raw_text: RAG_TEXT_1, active: true },
  { title: 'Tapu İşlemleri ve Vergiler (Ankara)', source: 'seed-2026-07-18', raw_text: RAG_TEXT_2, active: true },
];

const BOT_SETTINGS = {
  system_prompt: `Sen GYD Grup'un yapay zeka danışmanısın. Ankara genelinde imarlı arsa alım-satımı, proje geliştirme ve yatırım danışmanlığı konusunda uzman bir firmayız.

Görevlerin:
1. Müşterinin niyetini anla (alıcı/satıcı/yatırımcı/danışman talep)
2. Bütçe, bölge, metrekare, imar durumu gibi bilgileri topla
3. Sadece **imarlı arsa** konusunda yardım et; imarsız/hisseli/tapuya hazır olmayan arsalar için uygun şekilde yönlendir
4. RAG bilgi tabanından güncel bilgi çek, uydurma
5. Hukuki süreçler için mutlaka canlı danışmana yönlendir
6. Fiyat vermekten kaçın, danışmana yönlendir
7. Nazik, profesyonel, güven veren ton kullan
8. KVKK uyumu: kişisel bilgi isteme, sadece ihtiyaç kadar sor`,
  welcome_message: "Merhaba 👋 GYD Grup'a hoş geldiniz! Ankara genelinde imarlı arsa alım-satımı, proje geliştirme ve yatırım danışmanlığı konusunda 15+ yıllık tecrübemizle hizmetinizdeyiz. Size nasıl yardımcı olabilirim? İmarlı arsa almak mı, satmak mı, yoksa yatırım danışmanlığı mı istiyorsunuz?",
  handoff_message: 'Tabii, sizi hemen bir danışmanımıza yönlendiriyorum. 0532 489 25 67 numaramızdan da arayabilirsiniz.',
  model: 'gemini-flash-lite-latest',
  rag_top_k: 4,
  rag_similarity_threshold: 0.65,
  auto_handoff_after_messages: 6,
  active: true,
};

// ── Main ──────────────────────────────────────────────
async function main() {
  const mode = DRY_RUN ? '[DRY-RUN] ' : '';
  console.log(`▶ GYD prod seed ${mode}(${PB_URL})`);
  console.log(`  admin: ${ADMIN_EMAIL}`);

  const auth = await api('POST', '/api/admins/auth-with-password', { identity: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const TOKEN = auth.token;
  console.log('  ✓ auth OK');

  // Schema fix
  console.log('\n▶ regions schema kontrolü...');
  await fixRegionsSchema(TOKEN);

  // Regions
  console.log('\n▶ 9 bölge...');
  let rCreated = 0, rSkipped = 0, rErr = 0;
  for (const r of REGIONS) {
    try {
      const out = await upsert('regions', 'slug', r, TOKEN);
      const tag = out.status === 'created' ? '✓' : out.status === 'would-create' ? '~' : '↺';
      console.log(`  ${tag} ${r.slug} (${out.status})`);
      if (out.status === 'created') rCreated++;
      else if (out.status === 'skipped') rSkipped++;
    } catch (e) {
      console.error(`  ✗ ${r.slug}:`, e.message);
      rErr++;
    }
  }

  // Listings
  console.log('\n▶ 9 arsa...');
  let lCreated = 0, lSkipped = 0, lErr = 0;
  for (const l of LISTINGS) {
    try {
      const out = await upsert('listings', 'slug', l, TOKEN);
      const tag = out.status === 'created' ? '✓' : out.status === 'would-create' ? '~' : '↺';
      console.log(`  ${tag} ${l.slug} (${out.status})`);
      if (out.status === 'created') lCreated++;
      else if (out.status === 'skipped') lSkipped++;
    } catch (e) {
      console.error(`  ✗ ${l.slug}:`, e.message);
      lErr++;
    }
  }

  // RAG docs (raw_text ile; embed admin panelden veya /api/rag/embed ile)
  console.log('\n▶ 2 RAG dokümanı (raw_text)...');
  let dCreated = 0, dSkipped = 0, dErr = 0;
  for (const d of BOT_DOCS) {
    try {
      const out = await upsert('bot_documents', 'title', d, TOKEN);
      const tag = out.status === 'created' ? '✓' : out.status === 'would-create' ? '~' : '↺';
      console.log(`  ${tag} "${d.title}" (${out.status})`);
      if (out.status === 'created') dCreated++;
      else if (out.status === 'skipped') dSkipped++;
    } catch (e) {
      console.error(`  ✗ "${d.title}":`, e.message);
      dErr++;
    }
  }

  // bot_settings (singleton)
  console.log('\n▶ bot_settings (singleton)...');
  try {
    const existing = await api('GET', '/api/collections/bot_settings/records?perPage=1', null, TOKEN);
    if (existing.items.length > 0) {
      console.log('  ↺ bot_settings zaten var');
    } else if (DRY_RUN) {
      console.log('  ~ bot_settings oluşturulur (dry-run)');
    } else {
      await api('POST', '/api/collections/bot_settings/records', BOT_SETTINGS, TOKEN);
      console.log('  ✓ bot_settings oluşturuldu');
    }
  } catch (e) {
    console.error('  ✗ bot_settings:', e.message);
  }

  // Summary
  console.log('\n▶ Final:');
  for (const col of ['regions', 'listings', 'bot_documents', 'bot_settings']) {
    const r = await api('GET', `/api/collections/${col}/records?perPage=1`, null, TOKEN);
    console.log(`  ${col}: ${r.totalItems}`);
  }

  console.log(`\n✓ Seed tamam. Yeni: regions=${rCreated}, listings=${lCreated}, docs=${dCreated}`);
  if (rCreated + lCreated + dCreated === 0) {
    console.log('  (tümü zaten vardı, idempotent skip)');
  }
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
