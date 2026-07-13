// Timeline events — CRM kişi kartında gösterilen kronolojik olaylar

migrate((db) => {
  const collection = new Collection({
    name: 'timeline_events',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'contact', type: 'relation', required: true, options: { collectionId: 'contacts', cascadeDelete: true, maxSelect: 1 } },
      { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['message', 'status_change', 'note', 'photo_sent', 'listing_shared', 'created'] } },
      { name: 'title', type: 'text', required: true, options: { max: 200 } },
      { name: 'description', type: 'text', required: false, options: { max: 2000 } },
      { name: 'ref_id', type: 'text', required: false, options: { max: 200 } },
      { name: 'meta', type: 'json', required: false, options: {} },
      { name: 'attachments', type: 'file', required: false, options: { maxSelect: 5, maxSize: 16777216, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] } },
      { name: 'actor', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
    ],
    indexes: [
      'CREATE INDEX idx_timeline_contact ON timeline_events (contact)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('timeline_events');
});
