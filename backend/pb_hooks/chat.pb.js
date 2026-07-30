// Vexabiz Digital — chat API + Meta webhook hook'ları
// /api/chat          → Gemini (server-side key) + intent fallback + CRM kaydı + randevu
// /api/webhook/meta  → Meta Messenger/Instagram webhook (CRM kaydı + bot cevap + randevu)
//
// NOT: PB 0.22 JSVM'de dosya top-level scope'u route callback'lerine TAŞINMIYOR
// (globalThis atamaları bile kayboluyor — doğrulandı). Bu yüzden her callback
// kendi yardımcılarını içinde tanımlıyor; iki route arasında kopya var.

// POST /api/chat — site ChatWidget
routerAdd('POST', '/api/chat', (e) => {
  const HANDOFF_KEYWORDS = ['danışman', 'danisman', 'insan', 'kişi', 'arayın', 'arayin', 'telefon', 'görüşme', 'gorisme', 'görüşelim', 'goruseylim', 'fiyat', 'teklif', 'sözleşme'];

  const DEFAULT_SYSTEM = `Sen Vexabiz Digital'ın yapay zeka satış asistanısın. Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.; diş klinikleri, fizik tedavi merkezleri, güzellik merkezleri ve KOBİ'ler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette, müşteriye özel VPS sunucuda kuran bir dijital dönüşüm firmasıdır.

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

  const DEMOS = {
    meta: "Meta Business Manager kurulumumuz 3-7 günde tamamlanır: işletme hesabı + şirket doğrulaması, sayfa ve reklam hesabı, Meta Pixel + CAPI. 7.500 TL'den başlıyor (+ KDV). Ücretsiz keşif için randevu oluşturabilirim — hangi gün size uygun?",
    web: "Kurumsal web sitenizi 7-10 iş gününde teslim ediyoruz: mobil uyumlu tasarım, SEO altyapısı, SSL, domain ve kurumsal mail dahil. 22.500 TL'den başlıyor (+ KDV). Sektörünüze göre örnek çalışmalarımızı paylaşabilirim.",
    crm: "Hasta ve müşteri kayıtlarınızı tek panelde topluyoruz: formlar, teklif, randevu ve hatırlatmalar. Temel CRM 18.000 TL, gelişmiş CRM 45.000 TL'den başlıyor (+ KDV).",
    ai: "Yapay zeka asistanınız web sitenizde, WhatsApp, Instagram DM ve Messenger'da 7/24 çalışır; soruları yanıtlar, bilgi toplar ve randevu oluşturur. 35.000 TL'den başlıyor (+ KDV).",
    full: "İki paketimiz var: Dijital Başlangıç 69.900 TL (web sitesi + Meta altyapısı + temel CRM + VPS, 7-10 iş günü) ve Dijital Klinik Pro 149.900 TL (üzerine gelişmiş CRM, AI asistan, randevu sistemi, admin paneli, 15-25 iş günü). Fiyatlara KDV eklenir. Hangisini anlatayım?",
    randevu: "Memnuniyetle! Pazartesi-Cumartesi 09:00-19:00 arasında çalışıyoruz. Hangi gün ve saat size uygun?",
    handoff: "Tabii, sizi hemen danışmanımıza yönlendiriyorum. +90 545 278 80 73 numaramızdan arayabilir veya WhatsApp'tan yazabilirsiniz.",
    general: "Merhaba 👋 Vexabiz Digital'a hoş geldiniz! Klinikler ve işletmeler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette kuruyoruz. Size nasıl yardımcı olabilirim?",
  };

  const SUGGESTIONS = {
    meta: ['Doğrulama dahil mi?', 'Pixel + CAPI dahil mi?', 'Randevu al'],
    web: ['Neler dahil?', 'Kaç günde teslim?', 'Randevu al'],
    crm: ['Temel ve gelişmiş farkı?', 'Randevu sistemi var mı?', 'Randevu al'],
    ai: ['Hangi kanallarda çalışır?', 'Randevu oluşturur mu?', 'Randevu al'],
    full: ['Dijital Başlangıç Paketi', 'Dijital Klinik Pro', 'Randevu al'],
    randevu: ['Yarın 10:00', 'Haftaya cuma 14:00'],
    handoff: [],
    general: ['Dijital Başlangıç Paketi', 'Dijital Klinik Pro', 'Randevu almak istiyorum', 'Bakım paketleri'],
  };

  const APPT_PROTOCOL = `

RANDEVU PROTOKOLÜ (çok önemli):
- Ziyaretçi görüşme/randevu istediğinde uygun gün ve saat öner; gün+saati netleştir ve teyit ettir.
- Gün ve saat NET olarak anlaşıldığında yanıtının EN SONUNA, müşteriye göstermeden şu etiketi ekle:
[[RANDEVU:{"date":"YYYY-MM-DD HH:mm","service":"ilgili hizmet/paket","phone":"varsa telefon","notes":"kısa not"}]]
- Tarih veya saat net değilse etiketi ASLA yazma; önce netleştir.
- Çalışma saatleri: Pazartesi-Cumartesi 09:00-19:00. Saat dışı istekte en yakın uygun zamanı öner.`;

  function trNow() {
    const t = new Date(Date.now() + 3 * 3600 * 1000);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const p = (n) => String(n).padStart(2, '0');
    return days[t.getUTCDay()] + ' ' + p(t.getUTCDate()) + '.' + p(t.getUTCMonth() + 1) + '.' + t.getUTCFullYear() + ' ' + p(t.getUTCHours()) + ':' + p(t.getUTCMinutes());
  }

  function detectIntent(m) {
    const s = (m || '').toLowerCase();
    for (let i = 0; i < HANDOFF_KEYWORDS.length; i++) {
      if (s.indexOf(HANDOFF_KEYWORDS[i]) !== -1) return 'handoff';
    }
    if (/(randevu|müsaitlik|musaitlik|görüşme saati)/.test(s)) return 'randevu';
    if (/(meta|facebook|instagram|business manager|pixel|capi|reklam|ads)/.test(s)) return 'meta';
    if (/(web|site|web sitesi|kurumsal|e-ticaret|seo|landing)/.test(s)) return 'web';
    if (/(crm|hasta takip|müşteri yönetimi|musteri yonetimi)/.test(s)) return 'crm';
    if (/(yapay zeka|ai|bot|asistan|otomasyon|chatgpt|gpt|gemini|whatsapp bot)/.test(s)) return 'ai';
    if (/(paket|dönüşüm|donusum|uçtan uca|uctan uca|klinik pro|başlangıç paketi)/.test(s)) return 'full';
    return 'general';
  }

  function getBotSettings() {
    try {
      const items = $app.dao().findRecordsByFilter('bot_settings', 'id != ""', '-created', 1, 0);
      if (items && items.length > 0) return items[0];
    } catch (_) {}
    return null;
  }

  function buildSystemPrompt(settings) {
    let sys = DEFAULT_SYSTEM;
    if (settings && settings.get('system_prompt')) sys = String(settings.get('system_prompt'));
    if (sys.indexOf('[[RANDEVU:') === -1) sys += APPT_PROTOCOL;
    sys += '\n\nBugün (Türkiye saati): ' + trNow() + '. "Yarın", "haftaya", "cumaya" gibi ifadeleri buna göre gerçek tarihe çevir.';
    return sys;
  }

  function extractAppointment(reply) {
    const m = String(reply || '').match(/\[\[RANDEVU:(\{[\s\S]*?\})\]\]/);
    if (!m) return { text: reply, appt: null };
    let appt = null;
    try { appt = JSON.parse(m[1]); } catch (_) {}
    return { text: String(reply).replace(m[0], '').trim(), appt: appt };
  }

  function createAppointment(conv, appt, channel) {
    if (!appt || !appt.date) return false;
    const dm = String(appt.date).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!dm) return false;
    const utcMs = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +dm[4], +dm[5]) - 3 * 3600 * 1000;
    const nowMs = Date.now();
    if (utcMs < nowMs - 2 * 3600 * 1000 || utcMs > nowMs + 200 * 24 * 3600 * 1000) return false;

    let contact = null;
    try { contact = $app.dao().findRecordById('contacts', String(conv.get('contact'))); } catch (_) {}

    const col = $app.dao().findCollectionByNameOrId('appointments');
    const rec = new Record(col, {
      contact: String(conv.get('contact')),
      conversation: conv.id,
      name: contact ? String(contact.get('name') || 'Müşteri') : 'Müşteri',
      phone: String(appt.phone || (contact ? contact.get('phone') || '' : '')).slice(0, 50),
      service: String(appt.service || '').slice(0, 200),
      date: new Date(utcMs).toISOString(),
      duration_min: 30,
      channel: channel,
      status: 'pending',
      notes: String(appt.notes || '').slice(0, 2000),
      source: 'bot',
    });
    $app.dao().saveRecord(rec);

    if (contact) {
      const st = String(contact.get('status') || '');
      if (st === 'new' || st === 'contacted') {
        contact.set('status', 'visit_scheduled');
        try { $app.dao().saveRecord(contact); } catch (_) {}
      }
      try {
        const timelineCol = $app.dao().findCollectionByNameOrId('timeline_events');
        $app.dao().saveRecord(new Record(timelineCol, {
          contact: contact.id,
          type: 'note',
          title: 'Randevu oluşturuldu',
          description: (String(appt.service || 'Keşif görüşmesi') + ' — ' + String(appt.date)).slice(0, 200),
          ref_id: rec.id,
          meta: { channel: channel, source: 'bot' },
        }));
      } catch (_) {}
    }
    return true;
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
      const sysPrompt = buildSystemPrompt(settings);

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

  const ext = extractAppointment(reply);
  reply = ext.text;
  let booked = false;

  try {
    const visitor = String(body.visitor || '').trim().slice(0, 64) || 'anon';
    const conv = getOrCreateThread('web:' + visitor, 'Web Ziyaretçi', 'web', 'web');
    if (ext.appt) {
      booked = createAppointment(conv, ext.appt, 'web');
      if (!booked) console.log('[chat] randevu etiketi parse edildi ama kayıt oluşturulamadı: ' + JSON.stringify(ext.appt).slice(0, 200));
    }
    saveMessages(conv, message, reply);
  } catch (err) {
    console.log('chat persist error: ' + String(err));
  }

  return e.json(200, {
    reply: reply,
    intent: intent,
    suggestions: SUGGESTIONS[intent] || SUGGESTIONS.general,
    ai: usedAI,
    booked: booked,
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

  const DEFAULT_SYSTEM = `Sen Vexabiz Digital'ın yapay zeka satış asistanısın. Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.; diş klinikleri, fizik tedavi merkezleri, güzellik merkezleri ve KOBİ'ler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette, müşteriye özel VPS sunucuda kuran bir dijital dönüşüm firmasıdır.

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

  const DEMOS = {
    meta: "Meta Business Manager kurulumumuz 3-7 günde tamamlanır: işletme hesabı + şirket doğrulaması, sayfa ve reklam hesabı, Meta Pixel + CAPI. 7.500 TL'den başlıyor (+ KDV). Ücretsiz keşif için randevu oluşturabilirim — hangi gün size uygun?",
    web: "Kurumsal web sitenizi 7-10 iş gününde teslim ediyoruz: mobil uyumlu tasarım, SEO altyapısı, SSL, domain ve kurumsal mail dahil. 22.500 TL'den başlıyor (+ KDV). Sektörünüze göre örnek çalışmalarımızı paylaşabilirim.",
    crm: "Hasta ve müşteri kayıtlarınızı tek panelde topluyoruz: formlar, teklif, randevu ve hatırlatmalar. Temel CRM 18.000 TL, gelişmiş CRM 45.000 TL'den başlıyor (+ KDV).",
    ai: "Yapay zeka asistanınız web sitenizde, WhatsApp, Instagram DM ve Messenger'da 7/24 çalışır; soruları yanıtlar, bilgi toplar ve randevu oluşturur. 35.000 TL'den başlıyor (+ KDV).",
    full: "İki paketimiz var: Dijital Başlangıç 69.900 TL (web sitesi + Meta altyapısı + temel CRM + VPS, 7-10 iş günü) ve Dijital Klinik Pro 149.900 TL (üzerine gelişmiş CRM, AI asistan, randevu sistemi, admin paneli, 15-25 iş günü). Fiyatlara KDV eklenir. Hangisini anlatayım?",
    randevu: "Memnuniyetle! Pazartesi-Cumartesi 09:00-19:00 arasında çalışıyoruz. Hangi gün ve saat size uygun?",
    handoff: "Tabii, sizi hemen danışmanımıza yönlendiriyorum. +90 545 278 80 73 numaramızdan arayabilir veya WhatsApp'tan yazabilirsiniz.",
    general: "Merhaba 👋 Vexabiz Digital'a hoş geldiniz! Klinikler ve işletmeler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette kuruyoruz. Size nasıl yardımcı olabilirim?",
  };

  const APPT_PROTOCOL = `

RANDEVU PROTOKOLÜ (çok önemli):
- Ziyaretçi görüşme/randevu istediğinde uygun gün ve saat öner; gün+saati netleştir ve teyit ettir.
- Gün ve saat NET olarak anlaşıldığında yanıtının EN SONUNA, müşteriye göstermeden şu etiketi ekle:
[[RANDEVU:{"date":"YYYY-MM-DD HH:mm","service":"ilgili hizmet/paket","phone":"varsa telefon","notes":"kısa not"}]]
- Tarih veya saat net değilse etiketi ASLA yazma; önce netleştir.
- Çalışma saatleri: Pazartesi-Cumartesi 09:00-19:00. Saat dışı istekte en yakın uygun zamanı öner.`;

  function trNow() {
    const t = new Date(Date.now() + 3 * 3600 * 1000);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const p = (n) => String(n).padStart(2, '0');
    return days[t.getUTCDay()] + ' ' + p(t.getUTCDate()) + '.' + p(t.getUTCMonth() + 1) + '.' + t.getUTCFullYear() + ' ' + p(t.getUTCHours()) + ':' + p(t.getUTCMinutes());
  }

  function detectIntent(m) {
    const s = (m || '').toLowerCase();
    for (let i = 0; i < HANDOFF_KEYWORDS.length; i++) {
      if (s.indexOf(HANDOFF_KEYWORDS[i]) !== -1) return 'handoff';
    }
    if (/(randevu|müsaitlik|musaitlik|görüşme saati)/.test(s)) return 'randevu';
    if (/(meta|facebook|instagram|business manager|pixel|capi|reklam|ads)/.test(s)) return 'meta';
    if (/(web|site|web sitesi|kurumsal|e-ticaret|seo|landing)/.test(s)) return 'web';
    if (/(crm|hasta takip|müşteri yönetimi|musteri yonetimi)/.test(s)) return 'crm';
    if (/(yapay zeka|ai|bot|asistan|otomasyon|chatgpt|gpt|gemini|whatsapp bot)/.test(s)) return 'ai';
    if (/(paket|dönüşüm|donusum|uçtan uca|uctan uca|klinik pro|başlangıç paketi)/.test(s)) return 'full';
    return 'general';
  }

  function getBotSettings() {
    try {
      const items = $app.dao().findRecordsByFilter('bot_settings', 'id != ""', '-created', 1, 0);
      if (items && items.length > 0) return items[0];
    } catch (_) {}
    return null;
  }

  function buildSystemPrompt(settings) {
    let sys = DEFAULT_SYSTEM;
    if (settings && settings.get('system_prompt')) sys = String(settings.get('system_prompt'));
    if (sys.indexOf('[[RANDEVU:') === -1) sys += APPT_PROTOCOL;
    sys += '\n\nBugün (Türkiye saati): ' + trNow() + '. "Yarın", "haftaya", "cumaya" gibi ifadeleri buna göre gerçek tarihe çevir.';
    return sys;
  }

  function extractAppointment(reply) {
    const m = String(reply || '').match(/\[\[RANDEVU:(\{[\s\S]*?\})\]\]/);
    if (!m) return { text: reply, appt: null };
    let appt = null;
    try { appt = JSON.parse(m[1]); } catch (_) {}
    return { text: String(reply).replace(m[0], '').trim(), appt: appt };
  }

  function createAppointment(conv, appt, channel) {
    if (!appt || !appt.date) return false;
    const dm = String(appt.date).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!dm) return false;
    const utcMs = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +dm[4], +dm[5]) - 3 * 3600 * 1000;
    const nowMs = Date.now();
    if (utcMs < nowMs - 2 * 3600 * 1000 || utcMs > nowMs + 200 * 24 * 3600 * 1000) return false;

    let contact = null;
    try { contact = $app.dao().findRecordById('contacts', String(conv.get('contact'))); } catch (_) {}

    const col = $app.dao().findCollectionByNameOrId('appointments');
    const rec = new Record(col, {
      contact: String(conv.get('contact')),
      conversation: conv.id,
      name: contact ? String(contact.get('name') || 'Müşteri') : 'Müşteri',
      phone: String(appt.phone || (contact ? contact.get('phone') || '' : '')).slice(0, 50),
      service: String(appt.service || '').slice(0, 200),
      date: new Date(utcMs).toISOString(),
      duration_min: 30,
      channel: channel,
      status: 'pending',
      notes: String(appt.notes || '').slice(0, 2000),
      source: 'bot',
    });
    $app.dao().saveRecord(rec);

    if (contact) {
      const st = String(contact.get('status') || '');
      if (st === 'new' || st === 'contacted') {
        contact.set('status', 'visit_scheduled');
        try { $app.dao().saveRecord(contact); } catch (_) {}
      }
      try {
        const timelineCol = $app.dao().findCollectionByNameOrId('timeline_events');
        $app.dao().saveRecord(new Record(timelineCol, {
          contact: contact.id,
          type: 'note',
          title: 'Randevu oluşturuldu',
          description: (String(appt.service || 'Keşif görüşmesi') + ' — ' + String(appt.date)).slice(0, 200),
          ref_id: rec.id,
          meta: { channel: channel, source: 'bot' },
        }));
      } catch (_) {}
    }
    return true;
  }

  function botReply(message, history) {
    const intent = detectIntent(message);
    const settings = getBotSettings();
    const apiKey = $os.getenv('GEMINI_API_KEY') || '';
    const modelName = $os.getenv('GEMINI_MODEL') || 'gemini-flash-latest';

    let reply = '';
    if (apiKey && apiKey.length > 10) {
      try {
        const sysPrompt = buildSystemPrompt(settings);

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
        let reply = botReply(text, history);

        const ext = extractAppointment(reply);
        reply = ext.text;
        if (ext.appt) {
          const ok = createAppointment(conv, ext.appt, channel);
          if (!ok) console.log('[webhook/meta] randevu etiketi parse edildi ama kayıt oluşturulamadı');
        }

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
