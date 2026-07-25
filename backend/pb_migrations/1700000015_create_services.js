// Wexabiz Digital — services (hizmetler) collection
// Meta BM, Web, CRM, AI Çalışan, Tam Dönüşüm — site genelinde kullanılacak hizmet kartları.

migrate((db) => {
  const collection = new Collection({
    name: 'services',
    type: 'base',
    listRule: 'published = true',
    viewRule: 'published = true',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$', max: 100 } },
      { name: 'title', type: 'text', required: true, options: { min: 3, max: 200 } },
      { name: 'short', type: 'text', required: false, options: { max: 300 } },
      { name: 'desc', type: 'text', required: true, options: { max: 5000 } },
      { name: 'icon', type: 'text', required: false, options: { max: 50 } },
      { name: 'bullets', type: 'json', required: false, options: {} },
      { name: 'price_from', type: 'text', required: false, options: { max: 100 } },
      { name: 'duration', type: 'text', required: false, options: { max: 100 } },
      { name: 'order', type: 'number', required: false, options: {} },
      { name: 'published', type: 'bool', required: false, options: {} },
    ],
    indexes: [
      'CREATE INDEX idx_services_slug ON services (slug)',
      'CREATE INDEX idx_services_order ON services (order)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('services');
});
