// Regions — bölge detay sayfaları için açıklama, istatistik ve özellikler
// 2026-07-15 — RegionDetail.tsx'in PB'den beslenmesi için

migrate((db) => {
  const dao = new Dao(db);
  const collection = new Collection({
    name: 'regions',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$', max: 50 } },
      { name: 'name', type: 'text', required: true, options: { max: 100 } },
      { name: 'district', type: 'text', required: true, options: { max: 100 } },
      { name: 'highlight', type: 'bool', required: false, options: {} },
      { name: 'description', type: 'text', required: false, options: { max: 1000 } },
      { name: 'stats', type: 'json', required: false, options: {} }, // [{ value, label }]
      { name: 'highlights', type: 'json', required: false, options: {} }, // string[]
      { name: 'cover_image', type: 'file', required: false, options: { maxSelect: 1, maxSize: 8388608, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] } },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_regions_slug ON regions (slug)',
    ],
  });
  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  return dao.deleteCollection('regions');
});
