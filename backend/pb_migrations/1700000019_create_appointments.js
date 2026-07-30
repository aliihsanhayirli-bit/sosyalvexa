// AI asistanın oluşturduğu randevular (web + Meta kanalları)

migrate((db) => {
  const collection = new Collection({
    name: 'appointments',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'contact', type: 'relation', required: true, options: { collectionId: 'contacts', cascadeDelete: true, maxSelect: 1 } },
      { name: 'conversation', type: 'relation', required: false, options: { collectionId: 'conversations', cascadeDelete: false, maxSelect: 1 } },
      { name: 'name', type: 'text', required: true, options: { max: 200 } },
      { name: 'phone', type: 'text', required: false, options: { max: 50 } },
      { name: 'service', type: 'text', required: false, options: { max: 200 } },
      { name: 'date', type: 'date', required: true },
      { name: 'duration_min', type: 'number', required: false },
      { name: 'channel', type: 'select', required: true, options: { maxSelect: 1, values: ['web', 'whatsapp', 'facebook', 'instagram'] } },
      { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['pending', 'confirmed', 'cancelled', 'done'] } },
      { name: 'notes', type: 'text', required: false, options: { max: 2000 } },
      { name: 'source', type: 'select', required: true, options: { maxSelect: 1, values: ['bot', 'admin'] } },
    ],
    indexes: [
      'CREATE INDEX idx_appointments_date ON appointments (date DESC)',
      'CREATE INDEX idx_appointments_status ON appointments (status)',
      'CREATE INDEX idx_appointments_contact ON appointments (contact)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('appointments');
});
