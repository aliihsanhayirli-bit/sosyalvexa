// PocketBase hook: mesaj oluşturulunca conversation.last_message_at güncellenir.
// 2026-07-18 — e.next() kaldırıldı (PB 0.22 after-hooks'unda next() bazı
//   collection'larda TypeError fırlatıyor, request response'u etkileyip
//   generic 400 dönüyordu). e.record.get() kullanılıyor.

/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'messages') return;
  const convId = String(e.record.get('conversation') || '');
  if (!convId) {
    console.warn('[messages hook] conversation relation boş, atlandı');
    return;
  }
  try {
    const conv = $app.dao().findRecordById('conversations', convId);
    conv.set('last_message_at', new Date().toISOString());
    $app.dao().saveRecord(conv);
    console.log('[messages hook] conversation last_message_at güncellendi:', convId);

    const contact = conv.get('contact');
    if (contact) {
      const timelineCol = $app.dao().findCollectionByNameOrId('timeline_events');
      const sender = String(e.record.get('sender') || 'system');
      const title = sender === 'customer' ? 'Müşteri mesajı' : sender === 'bot' ? 'Bot mesajı' : 'Danışman mesajı';
      const ev = new Record(timelineCol, {
        contact,
        type: 'message',
        title,
        description: String(e.record.get('content') || '').slice(0, 200),
        ref_id: e.record.get('id'),
        meta: { sender, channel: conv.get('channel') },
      });
      $app.dao().saveRecord(ev);
    }
  } catch (err) {
    console.error('[messages hook] error:', String(err));
  }
}, 'messages');

onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'contacts') return;
  try {
    const timelineCol = $app.dao().findCollectionByNameOrId('timeline_events');
    const ev = new Record(timelineCol, {
      contact: e.record.get('id'),
      type: 'created',
      title: 'Kişi oluşturuldu',
      description: `${e.record.get('source') || 'bilinmeyen'} kanalından`,
      meta: { source: String(e.record.get('source') || ''), type: String(e.record.get('type') || '') },
    });
    $app.dao().saveRecord(ev);
  } catch (err) {
    console.error('[contacts hook] error:', String(err));
  }
}, 'contacts');
