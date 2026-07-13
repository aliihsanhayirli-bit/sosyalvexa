// YCA Yatırım — PocketBase v0.21+ JS Migration
// Listings (arsalar) collection

migrate((db) => {
  const collection = new Collection({
    name: 'listings',
    type: 'base',
    listRule: 'published = true',
    viewRule: 'published = true',
    createRule: '@request.auth.role = "admin" || @request.auth.role = "agent"',
    updateRule: '@request.auth.role = "admin" || (@request.auth.role = "agent" && assigned_to = @request.auth.id)',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'title', type: 'text', required: true, options: { min: 5, max: 200 } },
      { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
      { name: 'description', type: 'text', required: true, options: { max: 5000 } },
      { name: 'price', type: 'number', required: true, options: { min: 0 } },
      { name: 'currency', type: 'select', required: true, options: { maxSelect: 1, values: ['TRY', 'USD'] } },
      { name: 'area_m2', type: 'number', required: true, options: { min: 1 } },
      { name: 'imar_status', type: 'text', required: false, options: { max: 200 } },
      { name: 'tapu_status', type: 'text', required: false, options: { max: 200 } },
      { name: 'region', type: 'text', required: true, options: { max: 100 } },
      { name: 'city', type: 'text', required: true, options: { max: 100 } },
      { name: 'neighborhood', type: 'text', required: false, options: { max: 200 } },
      { name: 'lat', type: 'number', required: false, options: {} },
      { name: 'lng', type: 'number', required: false, options: {} },
      { name: 'photos', type: 'file', required: false, options: { maxSelect: 20, maxSize: 8388608, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] } },
      { name: 'documents', type: 'file', required: false, options: { maxSelect: 10, maxSize: 16777216, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } },
      { name: 'features', type: 'json', required: false, options: {} },
      { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['available', 'reserved', 'sold'] } },
      { name: 'published', type: 'bool', required: false, options: {} },
      { name: 'featured', type: 'bool', required: false, options: {} },
      { name: 'assigned_to', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
      { name: 'view_count', type: 'number', required: false, options: {} },
    ],
    indexes: [
      'CREATE INDEX idx_listings_slug ON listings (slug)',
      'CREATE INDEX idx_listings_region ON listings (region)',
      'CREATE INDEX idx_listings_status ON listings (status)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('listings');
});
