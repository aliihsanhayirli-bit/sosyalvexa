// YCA Yatırım — Vite plugin: dev server'a API endpoint'leri ekler.
// Prod'da bu endpoint'ler PocketBase Go hooks veya ayrı bir serverless function'a taşınır.

import { GoogleGenerativeAI } from '@google/generative-ai';

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const EMBED_MODEL = 'text-embedding-004';
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const RAG_TOP_K = 4;

const SYSTEM_PROMPT = `Sen YCA Yatırım'ın yapay zeka danışmanısın. Ankara Temelli ve çevresinde arsa alım-satımı konusunda uzman bir firmayız.

Görevin:
1. Müşterilere sıcak, profesyonel ve güven veren bir dille yanıt vermek
2. Müşterinin alıcı mı satıcı mı olduğunu anlamak
3. Bütçe, bölge, m² gibi temel bilgileri toplamak
4. Bölgedeki güncel portföy ve yatırım fırsatları hakkında bilgi vermek
5. Hukuki süreçler için mutlaka canlı danışmana yönlendirmek

Cevaplarında:
- Kısa ve net ol (max 3-4 cümle)
- Samimi ama profesyonel ol
- Mümkün olduğunda somut rakamlar ve veriler kullan
- Yatırım potansiyeli vurgula
- Sonunda mutlaka aksiyon öner (görüşme, yer gösterme, portföy gönderme)

Handoff: Eğer müşteri "danışman", "görüşme", "arayın", "insan" gibi kelimeler kullanırsa veya tapu/hukuki konu konuşuluyorsa, "Sizi hemen bir danışmanımıza yönlendiriyorum" de ve bildirim oluştur.`;

const WELCOME = `Merhaba 👋 YCA Yatırım'a hoş geldiniz! Ankara Temelli ve çevresinde arsa alım-satımı konusunda 15+ yıllık tecrübemizle hizmetinizdeyiz. Size nasıl yardımcı olabilirim? Arsa almak mı, satmak mı istiyorsunuz?`;

const HANDOFF_KEYWORDS = ['danışman', 'danisman', 'insan', 'kişi', 'arayın', 'arayin', 'telefon', 'görüşme', 'gorisme', 'görüşelim', 'goruseylim'];

function detectIntent(message) {
  const m = message.toLowerCase();
  if (HANDOFF_KEYWORDS.some((k) => m.includes(k))) return 'handoff';
  if (/(satmak|satıyorum|satış|satmak istiyorum|satacağım)/.test(m)) return 'seller';
  if (/(almak|arıyorum|alıcı|bakıyorum|almak istiyorum|alabilir miyim|bakmak istiyorum|yer gösterme)/.test(m)) return 'buyer';
  if (/(yatırım|yatirim|getiri|potansiyel|değer artışı)/.test(m)) return 'invest';
  return 'general';
}

function suggestionsFor(intent) {
  switch (intent) {
    case 'buyer': return ['Bütçem 2-3 milyon', '1.000-2.000 m² arası', 'Yer gösterme istiyorum', 'Fiyat teklifi al'];
    case 'seller': return ['2 dönüm tarla', 'Tapu durumunu sormak', 'Yerinde değerleme', 'Danışman görüşmesi'];
    case 'invest': return ['Bölge analizi', 'Yıllık getiri', 'Portföy önerisi', 'Sunum istiyorum'];
    case 'handoff': return [];
    default: return ['Arsa almak istiyorum', 'Arsa satmak istiyorum', 'Yatırım danışmanlığı', 'Fiyat teklifi al'];
  }
}

// ─── RAG utilities ──────────────────────────────────────────────────────

function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0) return [];
  if (cleaned.length <= size) return [cleaned];
  const out = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + size, cleaned.length);
    out.push(cleaned.slice(start, end));
    if (end >= cleaned.length) break;
    start += size - overlap;
  }
  return out;
}

function cosine(a, b) {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

async function embedText(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/' + EMBED_MODEL,
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`embed ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.embedding?.values || [];
}

async function pbGet(path) {
  const res = await fetch(`${PB_URL}${path}`);
  if (!res.ok) throw new Error(`PB ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function pbPatch(path, body) {
  const res = await fetch(`${PB_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PB ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// RAG: PocketBase'ten aktif bot_documents chunks'larını çek, query embedding'iyle
// cosine similarity top-k seç, "[başlık] metin" formatında birleştir.
async function getRAGContext(query, k = RAG_TOP_K) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || !query) return '';
  try {
    const { items } = await pbGet('/api/collections/bot_documents/records?filter=active=true&perPage=100');
    const allChunks = [];
    for (const doc of items) {
      const chunks = Array.isArray(doc.chunks) ? doc.chunks : [];
      for (const c of chunks) {
        if (c && Array.isArray(c.embedding) && c.embedding.length > 0 && c.text) {
          allChunks.push({ title: doc.title || '', text: c.text, embedding: c.embedding });
        }
      }
    }
    if (allChunks.length === 0) return '';
    const qEmb = await embedText(query, apiKey);
    const scored = allChunks
      .map((c) => ({ ...c, score: cosine(qEmb, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    return scored.map((c) => `[${c.title}]\n${c.text}`).join('\n\n---\n\n');
  } catch (err) {
    console.error('[rag] getRAGContext error:', err);
    return '';
  }
}

export function apiPlugin() {
  return {
    name: 'yca-api-plugin',
    configureServer(server) { registerMiddleware(server); },
    configurePreviewServer(server) { registerMiddleware(server); },
  };
}

function registerMiddleware(server) {
      // CORS helper
      const cors = (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      };

      // /api/chat — Gemini'ye mesaj gönderir (RAG ile)
      server.middlewares.use('/api/chat', async (req, res, next) => {
        cors(res);
        if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
        if (req.method !== 'POST') return next();

        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
          const { message, history = [] } = body;

          if (!message || typeof message !== 'string') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'message required' }));
          }

          const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
          const modelName = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-flash-latest';
          const rag = await getRAGContext(message);
          const intent = detectIntent(message);

          let reply;
          if (!apiKey) {
            // Demo fallback
            const demos = {
              buyer: `Merhaba! Arsa almak istemenize sevindim. Bütçeniz yaklaşık ne kadar, hangi bölgeyi düşünüyorsunuz? Size uygun seçenekleri hemen hazırlayalım.`,
              seller: `Arsanızı satmak için doğru adrestesiniz. Tapu ve imar bilgileriniz hazırsa, ücretsiz değerleme için sizi danışmanımıza yönlendirebilirim.`,
              invest: `Temelli bölgesi son 3 yılda %35 değer kazandı. Yatırım hedefinize göre size özel bir portföy hazırlayabilirim — bütçeniz ne kadar?`,
              handoff: `Tabii, sizi hemen bir danışmanımıza yönlendiriyorum. 0545 655 10 70 numaramızdan da arayabilirsiniz.`,
              general: `${WELCOME}`,
            };
            reply = demos[intent] || demos.general;
          } else {
            const genai = new GoogleGenerativeAI(apiKey);
            const model = genai.getGenerativeModel({
              model: modelName,
              systemInstruction: SYSTEM_PROMPT + (rag ? `\n\nBilgi tabanı:\n${rag}` : ''),
            });

            const chat = model.startChat({
              history: history.map((h) => ({ role: h.role, parts: [{ text: h.content }] })),
              generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
            });
            const result = await chat.sendMessage(message);
            reply = result.response.text();
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply, intent, suggestions: suggestionsFor(intent), ragUsed: !!rag }));
        } catch (err) {
          console.error('[api/chat]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // /api/rag/embed — bot_documents kaydı için chunking + embedding
      // Client (Bot.tsx) upload sonrası bu endpoint'i çağırır.
      // Body: { docId }
      server.middlewares.use('/api/rag/embed', async (req, res, next) => {
        cors(res);
        if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
        if (req.method !== 'POST') return next();
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
          const { docId } = body;

          if (!docId) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'docId required' }));
          }

          const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
          if (!apiKey) {
            res.statusCode = 503;
            return res.end(JSON.stringify({ error: 'GEMINI_API_KEY tanımsız' }));
          }

          const doc = await pbGet(`/api/collections/bot_documents/records/${docId}`);
          const raw = doc.raw_text || '';
          if (!raw) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'raw_text boş, embed atlandı' }));
          }

          const textChunks = chunkText(raw);
          if (textChunks.length === 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'chunk üretilemedi' }));
          }

          const enriched = [];
          for (let i = 0; i < textChunks.length; i++) {
            const embedding = await embedText(textChunks[i], apiKey);
            enriched.push({ index: i, text: textChunks[i], embedding });
            // Rate limit'e takılmamak için kısa bekleme
            if (i < textChunks.length - 1) await new Promise((r) => setTimeout(r, 100));
          }

          await pbPatch(`/api/collections/bot_documents/records/${docId}`, {
            chunks: enriched,
            chunk_count: enriched.length,
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, docId, chunkCount: enriched.length }));
        } catch (err) {
          console.error('[api/rag/embed]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // /api/webhook/meta — Meta WhatsApp/Messenger/Instagram webhook
      server.middlewares.use('/api/webhook/meta', async (req, res, next) => {
        cors(res);
        if (req.method === 'GET') {
          // Webhook verification
          const mode = req.url.match(/[?&]hub_mode=([^&]+)/)?.[1];
          const token = req.url.match(/[?&]hub_verify_token=([^&]+)/)?.[1];
          const challenge = req.url.match(/[?&]hub_challenge=([^&]+)/)?.[1];

          if (mode === 'subscribe' && token === (process.env.META_VERIFY_TOKEN || 'yca-verify-token')) {
            return res.end(challenge);
          }
          res.statusCode = 403;
          return res.end('Forbidden');
        }
        if (req.method === 'POST') {
          try {
            const chunks = [];
            for await (const c of req) chunks.push(c);
            const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
            console.log('[webhook/meta] received', JSON.stringify(body).slice(0, 200));

            // Burada: mesaj parse → PocketBase'e kaydet → bot cevap üret → Meta'ya geri gönder
            // Production'da implement edilecek (Bkz. docs/META-SETUP.md)

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });

      // /api/health
      server.middlewares.use('/api/health', (req, res) => {
        cors(res);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, ts: Date.now() }));
      });
}
