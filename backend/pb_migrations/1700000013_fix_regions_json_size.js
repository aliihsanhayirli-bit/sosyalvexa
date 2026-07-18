// GYD GRUP — regions collection: stats/highlights JSON maxSize fix
// 2026-07-18 — migration 12'de JSON alanlara maxSize koyulmamıştı, default 0 byte
// düşüyordu. Bu migration maxSize ekleyerek seedable yapıyor.

migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('regions');
  if (!collection) return;

  const schema = collection.schema;
  for (const field of schema) {
    if (field.name === 'stats' || field.name === 'highlights') {
      field.options = { ...(field.options || {}), maxSize: 10000 };
    }
  }
  collection.schema = schema;
  return dao.saveCollection(collection);
}, (db) => {
  // no-op rollback (maxSize eski 0'a dönmez)
});
