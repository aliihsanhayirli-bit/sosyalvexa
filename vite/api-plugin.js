// YCA Yatırım — Vite plugin: dev server'a API endpoint'leri ekler.
// Prod'da bu endpoint'ler PocketBase Go hooks veya ayrı bir serverless function'a taşınır.

import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Basit RAG: ek doküman yoksa sadece system prompt ile çalışır.
// Gerçek RAG'de PocketBase'ten bot_documents çekilir, cosine similarity ile top-K seçilir.
async function getRAGContext() {
  return ''; // Şimdilik boş — production'da PocketBase'ten çekilecek
}

export function apiPlugin() {
  return {
    name: 'yca-api-plugin',
    configureServer(server) {
      // CORS helper
      const cors = (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      };

      // /api/chat — Gemini'ye mesaj gönderir
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
          const modelName = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
          const rag = await getRAGContext();
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
          res.end(JSON.stringify({ reply, intent, suggestions: suggestionsFor(intent) }));
        } catch (err) {
          console.error('[api/chat]', err);
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
    },
  };
}
