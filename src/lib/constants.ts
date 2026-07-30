export const COMPANY = {
  name: 'Vexabiz Digital',
  brand: 'Vexabiz Digital',
  fullName: 'Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.',
  tagline: 'Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?',
  shortTagline: 'Dijital Dönüşüm Ortağınız',
  description:
    'Türkiye genelinde KOBİ ve işletmelere özel Meta Business Manager kurulumu ve kurumsal web sitesi hizmetleri. Hızlı, doğru, uçtan uca.',
  phone: '0545 278 80 73',
  phoneRaw: '905452788073',
  email: 'info@vexabiz.com',
  address: 'Türkiye',
  website: 'https://sos.vexabiz.com',
  whatsapp: 'https://wa.me/905452788073',
  social: {
    instagram: 'https://www.instagram.com/vexabiz/',
    facebook: 'https://www.facebook.com/vexabiz/',
    linkedin: 'https://www.linkedin.com/company/vexabiz/',
    youtube: 'https://www.youtube.com/@vexabiz',
  },
  hours: 'Pazartesi - Cumartesi · 09:00 - 19:00',
  foundedYear: 2018,
} as const;

export const NAV = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Paketler', href: '/paketler' },
  { label: 'Referanslar', href: '/referanslar' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
] as const;

export interface Service {
  id: string;
  slug: string;
  title: string;
  short: string;
  desc: string;
  icon: string;
  bullets: string[];
  priceFrom?: string;
  duration?: string;
}

export const SERVICES: Service[] = [
  {
    id: 'meta',
    slug: 'meta-business-manager',
    title: 'Meta Business Manager Kurulumu',
    short: 'Facebook + Instagram profesyonel altyapı ve şirket doğrulama',
    desc: 'Facebook ve Instagram işletme hesaplarınızı Meta Business Manager üzerinden profesyonel olarak kuruyor; şirket doğrulaması, sayfa, reklam hesabı, Meta Pixel, CAPI ve ölçüm altyapısını uçtan uca hazırlıyoruz.',
    icon: 'Facebook',
    bullets: [
      'İşletme hesabı + BM şirket doğrulaması',
      'Sayfa, reklam hesabı ve rol atamaları',
      'Meta Pixel + Conversions API kurulumu',
      'GA4 + ölçüm olayları eşlemesi',
      'Doğrulama süreci ve şirket eşleme',
    ],
    priceFrom: '7.500 TL',
    duration: '3-7 gün',
  },
  {
    id: 'web',
    slug: 'kurumsal-web-sitesi',
    title: 'Kurumsal Web Sitesi',
    short: 'Klinikler ve işletmeler için modern, hızlı, SEO uyumlu site',
    desc: 'Diş klinikleri, fizik tedavi ve güzellik merkezleri başta olmak üzere işletmenizi yansıtan, mobil uyumlu, hızlı ve SEO altyapısı hazır kurumsal web siteleri tasarlıyor, geliştiriyor ve yayına alıyoruz.',
    icon: 'Globe',
    bullets: [
      'UI/UX tasarım + responsive (2 revizyon dahil)',
      'SEO altyapısı (meta, schema, sitemap)',
      'SSL + domain ve DNS yapılandırması',
      'Kurumsal e-posta kurulumu',
      'Google Haritalar + işletme profili optimizasyonu',
    ],
    priceFrom: '22.500 TL',
    duration: '7-10 gün',
  },
  {
    id: 'crm',
    slug: 'crm-kurulumu',
    title: 'CRM Kurulumu',
    short: 'Hasta ve müşteri kayıtları tek panelde',
    desc: 'Hasta kayıtları, iletişim formları, teklif ve randevu süreçlerini tek panelden yönetin. Temel CRM\'den tedavi takibi ve otomasyonlu gelişmiş CRM\'e kadar ölçeklenebilir kurulum.',
    icon: 'Users',
    bullets: [
      'Hasta / müşteri kayıt yönetimi',
      'Form ve iletişim kayıtları otomatik akış',
      'Teklif + randevu + hatırlatma süreçleri',
      'Çok kullanıcılı yetkilendirme',
      'Web sitesi ve sohbet kanallarıyla entegrasyon',
    ],
    priceFrom: '18.000 TL',
    duration: '5-10 gün',
  },
  {
    id: 'ai',
    slug: 'yapay-zeka-asistani',
    title: 'Yapay Zeka Asistanı',
    short: 'Web, WhatsApp, Instagram ve Messenger\'da 7/24 asistan',
    desc: 'Yapay zeka çalışanınız web sitenizde, WhatsApp\'ta, Instagram DM\'de ve Facebook Messenger\'da müşterilerinizle konuşur; soruları yanıtlar, bilgi toplar ve randevu oluşturur.',
    icon: 'Bot',
    bullets: [
      'Web sitesi canlı sohbet asistanı',
      'WhatsApp + Instagram DM + Messenger entegrasyonu',
      'Sık sorulan sorular + hizmet bilgi tabanı',
      'Randevu oluşturma ve CRM kaydı',
      'İnsan danışmana akıllı devretme',
    ],
    priceFrom: '35.000 TL',
    duration: '7-15 gün',
  },
  {
    id: 'vps',
    slug: 'vps-ozel-kurulum',
    title: 'VPS Özel Sunucu Kurulumu',
    short: 'SaaS değil — size özel sunucuda private kurulum',
    desc: 'Sisteminiz paylaşımlı hazır platformlarda değil, size özel VPS sunucuda çalışır. Verileriniz sizde kalır; kurulum, güvenlik, yedekleme ve izleme altyapısını uçtan uca hazırlıyoruz.',
    icon: 'Server',
    bullets: [
      'Size özel VPS yapılandırması',
      'SSL + güvenlik duvarı + erişim ayarları',
      'Günlük yedekleme sistemi',
      'Sunucu izleme ve uyarılar',
      'Veri sahipliği tamamen sizde',
    ],
    priceFrom: '7.500 TL',
    duration: '2-5 gün',
  },
  {
    id: 'maintenance',
    slug: 'bakim-destek',
    title: 'Bakım & Destek',
    short: 'Sunucu, güncelleme ve öncelikli teknik destek',
    desc: 'Kurulumdan sonra yanınızdayız: sunucu güncellemeleri, haftalık yedekler, performans optimizasyonu ve öncelikli destek ile sisteminiz kesintisiz çalışır.',
    icon: 'Wrench',
    bullets: [
      'Sunucu ve yazılım güncellemeleri',
      'Haftalık / günlük yedekleme takibi',
      'Teknik destek ve küçük geliştirmeler',
      'AI ve CRM güncellemeleri (Premium)',
      'Aylık durum toplantısı (Premium)',
    ],
    priceFrom: '4.900 TL / ay',
    duration: 'Sürekli',
  },
];

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  monthly?: string;
  setup?: string;
  listValue?: string;
  note?: string;
  items?: { label: string; price: string }[];
  features: { label: string; included: boolean }[];
  highlight?: boolean;
  cta: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'baslangic',
    slug: 'dijital-baslangic',
    name: 'Dijital Başlangıç',
    tagline: 'Yeni açılan diş klinikleri, güzellik merkezleri, fizik tedavi merkezleri ve işletmeler için',
    setup: '69.900 TL + KDV',
    listValue: '112.000 TL',
    note: 'Tek seferlik kurulum · Teslim: 7-10 iş günü',
    items: [
      { label: 'Kurumsal Web Sitesi', price: '22.500 TL' },
      { label: 'Mobil Uyum', price: '3.000 TL' },
      { label: 'Temel SEO', price: '5.000 TL' },
      { label: 'SSL Kurulumu', price: '1.500 TL' },
      { label: 'Domain & DNS Yapılandırması', price: '2.000 TL' },
      { label: 'Kurumsal Mail Kurulumu', price: '3.000 TL' },
      { label: 'Facebook Sayfası Kurulumu', price: '3.000 TL' },
      { label: 'Instagram Business Kurulumu', price: '3.000 TL' },
      { label: 'Meta Business Manager Kurulumu', price: '7.500 TL' },
      { label: 'Business Verification Desteği', price: '10.000 TL' },
      { label: 'Meta Pixel', price: '5.000 TL' },
      { label: 'Conversion API', price: '6.000 TL' },
      { label: 'WhatsApp Business Entegrasyonu', price: '5.000 TL' },
      { label: 'Temel CRM (hasta kayıtları, formlar, iletişim)', price: '18.000 TL' },
      { label: 'VPS Kurulumu', price: '7.500 TL' },
      { label: 'Güvenlik Ayarları', price: '5.000 TL' },
      { label: 'Eğitim', price: '5.000 TL' },
    ],
    features: [
      { label: 'Kurumsal web sitesi + temel SEO + SSL', included: true },
      { label: 'Meta Business Manager + şirket doğrulama desteği', included: true },
      { label: 'Meta Pixel + Conversions API', included: true },
      { label: 'Facebook + Instagram + WhatsApp bağlantıları', included: true },
      { label: 'Temel CRM (hasta / müşteri kayıtları)', included: true },
      { label: 'Size özel VPS kurulumu + güvenlik', included: true },
      { label: 'Eğitim + teslim dokümanları', included: true },
      { label: 'Yapay zeka asistanı', included: false },
      { label: 'Gelişmiş CRM + randevu sistemi', included: false },
      { label: 'Admin paneli + otomasyonlar', included: false },
    ],
    cta: 'Başlangıç Teklifi Al',
  },
  {
    id: 'pro',
    slug: 'dijital-klinik-pro',
    name: 'Dijital Klinik Pro',
    tagline: 'Diş klinikleri, fizik tedavi ve güzellik merkezleri için uçtan uca dijital sistem',
    setup: '149.900 TL + KDV',
    listValue: '356.000 TL',
    note: 'Tek seferlik kurulum · Teslim: 15-25 iş günü',
    highlight: true,
    items: [
      { label: 'Dijital Başlangıç paketinin tamamı', price: '112.000 TL' },
      { label: 'Gelişmiş CRM (hasta takibi, tedavi süreci, teklif)', price: '45.000 TL' },
      { label: 'Admin Paneli', price: '20.000 TL' },
      { label: 'Çok Kullanıcılı Yetkilendirme', price: '10.000 TL' },
      { label: 'Yapay Zeka Chat Asistanı', price: '35.000 TL' },
      { label: 'WhatsApp AI', price: '15.000 TL' },
      { label: 'Instagram AI', price: '15.000 TL' },
      { label: 'Facebook Messenger AI', price: '15.000 TL' },
      { label: 'Randevu Sistemi', price: '20.000 TL' },
      { label: 'Hatırlatma Sistemi', price: '10.000 TL' },
      { label: 'Otomasyonlar', price: '20.000 TL' },
      { label: 'Dashboard & Raporlama', price: '15.000 TL' },
      { label: 'Günlük Yedekleme', price: '8.000 TL' },
      { label: 'Sunucu İzleme', price: '6.000 TL' },
      { label: 'İlk 30 Gün Destek', price: '10.000 TL' },
    ],
    features: [
      { label: 'Dijital Başlangıç paketinin tamamı', included: true },
      { label: 'Gelişmiş CRM: hasta takibi, tedavi, teklif, randevu', included: true },
      { label: 'Yapay zeka asistanı (Web + WhatsApp + IG + Messenger)', included: true },
      { label: 'Randevu + hatırlatma sistemi', included: true },
      { label: 'Admin paneli + çok kullanıcılı yetkilendirme', included: true },
      { label: 'Form otomasyonları + AI ile SSS', included: true },
      { label: 'Raporlama dashboard\'u', included: true },
      { label: 'Günlük yedekleme + sunucu izleme', included: true },
      { label: '30 gün ücretsiz destek', included: true },
    ],
    cta: 'Pro Teklif Al',
  },
];

export interface MaintenancePlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'standart',
    name: 'Standart Destek',
    price: '4.900 TL / ay',
    features: [
      'Sunucu ve yazılım güncellemeleri',
      'Haftalık yedekleme',
      'Teknik destek',
      'Küçük geliştirmeler',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Destek',
    price: '9.900 TL / ay',
    highlight: true,
    features: [
      'Standart paketin tamamı',
      'AI güncellemeleri',
      'CRM güncellemeleri',
      'Performans optimizasyonu',
      'Öncelikli destek',
      'Aylık durum toplantısı',
    ],
  },
];

export const ADDON_MODULES: { label: string; price: string }[] = [
  { label: 'Online Ödeme Sistemi', price: '12.500 TL' },
  { label: 'SMS Entegrasyonu', price: '10.000 TL' },
  { label: 'E-Fatura Entegrasyonu', price: '15.000 TL' },
  { label: 'Logo Tasarımı', price: '7.500 TL' },
  { label: 'Kurumsal Kimlik', price: '12.500 TL' },
  { label: 'Meta Reklam Kurulumu', price: '10.000 TL' },
  { label: 'Reklam Yönetimi', price: '15.000 TL / ay' },
  { label: 'Sosyal Medya Yönetimi', price: '20.000 TL / ay' },
  { label: 'İçerik Üretimi', price: '15.000 TL / ay' },
  { label: 'AI Voice Agent', price: '45.000 TL' },
  { label: 'Çağrı Merkezi AI', price: '65.000 TL' },
  { label: 'Özel API Entegrasyonu', price: 'Teklif' },
  { label: 'Mobil Uygulama', price: 'Teklif' },
];

export interface Reference {
  id: string;
  title: string;
  url: string;
  description: string;
  tag: string;
  year: string;
  industry: string;
}

export const REFERENCES: Reference[] = [
  {
    id: 'gydgrup',
    title: 'GYD Grup Gayrimenkul',
    url: 'https://www.gydgrup.com.tr',
    description: 'Ankara genelinde imarlı arsa alım-satımı ve yatırım danışmanlığı yapan kurumsal gayrimenkul sitesi. 3D harita, AI asistan ve CRM entegrasyonu.',
    tag: 'Kurumsal Site + 3D + AI',
    year: '2024',
    industry: 'Gayrimenkul',
  },
  {
    id: 'temelliarsa',
    title: 'Temelli Arsa',
    url: 'https://temelliarsa.com',
    description: 'Temelli bölgesi arsa portföy ve yatırım danışmanlığı sitesi. SEO odaklı içerik ve hızlı iletişim formları.',
    tag: 'Kurumsal Site + SEO',
    year: '2024',
    industry: 'Gayrimenkul',
  },
  {
    id: 'aslangrup',
    title: 'Aslan Grup',
    url: 'https://www.xn--aslangrupaltndagmanitousaatlikgnlkkepcekiralama-74ec14x.com/',
    description: 'İnşaat, taahhüt, gıda, nakliye ve iş makinesi kiralama alanlarında çoklu hizmet veren kurumsal site.',
    tag: 'Çok Hizmetli Kurumsal Site',
    year: '2023',
    industry: 'İnşaat / Lojistik',
  },
  {
    id: 'autotube',
    title: 'AutoTube',
    url: 'https://www.autotube.vip',
    description: 'Otomotiv sektörüne yönelik kurumsal platform; ürün portföyü ve kurumsal kimlik çalışması.',
    tag: 'Kurumsal Site + Marka',
    year: '2025',
    industry: 'Otomotiv',
  },
  {
    id: 'dijitalvarlik',
    title: 'Dijital Varlık Yönetimi',
    url: 'https://app.dijitalvarlikyonetim.com/tr',
    description: 'Dijital varlık yönetim uygulaması — kullanıcı paneli, portföy takibi ve özel yönetim arayüzü.',
    tag: 'Web Uygulaması + Panel',
    year: '2025',
    industry: 'Fintech',
  },
];

export const STATS = [
  { value: '5+', label: 'Yıllık Tecrübe' },
  { value: '30+', label: 'Tamamlanan Proje' },
  { value: '25+', label: 'Aktif Müşteri' },
  { value: '4 Kanal', label: 'Web · WhatsApp · IG · Messenger' },
];

export const PROCESS = [
  { step: '01', title: 'Keşif Görüşmesi', desc: 'İşletmenizin ihtiyacını, hedef kitlenizi ve bütçenizi 30 dakikada anlıyoruz.' },
  { step: '02', title: 'Yol Haritası', desc: 'Size özel dijital dönüşüm planını, zaman çizelgesi ve teklifi hazırlıyoruz.' },
  { step: '03', title: 'Kurulum', desc: 'Meta ve web altyapınızı uçtan uca kuruyoruz.' },
  { step: '04', title: 'Eğitim & Teslim', desc: 'Ekibinize kullanım eğitimi veriyor, dokümanları teslim ediyoruz.' },
  { step: '05', title: 'Destek & Büyüme', desc: 'Aylık raporlar ve sürekli optimizasyon ile yanınızdayız.' },
];

export const VALUE_PROPS = [
  {
    title: 'Hemen Olur',
    desc: 'Çoğu kurulum 3-15 gün içinde yayında. Bekleten değil, teslim eden ekip.',
    icon: 'Zap',
  },
  {
    title: 'Doğru Olur',
    desc: 'Sektörünüze ve ölçeğinize uygun, ölçülebilir ve sürdürülebilir çözümler.',
    icon: 'Target',
  },
  {
    title: '1 Kerede Tam Olur',
    desc: 'Meta Business Manager ve kurumsal web sitesi tek elden, tek sözleşmeyle. Parça parça değil, uçtan uca.',
    icon: 'CheckCircle2',
  },
];
