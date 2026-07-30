import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { COMPANY } from '@/lib/constants';
import { Shield, Eye, Database, Share2, Lock, UserCheck, Mail, Phone } from 'lucide-react';

export default function KVKK() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <Badge variant="gold" className="mb-4">Yasal</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            KVKK <span className="gold-text italic">Aydınlatma Metni</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin işlenmesi, saklanması ve korunması ile ilgili haklarınız hakkında sizi bilgilendirmek isteriz.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Son güncelleme: 30 Temmuz 2026
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="max-w-4xl space-y-12">
          <Block icon={Database} title="1. Veri Sorumlusu">
            <p>
              6698 sayılı Kanun uyarınca kişisel verileriniz; <strong>veri sorumlusu</strong> sıfatıyla
              <strong> {COMPANY.name}</strong> tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Adres:</strong> {COMPANY.address}</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> <strong>Tel:</strong> {COMPANY.phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <strong>E-posta:</strong> {COMPANY.email}</li>
            </ul>
          </Block>

          <Block icon={Eye} title="2. Toplanan Kişisel Veriler">
            <p>Web sitemiz üzerinden ve/veya iletişim kanallarımız aracılığıyla aşağıdaki kişisel veriler toplanmaktadır:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
              <li><strong>Kimlik bilgileri:</strong> ad, soyad</li>
              <li><strong>İletişim bilgileri:</strong> telefon, e-posta, adres</li>
              <li><strong>Talep bilgileri:</strong> ilgilenilen hizmet/paket, bütçe aralığı, işletme ve sektör bilgileri, randevu tercihi, mesaj içeriği</li>
              <li><strong>Web kullanım verileri:</strong> çerezler, IP adresi, tarayıcı bilgisi, ziyaret edilen sayfalar</li>
              <li><strong>İletişim geçmişi:</strong> chat kayıtları, e-posta yazışmaları, telefon görüşme notları</li>
            </ul>
          </Block>

          <Block icon={Shield} title="3. Kişisel Verilerin İşlenme Amaçları">
            <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
              <li>Dijital dönüşüm taleplerinizin değerlendirilmesi ve size özel hizmet/paket önerileri sunulması</li>
              <li>Web sitesi, CRM, yapay zeka asistanı ve Meta altyapı kurulum hizmetlerinin planlanması</li>
              <li>Ücretsiz keşif görüşmesi ve randevu organizasyonu</li>
              <li>Sözleşme hazırlanması ve proje teslim işlemleri</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, mevzuat, resmi kurumlar)</li>
              <li>Müşteri memnuniyeti ve hizmet kalitesinin artırılması</li>
              <li>Pazarlama ve bilgilendirme amaçlı iletişim (onay verdiğiniz takdirde)</li>
            </ul>
          </Block>

          <Block icon={Share2} title="4. Verilerin Aktarımı">
            <p>Kişisel verileriniz, kanunen yetkili kamu kurum ve kuruluşlarına, yargı mercilerine, anlaşmalı hukuk bürolarına, mali müşavirlik firmalarına, hosting ve sunucu hizmet sağlayıcılarına, entegrasyon kapsamında Meta Platforms'a (Facebook/Instagram/WhatsApp) ve yurt dışı mukim hizmet sağlayıcılarımıza (Google — Gemini AI chatbot için) aktarılabilir. Bu aktarımlar KVKK Madde 9 kapsamında yasal zorunluluk veya hizmet gereği yapılmaktadır.</p>
            <p className="mt-3 text-sm">Yurt dışı aktarımlarda yeterli korumaya sahip ülkeler veya yazılı taahhütname ile güvence altına alınmış hizmet sağlayıcılar tercih edilmektedir.</p>
          </Block>

          <Block icon={Lock} title="5. Veri Güvenliği">
            <p>Kişisel verileriniz, KVKK Madde 12 kapsamında yetkisiz erişim, kayıp, tahribat veya zarara karşı korunmaktadır:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
              <li>TLS/SSL ile şifrelenmiş iletişim (HTTPS)</li>
              <li>Sunucu tarafı şifreleme (encryption env key ile)</li>
              <li>Rol tabanlı erişim kontrolü (admin auth)</li>
              <li>Periyodik yedekleme (günlük)</li>
              <li>Güvenlik başlıkları (HSTS, CSP, X-Frame-Options)</li>
            </ul>
          </Block>

          <Block icon={UserCheck} title="6. Veri Sahibinin Hakları (KVKK Madde 11)">
            <p>6698 sayılı Kanun'un 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde/dışında aktarıldığı 3. kişileri öğrenme</li>
              <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
              <li>Şartlar oluştuğunda silinmesini/yok edilmesini isteme</li>
              <li>Otomatik sistemlerle aleyhine sonuç doğan analizlere itiraz etme</li>
              <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
            </ul>
            <p className="mt-4 text-sm">
              Bu haklarınızı kullanmak için <strong>{COMPANY.email}</strong> adresine veya <strong>{COMPANY.phone}</strong> numarasına yazılı/işitsel başvuruda bulunabilirsiniz. Talepleriniz en geç 30 gün içinde sonuçlandırılır.
            </p>
          </Block>

          <Block icon={Database} title="7. Veri Saklama Süreleri">
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2">Veri Türü</th>
                  <th className="py-2">Saklama Süresi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr><td className="py-2">İletişim formu mesajları</td><td className="py-2">5 yıl (talep sonrası)</td></tr>
                <tr><td className="py-2">CRM (contact/conversation/message)</td><td className="py-2">10 yıl (ticari mevzuat)</td></tr>
                <tr><td className="py-2">Randevu kayıtları</td><td className="py-2">5 yıl</td></tr>
                <tr><td className="py-2">Chatbot logları</td><td className="py-2">1 yıl</td></tr>
                <tr><td className="py-2">Yedekleme (backup)</td><td className="py-2">7 gün (rolling)</td></tr>
                <tr><td className="py-2">Web analytics</td><td className="py-2">2 yıl</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm">Yasal saklama süresi dolan veriler periyodik olarak silinir veya anonimleştirilir.</p>
          </Block>

          <Block icon={Eye} title="8. Çerez Politikası">
            <p>Web sitemizde aşağıdaki çerez türleri kullanılmaktadır:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
              <li><strong>Zorunlu çerezler:</strong> oturum, kimlik doğrulama (kapatılamaz)</li>
              <li><strong>Performans çerezleri:</strong> sayfa yükleme süreleri, hata logları (anonim)</li>
              <li><strong>İşlevsel çerezler:</strong> dil, tema tercihi</li>
            </ul>
            <p className="mt-3 text-sm">Çerez tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz.</p>
          </Block>

          <Block icon={Mail} title="9. İletişim ve Başvuru">
            <p>KVKK kapsamındaki haklarınızı kullanmak ve sorularınız için:</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <strong>E-posta:</strong> {COMPANY.email}</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> <strong>Telefon:</strong> {COMPANY.phone}</li>
              <li><strong>Posta:</strong> {COMPANY.address}</li>
            </ul>
            <p className="mt-3 text-sm">
              <strong>KVKK Kurumu:</strong> Başvurunuzun reddedilmesi, verilen cevabın yetersiz bulunması veya başvuruya süresinde cevap verilmemesi hâlinde; Kişisel Verileri Koruma Kurulu'na (<a href="https://www.kvkk.gov.tr" target="_blank" rel="noreferrer" className="text-accent hover:underline">www.kvkk.gov.tr</a>) şikayette bulunabilirsiniz.
            </p>
          </Block>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-sm leading-relaxed text-amber-200/90">
              <strong>Önemli:</strong> Bu aydınlatma metni, web sitemizdeki iletişim formunu doldurmanız veya herhangi bir hizmetimizden yararlanmanız hâlinde kişisel verilerinizin işlenmesine ilişkin bilgilendirme amaçlıdır. Hizmetlerimizden yararlanarak bu aydınlatma metnini okuduğunuz ve kişisel verilerinizin işlenmesini kabul ettiğiniz varsayılır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-card/40 p-8 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="text-foreground/75">{children}</div>
    </motion.div>
  );
}
