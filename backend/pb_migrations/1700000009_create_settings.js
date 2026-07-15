// Settings — singleton firma/iletişim/sosyal medya ayarları (admin paneli Settings.tsx)

migrate((db) => {
  const collection = new Collection({
    name: 'settings',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    schema: [
      { name: 'singleton', type: 'bool', required: false, options: {} },
      { name: 'company_name', type: 'text', required: false, options: { max: 200 } },
      { name: 'brand', type: 'text', required: false, options: { max: 100 } },
      { name: 'tagline', type: 'text', required: false, options: { max: 200 } },
      { name: 'description', type: 'text', required: false, options: { max: 1000 } },
      { name: 'phone', type: 'text', required: false, options: { max: 50 } },
      { name: 'email', type: 'text', required: false, options: { max: 200 } },
      { name: 'address', type: 'text', required: false, options: { max: 500 } },
      { name: 'hours', type: 'text', required: false, options: { max: 200 } },
      { name: 'facebook', type: 'text', required: false, options: { max: 500 } },
      { name: 'instagram', type: 'text', required: false, options: { max: 500 } },
      { name: 'whatsapp', type: 'text', required: false, options: { max: 50 } },
    ],
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  return Dao(db).deleteCollection('settings');
});
