// Vexabiz Digital — chat API + Meta webhook hook'ları
// /api/chat          → Gemini (server-side key) + intent fallback + CRM kaydı
// /api/webhook/meta  → Meta Messenger/Instagram webhook (CRM kaydı + bot cevap)
//
// NOT: PB 0.22 JSVM'de dosya top-level scope'u route callback'lerine TAŞINMIYOR
// (globalThis atamaları bile kayboluyor — doğrulandı). Bu yüzden her callback
// kendi yardımcılarını içinde tanımlıyor; iki route arasında kopya var.

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

  function getOrCreateThread(extId, name, source, channel) {
    let contact = null;
    try {
      contact = $app.dao().findFirstRecordByFilter('contacts', 'external_id = {:ext}', { ext: extId });
    } catch (_) {}

    if (!contact) {
      contact = new Record($app.dao().findCollectionByNameOrId('contacts'), {
        name: name,
        type: 'other',
        status: 'new',
        source: source,
        external_id: extId,
      });
      $app.dao().saveRecord(contact);
    }

    let conv = null;
    try {
      conv = $app.dao().findFirstRecordByFilter('conversations', 'contact = {:cid} && channel = {:ch}', { cid: contact.id, ch: channel });
    } catch (_) {}

    const now = new Date().toISOString();
    if (!conv) {
      conv = new Record($app.dao().findCollectionByNameOrId('conversations'), {
        contact: contact.id,
        channel: channel,
        started_at: now,
        last_message_at: now,
        bot_active: true,
        unread_count: 0,
      });
      $app.dao().saveRecord(conv);
    }

    return conv;
  }

  function saveMessages(conv, message, reply) {
    const msgCol = $app.dao().findCollectionByNameOrId('messages');
    $app.dao().saveRecord(new Record(msgCol, {
      conversation: conv.id,
      sender: 'customer',
      content: message,
      type: 'text',
    }));
    $app.dao().saveRecord(new Record(msgCol, {
      conversation: conv.id,
      sender: 'bot',
      content: reply,
      type: 'text',
    }));
    conv.set('last_message_at', new Date().toISOString());
    conv.set('unread_count', (parseInt(conv.get('unread_count'), 10) || 0) + 1);
    $app.dao().saveRecord(conv);
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

  try {
    const visitor = String(body.visitor || '').trim().slice(0, 64) || 'anon';
    const conv = getOrCreateThread('web:' + visitor, 'Web Ziyaretçi', 'web', 'web');
    saveMessages(conv, message, reply);
  } catch (err) {
    console.log('chat persist error: ' + String(err));
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

// POST /api/webhook/meta — Messenger / Instagram gelen mesajlar
routerAdd('POST', '/api/webhook/meta', (e) => {
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

  function botReply(message, history) {
    const intent = detectIntent(message);
    const settings = getBotSettings();
    const apiKey = $os.getenv('GEMINI_API_KEY') || '';
    const modelName = $os.getenv('GEMINI_MODEL') || 'gemini-flash-latest';

    let reply = '';
    if (apiKey && apiKey.length > 10) {
      try {
        let sysPrompt = DEFAULT_SYSTEM;
        if (settings && settings.get('system_prompt')) sysPrompt = settings.get('system_prompt');

        const contents = [];
        const hist = (history || []).slice(-8);
        for (const h of hist) {
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
        }
      } catch (err) {
        console.log('gemini error: ' + String(err));
      }
    }
    if (!reply) reply = DEMOS[intent] || DEMOS.general;
    return reply;
  }

  function getOrCreateThread(extId, name, source, channel) {
    let contact = null;
    try {
      contact = $app.dao().findFirstRecordByFilter('contacts', 'external_id = {:ext}', { ext: extId });
    } catch (_) {}

    if (!contact) {
      contact = new Record($app.dao().findCollectionByNameOrId('contacts'), {
        name: name,
        type: 'other',
        status: 'new',
        source: source,
        external_id: extId,
      });
      $app.dao().saveRecord(contact);
    } else {
      const cur = String(contact.get('name') || '');
      if (name && cur !== name && (cur.indexOf('Kullanıcı') !== -1 || cur === 'Web Ziyaretçi')) {
        contact.set('name', name);
        try { $app.dao().saveRecord(contact); } catch (_) {}
      }
    }

    let conv = null;
    try {
      conv = $app.dao().findFirstRecordByFilter('conversations', 'contact = {:cid} && channel = {:ch}', { cid: contact.id, ch: channel });
    } catch (_) {}

    const now = new Date().toISOString();
    if (!conv) {
      conv = new Record($app.dao().findCollectionByNameOrId('conversations'), {
        contact: contact.id,
        channel: channel,
        started_at: now,
        last_message_at: now,
        bot_active: true,
        unread_count: 0,
      });
      $app.dao().saveRecord(conv);
    }

    return conv;
  }

  function saveMessages(conv, message, reply) {
    const msgCol = $app.dao().findCollectionByNameOrId('messages');
    $app.dao().saveRecord(new Record(msgCol, {
      conversation: conv.id,
      sender: 'customer',
      content: message,
      type: 'text',
    }));
    $app.dao().saveRecord(new Record(msgCol, {
      conversation: conv.id,
      sender: 'bot',
      content: reply,
      type: 'text',
    }));
    conv.set('last_message_at', new Date().toISOString());
    conv.set('unread_count', (parseInt(conv.get('unread_count'), 10) || 0) + 1);
    $app.dao().saveRecord(conv);
  }

  function getHistory(convId) {
    const items = [];
    try {
      const recs = $app.dao().findRecordsByFilter('messages', 'conversation = {:cid}', '-created', 8, 0, { cid: convId });
      recs.reverse();
      for (const r of recs) {
        items.push({ role: r.get('sender') === 'bot' ? 'model' : 'user', content: String(r.get('content') || '') });
      }
    } catch (_) {}
    return items;
  }

  function sendMetaReply(recipientId, text) {
    const token = $os.getenv('META_PAGE_ACCESS_TOKEN') || '';
    if (!token) {
      console.log('[meta] META_PAGE_ACCESS_TOKEN yok, cevap gönderilemedi');
      return false;
    }
    try {
      const res = $http.send({
        url: 'https://graph.facebook.com/v21.0/me/messages?access_token=' + token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_type: 'RESPONSE',
          recipient: { id: recipientId },
          message: { text: String(text).slice(0, 1900) },
        }),
        timeout: 15,
      });
      if (res.statusCode !== 200) {
        console.log('[meta] send hata: ' + res.statusCode + ' ' + String(res.raw || '').slice(0, 300));
        return false;
      }
      return true;
    } catch (err) {
      console.log('[meta] send exception: ' + String(err));
      return false;
    }
  }

  function getMetaProfile(senderId, channel) {
    const token = $os.getenv('META_PAGE_ACCESS_TOKEN') || '';
    const fallback = channel === 'instagram' ? 'Instagram Kullanıcı' : 'Messenger Kullanıcı';
    if (!token) return fallback;
    try {
      const fields = channel === 'instagram' ? 'name,username' : 'first_name,last_name';
      const res = $http.send({
        url: 'https://graph.facebook.com/v21.0/' + senderId + '?fields=' + fields + '&access_token=' + token,
        method: 'GET',
        timeout: 10,
      });
      if (res.statusCode === 200 && res.json) {
        const j = res.json;
        if (channel === 'instagram') return j.name || j.username || fallback;
        const n = ((j.first_name || '') + ' ' + (j.last_name || '')).trim();
        return n || fallback;
      }
    } catch (_) {}
    return fallback;
  }

  const info = $apis.requestInfo(e);
  const body = info.data || {};
  const object = String(body.object || '');

  if (object === 'whatsapp_business_account') {
    console.log('[webhook/meta] whatsapp event (WA token henüz yok, işlenmedi)');
    return e.json(200, { ok: true });
  }

  const channel = object === 'instagram' ? 'instagram' : 'facebook';
  const entries = body.entry || [];
  let handled = 0;

  for (const entry of entries) {
    const events = entry.messaging || [];
    for (const ev of events) {
      try {
        const senderId = ev.sender && ev.sender.id;
        if (!senderId) continue;
        if (ev.delivery || ev.read) continue;

        let text = '';
        if (ev.message && !ev.message.is_echo && ev.message.text) text = String(ev.message.text);
        if (!text && ev.postback && ev.postback.title) text = String(ev.postback.title);
        if (!text) continue;

        const name = getMetaProfile(senderId, channel);
        const conv = getOrCreateThread(channel + ':' + senderId, name, channel, channel);
        const history = getHistory(conv.id);
        const reply = botReply(text, history);
        saveMessages(conv, text, reply);
        sendMetaReply(senderId, reply);
        handled++;
      } catch (err) {
        console.log('[webhook/meta] event error: ' + String(err));
      }
    }
  }

  return e.json(200, { ok: true, handled: handled });
});
