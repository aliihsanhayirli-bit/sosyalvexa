// Bot settings — singleton (id="default")

migrate((db) => {
  const collection = new Collection({
    name: 'bot_settings',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'system_prompt', type: 'text', required: true, options: { max: 8000 } },
      { name: 'welcome_message', type: 'text', required: true, options: { max: 2000 } },
      { name: 'handoff_keywords', type: 'json', required: false, options: {} },
      { name: 'rag_top_k', type: 'number', required: false, options: {} },
      { name: 'model', type: 'text', required: false, options: { max: 100 } },
      { name: 'temperature', type: 'number', required: false, options: {} },
      { name: 'enabled', type: 'bool', required: true, options: {} },
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('bot_settings');
});
