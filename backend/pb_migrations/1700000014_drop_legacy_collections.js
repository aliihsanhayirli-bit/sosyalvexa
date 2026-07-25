// Wexabiz Digital — GYD'den dönüşüm
// listings + regions collection'ları silinir, contacts.interested_listing kaldırılır,
// contacts.interested_service (relation) eklenir, contact type 'invest' ve 'other' eklenir.

migrate((db) => {
  // 1. listings tablosu varsa sil
  try {
    Dao(db).deleteCollection('listings');
  } catch (e) {
    console.warn('listings drop atlandı:', e.message);
  }

  // 2. regions tablosu varsa sil
  try {
    Dao(db).deleteCollection('regions');
  } catch (e) {
    console.warn('regions drop atlandı:', e.message);
  }

  // 3. contacts tablosunu güncelle
  const contacts = Dao(db).findCollectionByNameOrId('contacts');
  if (contacts) {
    const schema = contacts.schema || [];

    // interested_listing alanını kaldır
    const filtered = schema.filter((f) => f.name !== 'interested_listing');

    // preferred_region kaldır (artık bölge yok)
    const withoutRegion = filtered.filter((f) => f.name !== 'preferred_region');
    const withoutArea = withoutRegion.filter(
      (f) => f.name !== 'preferred_area_min' && f.name !== 'preferred_area_max',
    );

    // type select values güncelle (buyer/seller + invest/other)
    const typeField = withoutArea.find((f) => f.name === 'type');
    if (typeField && typeField.type === 'select') {
      typeField.options = { ...typeField.options, values: ['buyer', 'seller', 'invest', 'other'] };
    }

    // interested_service relation'ı ekle
    const existingService = withoutArea.find((f) => f.name === 'interested_service');
    if (!existingService) {
      withoutArea.push({
        name: 'interested_service',
        type: 'relation',
        required: false,
        options: { collectionId: 'services', cascadeDelete: false, maxSelect: 1 },
      });
    }

    contacts.schema = withoutArea;
    Dao(db).saveCollection(contacts);
  }
}, (db) => {
  // Geri alma: contacts'a eski alanları ekle
  const contacts = Dao(db).findCollectionByNameOrId('contacts');
  if (contacts) {
    const schema = contacts.schema || [];
    const withoutListing = schema.filter((f) => f.name !== 'interested_listing');
    if (!withoutListing.find((f) => f.name === 'preferred_region')) {
      withoutListing.push({ name: 'preferred_region', type: 'text', required: false, options: { max: 100 } });
    }
    contacts.schema = withoutListing;
    Dao(db).saveCollection(contacts);
  }
});
