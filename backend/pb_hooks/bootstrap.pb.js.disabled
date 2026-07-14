// YCA Yatırım — Bootstrap Hook
// Admin user yoksa ilk serve'de oluşturur (idempotent).
// NOT: PocketBase v0.22'de bu hook çağrısı onBootstrap ile yapılmalı;
// onServe v0.22.21'de tanımsız (ReferenceError atar).

/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  const dao = $app.dao();
  let usersCol;
  try {
    usersCol = dao.findCollectionByNameOrId('users');
  } catch {
    return;
  }

  try {
    dao.findFirstRecordByData(usersCol, 'email', 'admin@ycayatirim.com.tr');
  } catch {
    try {
      const rec = new Record(usersCol, {
        username: 'admin',
        email: 'admin@ycayatirim.com.tr',
        emailVisibility: true,
        password: process.env.YCA_ADMIN_PASSWORD || 'Yca2024!Admin',
        passwordConfirm: process.env.YCA_ADMIN_PASSWORD || 'Yca2024!Admin',
        name: 'YCA Admin',
      });
      dao.saveRecord(rec);
      console.log('[bootstrap] admin user otomatik olusturuldu');
    } catch (err) {
      console.error('[bootstrap] user olusturulamadi:', err);
    }
  }
});
