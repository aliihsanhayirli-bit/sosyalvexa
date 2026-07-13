// Conversations collection — her kanal için ayrı thread

migrate((db) => {
  const collection = new Collection({
    name: 'conversations',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '', // bot
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'contact', type: 'relation', required: true, options: { collectionId: 'contacts', cascadeDelete: true, maxSelect: 1 } },
      { name: 'channel', type: 'select', required: true, options: { maxSelect: 1, values: ['web', 'whatsapp', 'facebook', 'instagram'] } },
      { name: 'started_at', type: 'date', required: true, options: {} },
      { name: 'last_message_at', type: 'date', required: true, options: {} },
      { name: 'bot_active', type: 'bool', required: true, options: {} },
      { name: 'assigned_agent', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
      { name: 'external_thread_id', type: 'text', required: false, options: { max: 200 } },
      { name: 'unread_count', type: 'number', required: false, options: {} },
    ],
    indexes: [
      'CREATE INDEX idx_conv_contact ON conversations (contact)',
      'CREATE INDEX idx_conv_last_msg ON conversations (last_message_at DESC)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('conversations');
});
