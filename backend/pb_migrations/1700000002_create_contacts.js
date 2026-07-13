// YCA Yatırım — Contacts (CRM) collection

migrate((db) => {
  const collection = new Collection({
    name: 'contacts',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '', // bot tarafından da oluşturulabilir
    updateRule: '@request.auth.role = "admin" || assigned_to = @request.auth.id',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'name', type: 'text', required: true, options: { min: 2, max: 200 } },
      { name: 'phone', type: 'text', required: false, options: { max: 50 } },
      { name: 'email', type: 'email', required: false, options: { max: 200 } },
      { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['buyer', 'seller'] } },
      { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['new', 'contacted', 'qualified', 'visit_scheduled', 'offer', 'won', 'lost'] } },
      { name: 'source', type: 'select', required: true, options: { maxSelect: 1, values: ['web', 'whatsapp', 'facebook', 'instagram'] } },
      { name: 'assigned_to', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
      { name: 'tags', type: 'json', required: false, options: {} },
      { name: 'notes', type: 'text', required: false, options: { max: 5000 } },
      { name: 'interested_listing', type: 'relation', required: false, options: { collectionId: 'listings', cascadeDelete: false, maxSelect: 1 } },
      { name: 'budget_min', type: 'number', required: false, options: {} },
      { name: 'budget_max', type: 'number', required: false, options: {} },
      { name: 'preferred_region', type: 'text', required: false, options: { max: 100 } },
      { name: 'preferred_area_min', type: 'number', required: false, options: {} },
      { name: 'preferred_area_max', type: 'number', required: false, options: {} },
      { name: 'external_id', type: 'text', required: false, options: { max: 200 } }, // whatsapp/messenger id
    ],
    indexes: [
      'CREATE INDEX idx_contacts_status ON contacts (status)',
      'CREATE INDEX idx_contacts_source ON contacts (source)',
      'CREATE INDEX idx_contacts_type ON contacts (type)',
      'CREATE UNIQUE INDEX idx_contacts_external_id ON contacts (source, external_id) WHERE external_id != ""',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('contacts');
});
