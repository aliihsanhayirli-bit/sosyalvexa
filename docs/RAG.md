# RAG (Retrieval-Augmented Generation) Pipeline

YCA Yatırım botu, şirket bilgilerine dayalı doğru cevaplar vermesi için RAG kullanır.

## Akış

```
Kullanıcı mesajı
     │
     ▼
┌────────────────────────────────────────────────────────┐
│ 1) EMBED                                              │
│    Kullanıcı mesajını Gemini text-embedding-004 ile   │
│    vektörleştir (768 dim)                              │
└────────────────────┬───────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────┐
│ 2) RETRIEVE                                           │
│    bot_documents tablosundaki tüm chunk embedding'leri│
│    ile cosine similarity hesapla, top-3 chunk getir    │
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

1. `/admin/bot` sayfasına gidin
2. "Doküman Yükle" butonu → PDF/MD/TXT/DOCX seç
3. Sunucu tarafı:
   - Dosyayı oku (PDF → text extraction)
   - 500 karakterlik parçalara böl (overlap 50)
   - Her parçayı embedding'le (`text-embedding-004`)
   - PocketBase `bot_documents.chunks` JSON alanına yaz
4. Bot artık bu dokümanlardan bilgi çekebilir

## Vector Storage

PocketBase SQLite'ta `chunks` alanı JSON array:
```json
[
  {
    "text": "YCA Yatırım 2010 yılında kurulmuştur...",
    "embedding": [0.012, -0.034, ...]  // 768 sayı
  },
  ...
]
```

**İndeksleme** için ileride `sqlite-vss` extension eklenebilir (Şu an linear scan yeterli — 1000 chunk'a kadar hızlı).

## Sunucu Tarafı Embedding (Production)

`backend/pb_hooks/rag-ingest.pb.js`:
```js
/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateRequest(async (e) => {
  if (e.collection.name !== 'bot_documents') return e.next();

  const file = e.record.file;
  if (!file) return e.next();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error('GEMINI_API_KEY eksik'); return e.next(); }

  // 1) Dosyayı indir ve metne çevir
  const fs = $app.newFilesystem();
  // ... (PDF için pdf-parse, MD için direkt oku)

  // 2) Chunk'la
  const chunks = chunkText(text, 500, 50);

  // 3) Embedding
  const embedded = await Promise.all(chunks.map(async (c) => ({
    text: c,
    embedding: await embed(c, apiKey),
  })));

  e.record.chunks = JSON.stringify(embedded);
  e.record.chunk_count = embedded.length;
  $app.dao().saveRecord(e.record);

  return e.next();
});

async function embed(text, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    }
  );
  const data = await res.json();
  return data.embedding.values;
}
```

## Retrieval (Vite Plugin / Production)

`vite/api-plugin.js` veya PocketBase hook:
```js
async function getRAGContext(query) {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1) Query embedding
  const qEmbed = await embed(query, apiKey);

  // 2) Tüm aktif dokümanların chunk'larını çek
  const docs = $app.dao().findRecordsByExpr(
    $app.dao().findCollectionByNameOrId('bot_documents'),
    $dbx.hashExp({ active: true })
  );

  // 3) Cosine similarity
  const scored = [];
  for (const doc of docs) {
    const chunks = JSON.parse(doc.chunks || '[]');
    for (const c of chunks) {
      const sim = cosineSimilarity(qEmbed, c.embedding);
      scored.push({ text: c.text, score: sim, source: doc.title });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  // 4) Top 3
  return scored.slice(0, 3)
    .map((s) => `[${s.source}] ${s.text}`)
    .join('\n\n');
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
```

## Performans

- 100 doküman × 30 chunk = 3000 vektör (1 dosya başına ~1.5 MB JSON)
- Linear cosine: ~5ms / sorgu (768 dim, Node.js)
- sqlite-vss eklersek: ~0.5ms

## Google API Limitleri (Ücretsiz Tier)

- text-embedding-004: 1500 istek/dakika
- gemini-1.5-flash: 1500 istek/dakika, 1M token/dakika

Bir sohbet ortalama 2-3 istek (1 embed + 1 generate + bazen 1 daha) → günde 500-700 konuşma destekler.

## Hata Yönetimi

- API key yoksa → fallback "demo" cevaplar (intent-based)
- Embedding başarısız → context olmadan devam et (bot yine de system prompt'la çalışır)
- Retrieval boş → sadece system prompt kullan
