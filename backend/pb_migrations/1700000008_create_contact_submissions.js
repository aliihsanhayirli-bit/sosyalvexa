// Contact form submissions (herkese açık form için ayrı tablo)

migrate((db) => {
  const collection = new Collection({
    name: 'contact_submissions',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'name', type: 'text', required: true, options: { max: 200 } },
      { name: 'phone', type: 'text', required: true, options: { max: 50 } },
      { name: 'email', type: 'email', required: false, options: { max: 200 } },
      { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['buyer', 'seller', 'invest', 'other'] } },
      { name: 'subject', type: 'text', required: false, options: { max: 200 } },
      { name: 'message', type: 'text', required: true, options: { max: 5000 } },
      { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['new', 'contacted', 'archived'] } },
      { name: 'source_url', type: 'text', required: false, options: { max: 500 } },
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('contact_submissions');
});
