// GYD GRUP — regions collection: stats/highlights JSON maxSize fix
// 2026-07-25 — no-op'a çevrildi: PB 0.22'de schema objesi iterable değil
// (eski sürüm TypeError fırlatıyordu) ve regions zaten 1700000014'te drop ediliyor.

migrate((db) => {
  // no-op
}, (db) => {
  // no-op
});
