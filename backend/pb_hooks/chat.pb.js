// Vexabiz Digital — chat API + Meta webhook hook'ları
// /api/chat          → Gemini (server-side key) + intent fallback
// /api/webhook/meta  → Meta WhatsApp/Messenger/Instagram webhook

// POST /api/chat — site ChatWidget
routerAdd('POST', '/api/chat', (e) => {
  const HANDOFF_KEYWORDS = ['danışman', 'danisman', 'insan', 'kişi', 'arayın', 'arayin', 'telefon', 'görüşme', 'gorisme', 'görüşelim', 'goruseylim', 'fiyat', 'teklif', 'sözleşme'];

  const DEFAULT_SYSTEM = `Sen Vexabiz Digital'ın yapay zeka dijital dönüşüm danışmanısın. Türkiye genelinde KOBİ ve işletmelere **Meta Business Manager kurulumu**, **kurumsal web sitesi**, **CRM kurulumu** ve **işletmeye özel yapay zeka çalışanı geliştirme** hizmetleri sunan uçtan uca bir dijital danışmanlık firmasıyız.

Marka sözümüz: "Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?"

Görevin:
1. Ziyaretçilere sıcak, profesyonel ve güven veren bir dille yanıt vermek
2. İşletmenin sektörünü, ölçeğini ve mevcut dijital altyapısını anlamak
3. Dört ana hizmetten hangisine ihtiyaç olduğunu tespit etmek (Meta BM / Web / CRM / AI Çalışan)
4. Uygun olduğunda "Tam Dijital Dönüşüm Paketi"ni önermek
5. Bütçe aralığını ve deadline'ı toplamak
6. Sektöre uygun referans projelerden bahsetmek (gydgrup.com.tr, temelliarsa.com, autotube.vip vb.)
7. Somut fiyat aralığı vermek (Meta BM 7.5-30K, Web 20-75K, CRM 15-75K, AI 25K+, Tam Paket 75-200K)
8. Net aksiyon önermek (görüşme, WhatsApp, teklif formu)

İletişim: +90 545 278 80 73 (telefon ve WhatsApp), info@vexabiz.com. Danışman, görüşme, fiyat veya teklif isteyen ziyaretçiye bu numarayı ve sitedeki iletişim formunu paylaş.

Cevaplarında kısa ve net ol (max 3-4 cümle), samimi ama profesyonel, somut rakamlar kullan, sonunda aksiyon öner.`;

  const DEMOS = {
    meta: "Meta Business Manager kurulumumuz 3-7 günde tamamlanır: işletme hesabı + BM doğrulama, sayfa ve reklam hesabı kurulumu, Meta Pixel + CAPI, GA4 ölçüm eşlemesi. Kurulum 7.500 TL'den başlıyor. Ücretsiz keşif için iletişim formumuzu doldurabilirsiniz.",
    web: "Kurumsal web sitenizi 15-30 günde teslim ediyoruz. SEO altyapısı, mobil uyumlu tasarım, hızlı yayın ve CMS dahil. Kurulum 20.000 TL'den başlıyor. Sektörünüze göre örnek çalışmalarımızı gösterebilirim.",
    crm: "İşletmenize en uygun CRM'i birlikte seçiyoruz: HubSpot, Bitrix24, Pipedrive veya yerli çözümler. Kurulum + pipeline + entegrasyon 15.000 TL'den başlıyor, 7-15 günde teslim.",
    ai: "İşletmenize özel yapay zeka çalışanı geliştiriyoruz: web + WhatsApp + Instagram + Messenger tek noktada. RAG bilgi tabanı, kendi verilerinizle çalışır. 25.000 TL'den başlayan fiyatlarla 15-45 günde teslim.",
    full: "Tam dijital dönüşüm paketimiz Meta + Web + CRM + AI'ı uçtan uca sunar. Tek sözleşme, tek ekip, 6 ay ücretsiz destek. Kurulum 75.000 TL'den başlıyor.",
    handoff: "Tabii, sizi hemen danışmanımıza yönlendiriyorum. +90 545 278 80 73 numaramızdan arayabilir veya WhatsApp'tan yazabilirsiniz.",
    general: "Merhaba 👋 Vexabiz Digital'a hoş geldiniz! KOBİ'lere Meta Business Manager, kurumsal web sitesi, CRM ve yapay zeka çalışanı hizmetleri sunuyoruz. Hangi hizmet hakkında bilgi istersiniz?",
  };

  const SUGGESTIONS = {
    meta: ['Meta BM kurulumu kaç gün sürer?', 'Pixel + CAPI dahil mi?', 'Fiyat teklifi al'],
    web: ['Hangi teknolojiler?', 'SEO dahil mi?', 'Fiyat teklifi al'],
    crm: ['Hangi CRM uygun?', 'Entegrasyon olur mu?', 'Fiyat teklifi al'],
    ai: ['Omnichannel mi?', 'Kendi verilerimle mi?', 'Fiyat teklifi al'],
    full: ['Paket içeriği?', '6 ay destek?', 'Fiyat teklifi al'],
    handoff: [],
    general: ['Meta Business Manager', 'Kurumsal web sitesi', 'CRM kurulumu', 'Yapay zeka çalışanı'],
  };

  function detectIntent(m) {
    const s = (m || '').toLowerCase();
    for (let i = 0; i < HANDOFF_KEYWORDS.length; i++) {
      if (s.indexOf(HANDOFF_KEYWORDS[i]) !== -1) return 'handoff';
    }
    if (/(meta|facebook|instagram|business manager|pixel|capi|reklam|ads)/.test(s)) return 'meta';
    if (/(web|site|web sitesi|kurumsal|e-ticaret|seo|landing)/.test(s)) return 'web';
    if (/(crm|hubspot|bitrix|pipedrive|pipeline|müşteri yönetimi)/.test(s)) return 'crm';
    if (/(yapay zeka|ai|bot|asistan|otomasyon|chatgpt|gpt|gemini|whatsapp bot)/.test(s)) return 'ai';
    if (/(paket|dönüşüm|donusum|uçtan uca|uctan uca)/.test(s)) return 'full';
    return 'general';
  }

  function getBotSettings() {
    try {
      const items = $app.dao().findRecordsByFilter('bot_settings', 'id != ""', '-created', 1, 0);
      if (items && items.length > 0) return items[0];
    } catch (_) {}
    return null;
  }

  const info = $apis.requestInfo(e);
  const body = info.data || {};
  const message = (body.message || '').toString().trim();
  if (!message) {
    return e.json(400, { error: 'message required' });
  }

  const intent = detectIntent(message);
  const settings = getBotSettings();
  const apiKey = $os.getenv('GEMINI_API_KEY') || '';
  const modelName = $os.getenv('GEMINI_MODEL') || 'gemini-flash-latest';

  let reply = '';
  let usedAI = false;

  if (apiKey && apiKey.length > 10) {
    try {
      let sysPrompt = DEFAULT_SYSTEM;
      if (settings && settings.get('system_prompt')) sysPrompt = settings.get('system_prompt');

      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      const contents = [];
      for (const h of history) {
        contents.push({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: String(h.content || '') }] });
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const res = $http.send({
        url: 'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + apiKey,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: sysPrompt }] },
          contents: contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
        timeout: 30,
      });
      if (res.statusCode === 200 && res.json) {
        const data = res.json;
        const cand = data.candidates && data.candidates[0];
        const content = cand && cand.content;
        const parts = content && content.parts;
        const first = parts && parts[0];
        reply = (first && first.text) || '';
        usedAI = !!reply;
      }
    } catch (err) {
      console.log('gemini error: ' + String(err));
    }
  }

  if (!reply) {
    reply = DEMOS[intent] || DEMOS.general;
  }

  return e.json(200, {
    reply: reply,
    intent: intent,
    suggestions: SUGGESTIONS[intent] || SUGGESTIONS.general,
    ai: usedAI,
  });
});

// GET /api/webhook/meta — Meta webhook doğrulama
routerAdd('GET', '/api/webhook/meta', (e) => {
  const info = $apis.requestInfo(e);
  const q = info.query || {};
  const mode = q['hub.mode'];
  const token = q['hub.verify_token'];
  const challenge = q['hub.challenge'];
  const expected = $os.getenv('META_VERIFY_TOKEN') || 'vexabiz-verify-token';
  if (mode === 'subscribe' && token === expected) {
    return e.string(200, challenge || '');
  }
  return e.string(403, 'Forbidden');
});

// POST /api/webhook/meta — gelen mesajlar
routerAdd('POST', '/api/webhook/meta', (e) => {
  const info = $apis.requestInfo(e);
  const body = info.data || {};
  console.log('[webhook/meta] ' + JSON.stringify(body).slice(0, 400));
  // TODO: mesaj parse → contacts + conversations + messages kaydet → bot cevap → Meta'ya geri gönder
  return e.json(200, { ok: true });
});
