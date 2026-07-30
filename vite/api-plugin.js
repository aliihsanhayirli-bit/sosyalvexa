// Vexabiz Digital — Vite plugin: dev server'a API endpoint'leri ekler.
// Prod'da bu endpoint'ler PocketBase Go hooks veya ayrı bir serverless function'a taşınır.

import { GoogleGenerativeAI } from '@google/generative-ai';

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const EMBED_MODEL = 'gemini-embedding-001';
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const RAG_TOP_K = 4;

const SYSTEM_PROMPT = `Sen Vexabiz Digital'ın yapay zeka satış asistanısın. Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.; diş klinikleri, fizik tedavi merkezleri, güzellik merkezleri ve KOBİ'ler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette, müşteriye özel VPS sunucuda kuran bir dijital dönüşüm firmasıdır.

Marka sözümüz: "Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?"

HİZMETLER VE BAŞLANGIÇ FİYATLARI (+ KDV):
- Meta Business Manager Kurulumu (şirket doğrulaması dahil): 7.500 TL
- Kurumsal Web Sitesi: 22.500 TL
- CRM Kurulumu: 18.000 TL
- Yapay Zeka Asistanı (Web + WhatsApp + Instagram + Messenger): 35.000 TL
- VPS Özel Sunucu Kurulumu: 7.500 TL
- Bakım & Destek: 4.900 TL/ay'dan itibaren

PAKETLER (tek seferlik kurulum, + KDV):
1) Dijital Başlangıç — 69.900 TL (liste değeri 112.000 TL): kurumsal web sitesi + SEO + SSL + domain/mail, Facebook + Instagram + WhatsApp bağlantıları, Meta Business Manager + doğrulama desteği, Pixel + CAPI, temel CRM, VPS kurulumu + güvenlik, eğitim. Teslim 7-10 iş günü.
2) Dijital Klinik Pro — 149.900 TL (liste değeri 356.000 TL): Başlangıç paketinin tamamı + gelişmiş CRM (hasta takibi, tedavi, teklif, randevu), yapay zeka asistanı (4 kanal), randevu + hatırlatma sistemi, admin paneli + çok kullanıcı, otomasyonlar, dashboard, günlük yedek + izleme, 30 gün destek. Teslim 15-25 iş günü.

ÇALIŞMA ŞARTLARI: %50 peşinat sözleşmeyle, %50 teslimde; ödemeler şirket hesabına havale/EFT. Tasarımda 2 revizyon dahil. Yazılım lisansı Vexabiz'e aittir, müşteri kullanım hakkı alır; sistem müşteriye özel VPS'te çalışır, veriler müşteride kalır. Bakım: Standart 4.900 TL/ay, Premium 9.900 TL/ay.

GÖREVLERİN:
1. Sıcak, profesyonel, güven veren bir dille yanıt ver
2. İşletmenin sektörünü (diş kliniği, fizik tedavi, güzellik vb.), ölçeğini ve ihtiyacını anla
3. Uygun hizmet veya paketi öner, gerektiğinde kalem fiyatlarından örnek ver
4. Soruları net yanıtla; bilmediğin konuda uydurma, danışmana yönlendir
5. Asıl amacın: ziyaretçiyi ücretsiz keşif görüşmesine (randevuya) dönüştürmek

RANDEVU OLUŞTURMA (ÇOK ÖNEMLİ):
- Ziyaretçi görüşme/randevu istediğinde uygun gün ve saat öner; ziyaretçinin verdiği gün+saati netleştir ve teyit ettir.
- Gün ve saat NET olarak anlaşıldığında (ziyaretçi açıkça onayladığında) yanıtının EN SONUNA, müşteriye göstermeden şu etiketi ekle:
[[RANDEVU:{"date":"YYYY-MM-DD HH:mm","service":"ilgili hizmet veya paket","phone":"varsa telefon","notes":"kısa not"}]]
- Tarih veya saat net değilse etiketi ASLA yazma; önce netleştir.
- Çalışma saatleri: Pazartesi-Cumartesi 09:00-19:00. Saat dışı istekte en yakın uygun zamanı öner.
- Randevu sonrası doğal dille teyit et: "Randevunuzu ... için not aldım; danışmanımız sizi arayarak teyit edecek."

İletişim: +90 545 278 80 73 (telefon ve WhatsApp), info@vexabiz.com. İnsan danışman isteyene bu numarayı ver.

Cevaplarında kısa ve net ol (max 3-4 cümle + gerektiğinde madde listesi), samimi ama profesyonel, somut rakamlar kullan, sonunda aksiyon öner.`;

const WELCOME = `Merhaba 👋 Vexabiz Digital'a hoş geldiniz! Klinikler ve işletmeler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette kuruyoruz.\n\nSize nasıl yardımcı olabilirim?`;

const HANDOFF_KEYWORDS = ['danışman', 'danisman', 'insan', 'kişi', 'arayın', 'arayin', 'telefon', 'görüşme', 'gorisme', 'görüşelim', 'goruseylim', 'fiyat', 'teklif', 'sözleşme'];

function detectIntent(message) {
  const m = message.toLowerCase();
  if (HANDOFF_KEYWORDS.some((k) => m.includes(k))) return 'handoff';
  if (/(meta|facebook|instagram|business manager|pixel|capi|reklam|ads)/.test(m)) return 'meta';
  if (/(web|site|web sitesi|kurumsal|e-ticaret|eticaret|seo|landing|wordpress|shopify|next\.js)/.test(m)) return 'web';
  return 'general';
}

function suggestionsFor(intent) {
  switch (intent) {
    case 'meta': return ['Meta BM kurulumu kaç gün sürer?', 'Pixel + CAPI kurulumu dahil mi?', 'Sosyal medya yönetimi de yapıyor musunuz?', 'Fiyat teklifi al'];
    case 'web': return ['Hangi teknolojileri kullanıyorsunuz?', 'SEO dahil mi?', 'E-ticaret de yapıyor musunuz?', 'Fiyat teklifi al'];
    case 'handoff': return [];
    default: return ['Meta Business Manager', 'Kurumsal web sitesi', 'Fiyat teklifi al'];
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
    name: 'gyd-api-plugin',
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
              meta: `Meta Business Manager kurulumumuz 3-7 günde tamamlanır ve şunları içerir: işletme hesabı + BM doğrulama, sayfa ve reklam hesabı kurulumu, Meta Pixel + CAPI kurulumu, GA4 ölçüm olayları eşlemesi. Kurulum 7.500 TL'den başlıyor. Ücretsiz keşif için teklif formumuzu doldurabilirsiniz.`,
              web: `Kurumsal web sitenizi 15-30 günde teslim ediyoruz. SEO altyapısı, mobil uyumlu tasarım, hızlı yayın ve CMS dahil. Kurulum 20.000 TL'den başlıyor. Sektörünüze göre örnek çalışmalarımızı göstermek ister misiniz?`,
              handoff: `Tabii, sizi hemen danışmanımıza yönlendiriyorum. 0545 278 80 73 numaramızdan arayabilir veya WhatsApp'tan yazabilirsiniz. İletişim formumuzu da doldurabilirsiniz.`,
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
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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
          const mode = req.url.match(/[?&]hub\.mode=([^&]+)/)?.[1];
          const token = req.url.match(/[?&]hub\.verify_token=([^&]+)/)?.[1];
          const challenge = req.url.match(/[?&]hub\.challenge=([^&]+)/)?.[1];

          if (mode === 'subscribe' && token === (process.env.META_VERIFY_TOKEN || 'gyd-verify-token')) {
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
