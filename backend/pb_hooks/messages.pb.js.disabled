// PocketBase hook: mesaj oluşturulunca conversation.last_message_at güncellenir
// ve timeline_events'e bir kayıt düşer.

/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'messages') return e.next();

  const convId = e.record.conversation;
  if (!convId) return e.next();

  try {
    const conv = $app.dao().findRecordById('conversations', convId);
    conv.set('last_message_at', new Date().toISOString());
    $app.dao().saveRecord(conv);

    const contact = conv.get('contact');
    if (contact) {
      const ev = new Record($app.dao().findCollectionByNameOrId('timeline_events'), {
        contact,
        type: 'message',
        title: e.record.sender === 'customer' ? 'Müşteri mesajı' : (e.record.sender === 'bot' ? 'Bot mesajı' : 'Danışman mesajı'),
        description: String(e.record.content).slice(0, 200),
        ref_id: e.record.id,
        meta: { sender: e.record.sender, channel: conv.get('channel') },
      });
      $app.dao().saveRecord(ev);
    }
  } catch (err) {
    console.error('messages hook error', err);
  }

  return e.next();
}, 'messages');

onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'contacts') return e.next();
  try {
    const ev = new Record($app.dao().findCollectionByNameOrId('timeline_events'), {
      contact: e.record.id,
      type: 'created',
      title: 'Kişi oluşturuldu',
      description: `${e.record.source} kanalından`,
      meta: { source: e.record.source, type: e.record.type },
    });
    $app.dao().saveRecord(ev);
  } catch (err) {
    console.error('contacts hook error', err);
  }
  return e.next();
}, 'contacts');
