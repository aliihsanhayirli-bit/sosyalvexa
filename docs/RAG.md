# RAG (Retrieval-Augmented Generation) Pipeline

GYD Grup botu, şirket bilgilerine dayalı doğru cevaplar vermesi için RAG kullanır. Embedding'ler PocketBase `bot_documents.chunks` alanında JSON olarak saklanır, retrieval runtime cosine similarity ile yapılır.

## Akış

```
Kullanıcı mesajı
     │
     ▼
┌────────────────────────────────────────────────────────┐
│ 1) EMBED                                              │
│    Kullanıcı mesajını gemini-embedding-001 ile        │
│    vektörleştir (768 dim)                              │
└────────────────────┬───────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────┐
│ 2) RETRIEVE                                           │
│    bot_documents.chunks içindeki tüm embedding'ler    │
│    ile cosine similarity hesapla, top-4 chunk getir    │
└────────────────────┬───────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────┐
│ 3) AUGMENT                                            │
│    System prompt + retrieved chunks + history         │
│    → Gemini 1.5 Flash'a gönder                        │
└────────────────────┬───────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────┐
│ 4) GENERATE                                           │
│    Bot cevabı + kaynak chunk'lar                      │
└────────────────────────────────────────────────────────┘
```

## Doküman Yükleme (Admin Panel)

1. `/admin/bot` → "Doküman Yükle" → `.txt` / `.md` / `.pdf` / `.docx` seç
2. Frontend dosyayı text'e çevirip `raw_text` alanına yazar
3. PocketBase `bot_documents` `onRecordAfterCreate` hook'u (`pb_hooks/embed.pb.js`):
   - 800 karakterlik chunk'lara böler (overlap 100)
   - Her chunk'ı `gemini-embedding-001` ile batch embedding yapar (batch 20)
   - `chunks` JSON alanına `{ text, embedding }` array olarak yazar
   - `chunk_count` alanını günceller
4. Bot artık bu dokümanlardan bilgi çekebilir

## Vector Storage

PocketBase SQLite'ta `chunks` JSON:
```json
[
  {
    "text": "Temelli bölgesinde konut imarlı parseller...",
    "embedding": [0.012, -0.034, ...]  // 768 sayı
  },
  ...
]
```

**İndeksleme** için ileride `sqlite-vss` extension eklenebilir (şu an linear scan yeterli — 1000 chunk'a kadar hızlı).

## PocketBase Hook (Production)

`/opt/gyd-pocketbase/pb_hooks/embed.pb.js` zaten kurulu. Yeni dosya yüklenince otomatik çalışır.

Özet akış:
```js
onRecordAfterCreateRequest(async (e) => {
  if (e.collection.name !== 'bot_documents') return e.next();

  const raw = String(e.record.get('raw_text') || '').trim();
  if (!raw) return e.next();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return e.next();

  const chunks = chunkText(raw, 800, 100);
  const embedded = await batchEmbed(chunks, apiKey);

  e.record.set('chunks', embedded);
  e.record.set('chunk_count', embedded.length);
  $app.dao().saveRecord(e.record);
  return e.next();
}, 'bot_documents');
```

## Retrieval (Production API)

`/opt/gyd-api/server.mjs` içinde `getRAGContext(query)`:
```js
async function getRAGContext(query) {
  // 1) Query embedding
  const qEmbed = await embed(query, process.env.GEMINI_API_KEY);

  // 2) Aktif dokümanların chunk'larını PB'den çek
  const docs = await pbGet('/api/collections/bot_documents/records?perPage=200&filter=active=true');

  // 3) Cosine similarity (top-4)
  const scored = [];
  for (const doc of docs.items || []) {
    const chunks = doc.chunks || [];
    for (const c of chunks) {
      if (!c.embedding) continue;
      scored.push({ text: c.text, score: cosine(qEmbed, c.embedding), source: doc.title });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  // 4) Prompt'a inject
  return scored.slice(0, 4).map((s) => `[${s.source}] ${s.text}`).join('\n\n');
}
```

## Performans

- 100 doküman × 30 chunk = 3000 vektör
- Linear cosine: ~5ms / sorgu (768 dim, Node.js)
- sqlite-vss eklersek: ~0.5ms
- Embedding batch: 20 chunk / istek, toplam süre 100 chunk ≈ 3 sn

## Google API Limitleri (Ücretsiz Tier)

- `gemini-embedding-001`: 1500 istek/dakika
- `gemini-1.5-flash`: 1500 istek/dakika, 1M token/dakika
- Bir sohbet ortalama 2-3 istek (1 embed + 1 generate + bazen 1 daha) → günde 500-700 konuşma destekler

## Hata Yönetimi

- API key yoksa → fallback intent-based cevaplar
- Embedding başarısız → context olmadan devam et (system prompt yine çalışır)
- Retrieval boş → sadece system prompt kullan
- Hook hata verirse PocketBase log'a yazar, request düşmez (`return e.next()`)

## Önerilen ilk dokümanlar

Bot'un faydalı cevap verebilmesi için `/admin/bot` üzerinden yüklenecek minimum içerik:

1. **Bölgeler** — her bölge için imar durumu, fiyat aralığı, avantajlar
2. **Süreç rehberi** — tapu devri, vergiler, sözleşme adımları
3. **Sık sorulan sorular** — imarsız arsa, ipotek, hisseli tapu, KDV muafiyeti
4. **Yatırım analizleri** — son 5 yıl fiyat trendi, bölge karşılaştırması
5. **Hizmet kapsamı** — sadece imarlı arsa, Ankara geneli, danışmanlık modeli

Detaylı seed: `HEMEN-TEST.md` (tarihsel, içerik güncellenmeli).
