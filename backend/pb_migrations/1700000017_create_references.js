// Wexabiz Digital — references (referans portföy) collection
// Tamamlanan projeler — sosyal kanıt.

migrate((db) => {
  const collection = new Collection({
    name: 'references',
    type: 'base',
    listRule: 'published = true',
    viewRule: 'published = true',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'title', type: 'text', required: true, options: { min: 2, max: 200 } },
      { name: 'url', type: 'url', required: true, options: { max: 500 } },
      { name: 'description', type: 'text', required: false, options: { max: 1000 } },
      { name: 'tag', type: 'text', required: false, options: { max: 100 } },
      { name: 'year', type: 'text', required: false, options: { max: 10 } },
      { name: 'industry', type: 'text', required: false, options: { max: 100 } },
      { name: 'logo', type: 'file', required: false, options: { maxSelect: 1, maxSize: 2097152, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] } },
      { name: 'order', type: 'number', required: false, options: {} },
      { name: 'published', type: 'bool', required: false, options: {} },
    ],
    indexes: [
      'CREATE INDEX idx_references_order ON references (order)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('references');
});
