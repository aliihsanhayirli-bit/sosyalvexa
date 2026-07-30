// users.role alanı + settings singleton seed
// users koleksiyonu panelden oluşturulduğu için role alanı yoktu; bu yüzden
// settings (role=admin kuralı) ve Takım sayfası (role update/create) bozuktu.

migrate((db) => {
  const dao = Dao(db);

  // 1) users.role select alanı + kurallar (hata olursa migration FAIL olur — sessiz geçilmez)
  // Önceki hâl: listRule/updateRule "sadece kendin" (Takım sayfası bozuk),
  // createRule public (açık kayıt — güvenlik riski).
  const users = dao.findCollectionByNameOrId('users');
  if (!users.schema.getFieldByName('role')) {
    users.schema.addField(new SchemaField({
      name: 'role',
      type: 'select',
      required: false,
      options: { maxSelect: 1, values: ['admin', 'agent', 'viewer'] },
    }));
  }
  users.listRule = '@request.auth.id != ""';
  users.viewRule = '@request.auth.id != ""';
  users.createRule = '@request.auth.role = "admin"';
  users.updateRule = '@request.auth.role = "admin" || id = @request.auth.id';
  users.deleteRule = '@request.auth.role = "admin"';
  dao.saveCollection(users);

  // 2) mevcut kullanıcıları admin yap (ilk kurulum hesapları)
  const existing = dao.findRecordsByFilter('users', 'id != ""', '', 50, 0);
  for (const u of existing) {
    if (!u.get('role')) {
      u.set('role', 'admin');
      dao.saveRecord(u);
    }
  }

  // 3) settings singleton kaydı (boşsa)
  try {
    const found = dao.findRecordsByFilter('settings', 'id != ""', '', 1, 0);
    if (!found || found.length === 0) {
      const col = dao.findCollectionByNameOrId('settings');
      dao.saveRecord(new Record(col, {
        singleton: true,
        company_name: 'Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.',
        brand: 'Vexabiz Digital',
        tagline: 'Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?',
        description: 'Türkiye genelinde KOBİ ve işletmelere özel Meta Business Manager kurulumu ve kurumsal web sitesi hizmetleri. Hızlı, doğru, uçtan uca.',
        phone: '0545 278 80 73',
        email: 'info@vexabiz.com',
        address: 'Türkiye',
        hours: 'Pazartesi - Cumartesi · 09:00 - 19:00',
        facebook: 'https://www.facebook.com/vexabiz/',
        instagram: 'https://www.instagram.com/vexabiz/',
        whatsapp: '905452788073',
      }));
    }
  } catch (err) {
    console.log('[migration 21] settings seed hatası: ' + String(err));
  }
}, (db) => {
  // geri alma yok
});
