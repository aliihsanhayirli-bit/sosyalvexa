// Vexabiz Digital — contact_submissions.type hizmet değerleri
// 2026-07-25 — Form 'meta'/'web' gönderiyor ama şema eski buyer/seller/invest/other
// değerlerinde kalmıştı → tüm form başvuruları 400 validation_invalid_value ile
// reddediliyordu. Değerler hizmet slug'larıyla hizalandı.

migrate((db) => {
  const dao = new Dao(db);
  const col = dao.findCollectionByNameOrId('contact_submissions');
  if (!col) return;
  const f = col.schema.getFieldByName('type');
  if (f && f.type === 'select') {
    f.options = { maxSelect: 1, values: ['meta', 'web', 'crm', 'ai', 'other'] };
  }
  dao.saveCollection(col);
}, (db) => {
  const dao = new Dao(db);
  const col = dao.findCollectionByNameOrId('contact_submissions');
  if (!col) return;
  const f = col.schema.getFieldByName('type');
  if (f && f.type === 'select') {
    f.options = { maxSelect: 1, values: ['buyer', 'seller', 'invest', 'other'] };
  }
  dao.saveCollection(col);
});
