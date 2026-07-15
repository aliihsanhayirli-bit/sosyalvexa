// RAG için bot_documents rule'larını gevşet:
//   - listRule / viewRule: public (RAG retrieval server-side'dan okusun)
//   - updateRule: public (sadece chunks + chunk_count güncellemesi için; create/delete auth'lu kalır)
// createRule zaten authenticated (mevcut koruma korunur).
// deleteRule hâlâ admin (mevcut koruma korunur).

migrate((db) => {
  const collection = Dao(db).findCollectionByNameOrId('bot_documents');
  collection.listRule = '';
  collection.viewRule = '';
  collection.updateRule = '';
  return Dao(db).saveCollection(collection);
}, (db) => {
  // Down: eski kuralları geri yükle
  const collection = Dao(db).findCollectionByNameOrId('bot_documents');
  collection.listRule = '@request.auth.id != ""';
  collection.viewRule = '@request.auth.id != ""';
  collection.updateRule = '@request.auth.role = "admin"';
  return Dao(db).saveCollection(collection);
});
