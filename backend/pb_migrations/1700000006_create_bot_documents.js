// Bot documents — RAG için embedding'lenmiş dokümanlar

migrate((db) => {
  const collection = new Collection({
    name: 'bot_documents',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'title', type: 'text', required: true, options: { max: 200 } },
      { name: 'source', type: 'text', required: false, options: { max: 200 } },
      { name: 'file', type: 'file', required: false, options: { maxSelect: 1, maxSize: 33554432, mimeTypes: ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } },
      { name: 'raw_text', type: 'text', required: false, options: { max: 1000000 } },
      { name: 'chunks', type: 'json', required: false, options: {} }, // [{ text, embedding: number[] }]
      { name: 'chunk_count', type: 'number', required: false, options: {} },
      { name: 'active', type: 'bool', required: true, options: {} },
      { name: 'uploaded_by', type: 'relation', required: false, options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1 } },
    ],
    indexes: [
      'CREATE INDEX idx_bot_documents_active ON bot_documents (active)',
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('bot_documents');
});
