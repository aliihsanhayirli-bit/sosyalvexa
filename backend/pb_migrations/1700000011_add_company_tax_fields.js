// Settings — vergi bilgileri eklendi (tax_office, vkn)
// 2026-07-15 — Ofis: Ümit Mah. 2494/4 Sk. No:8 Çankaya/Ankara, Doğanbey VD, VKN 9460564099

migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('settings');
  if (!collection) return;

  collection.schema.addField({ name: 'tax_office', type: 'text', required: false, options: { max: 100 } });
  collection.schema.addField({ name: 'vkn', type: 'text', required: false, options: { max: 20 } });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId('settings');
  if (!collection) return;
  try { collection.schema.removeField('tax_office'); } catch {}
  try { collection.schema.removeField('vkn'); } catch {}
  return dao.saveCollection(collection);
});
