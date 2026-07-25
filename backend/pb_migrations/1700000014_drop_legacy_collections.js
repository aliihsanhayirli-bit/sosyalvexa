// Vexabiz Digital — GYD'den dönüşüm
// listings + regions collection'ları silinir, contacts.interested_listing /
// preferred_region / preferred_area_* kaldırılır, type values'a invest/other eklenir,
// contacts.interested_service (relation → services) eklenir.
// 2026-07-25 — PB 0.22 schema API ile yeniden yazıldı:
//   removeField id ile çalışır (name değil), dao.deleteCollection obje ister.

migrate((db) => {
  const dao = new Dao(db);

  const contacts = dao.findCollectionByNameOrId('contacts');

  if (contacts) {
    for (const fname of ['interested_listing', 'preferred_region', 'preferred_area_min', 'preferred_area_max']) {
      try {
        const f = contacts.schema.getFieldByName(fname);
        if (f) contacts.schema.removeField(f.id);
      } catch (e) {
        console.warn(fname + ' kaldirma atlandi: ' + e);
      }
    }

    try {
      const typeField = contacts.schema.getFieldByName('type');
      if (typeField && typeField.type === 'select') {
        typeField.options = { maxSelect: 1, values: ['buyer', 'seller', 'invest', 'other'] };
      }
    } catch (e) {
      console.warn('type values guncelleme atlandi: ' + e);
    }

    try {
      const services = dao.findCollectionByNameOrId('services');
      if (services && !contacts.schema.getFieldByName('interested_service')) {
        contacts.schema.addField({
          name: 'interested_service',
          type: 'relation',
          required: false,
          options: { collectionId: services.id, cascadeDelete: false, maxSelect: 1 },
        });
      }
    } catch (e) {
      console.warn('interested_service ekleme atlandi: ' + e);
    }

    dao.saveCollection(contacts);
  }

  for (const name of ['listings', 'regions']) {
    try {
      const col = dao.findCollectionByNameOrId(name);
      if (col) dao.deleteCollection(col);
    } catch (e) {
      console.warn(name + ' drop atlandi: ' + e);
    }
  }
}, (db) => {
  // geri alma yok (destructive) — oncesi icin pb_data backup kullan
});
