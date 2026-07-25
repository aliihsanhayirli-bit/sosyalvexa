// Wexabiz Digital — packages (fiyat paketleri) collection
// Başlangıç / Profesyonel / Kurumsal paketler.

migrate((db) => {
  const collection = new Collection({
    name: 'packages',
    type: 'base',
    listRule: 'published = true',
    viewRule: 'published = true',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$', max: 100 } },
      { name: 'name', type: 'text', required: true, options: { max: 100 } },
      { name: 'tagline', type: 'text', required: false, options: { max: 300 } },
      { name: 'setup', type: 'text', required: false, options: { max: 100 } },
      { name: 'monthly', type: 'text', required: false, options: { max: 100 } },
      { name: 'features', type: 'json', required: false, options: { maxSize: 10000 } },
      { name: 'highlight', type: 'bool', required: false, options: {} },
      { name: 'cta', type: 'text', required: false, options: { max: 100 } },
      { name: 'order', type: 'number', required: false, options: {} },
      { name: 'published', type: 'bool', required: false, options: {} },
    ],
    indexes: [
      'CREATE INDEX idx_packages_slug ON packages (slug)',
      'CREATE INDEX idx_packages_order ON packages (order)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('packages');
});
