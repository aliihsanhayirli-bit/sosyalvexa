// Messages collection

migrate((db) => {
  const collection = new Collection({
    name: 'messages',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '', // bot + webhook
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'conversation', type: 'relation', required: true, options: { collectionId: 'conversations', cascadeDelete: true, maxSelect: 1 } },
      { name: 'sender', type: 'select', required: true, options: { maxSelect: 1, values: ['bot', 'customer', 'agent', 'system'] } },
      { name: 'content', type: 'text', required: true, options: { max: 10000 } },
      { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['text', 'photo', 'listing', 'location', 'document'] } },
      { name: 'payload', type: 'json', required: false, options: {} },
      { name: 'attachments', type: 'file', required: false, options: { maxSelect: 5, maxSize: 16777216, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] } },
      { name: 'external_msg_id', type: 'text', required: false, options: { max: 200 } },
    ],
    indexes: [
      'CREATE INDEX idx_msg_conv ON messages (conversation)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('messages');
});
