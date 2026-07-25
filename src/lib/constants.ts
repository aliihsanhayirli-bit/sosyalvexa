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
    short: 'Facebook + Instagram profesyonel altyapı',
    desc: 'Facebook ve Instagram işletme hesaplarınızı Meta Business Manager üzerinden profesyonel olarak kuruyor; sayfa, reklam hesabı, Meta Pixel, CAPI ve ölçüm altyapısını uçtan uca hazırlıyoruz.',
    icon: 'Facebook',
    bullets: [
      'İşletme hesabı + BM doğrulama',
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
    short: 'Modern, hızlı, SEO uyumlu kurumsal site',
    desc: 'Markanızı yansıtan, mobil uyumlu, hızlı ve SEO altyapısı hazır kurumsal web siteleri tasarlıyor, geliştiriyor ve yayına alıyoruz. Tek sayfa portföyden çok dilli kurumsal siteye kadar uçtan uca çözüm.',
    icon: 'Globe',
    bullets: [
      'UI/UX tasarım + responsive',
      'SEO altyapısı (meta, schema, sitemap)',
      'Hızlı ve Lighthouse 90+ performans',
      'CMS veya yönetim paneli',
      'SSL + hosting kurulumu dahil',
    ],
    priceFrom: '20.000 TL',
    duration: '15-30 gün',
  },
];

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  monthly?: string;
  setup?: string;
  features: { label: string; included: boolean }[];
  highlight?: boolean;
  cta: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'starter',
    slug: 'baslangic',
    name: 'Başlangıç',
    tagline: 'Yeni açılan veya dijitale yeni adım atan işletmeler için',
    setup: '15.000 - 25.000 TL',
    monthly: '5.000 - 8.000 TL / ay',
    features: [
      { label: 'Meta Business Manager kurulumu', included: true },
      { label: 'Facebook + Instagram sayfa kurulumu', included: true },
      { label: 'Meta Pixel kurulumu', included: true },
      { label: 'Tek sayfalık kurumsal landing page', included: true },
      { label: 'Google My Business kaydı', included: true },
      { label: 'Temel SEO altyapısı', included: true },
      { label: 'Çok sayfalı kurumsal site', included: false },
      { label: 'Conversions API (CAPI) kurulumu', included: false },
      { label: 'Aylık reklam yönetimi', included: false },
      { label: 'Aylık performans raporu', included: false },
    ],
    cta: 'Hemen Başla',
  },
  {
    id: 'pro',
    slug: 'profesyonel',
    name: 'Profesyonel',
    tagline: 'Büyüyen işletmeler için ideal — web + sosyal',
    setup: '40.000 - 75.000 TL',
    monthly: '15.000 - 25.000 TL / ay',
    highlight: true,
    features: [
      { label: 'Meta Business Manager kurulumu', included: true },
      { label: 'Facebook + Instagram sayfa kurulumu', included: true },
      { label: 'Meta Pixel + CAPI kurulumu', included: true },
      { label: 'Çok sayfalı kurumsal web sitesi (5-10 sayfa)', included: true },
      { label: 'Google My Business + SEO altyapısı', included: true },
      { label: 'İletişim formu + canlı sohbet', included: true },
      { label: 'Aylık performans raporu', included: true },
      { label: 'Meta / Google Ads yönetimi', included: false },
      { label: 'Çoklu dil desteği', included: false },
      { label: 'Özel geliştirme (panel, raporlama)', included: false },
    ],
    cta: 'Profesyonel Ol',
  },
  {
    id: 'enterprise',
    slug: 'kurumsal',
    name: 'Kurumsal',
    tagline: 'Meta + Web — uçtan uca çözüm',
    setup: '100.000 - 200.000+ TL',
    monthly: '30.000 - 60.000 TL / ay',
    features: [
      { label: 'Profesyonel paketin tamamı', included: true },
      { label: 'Meta + Google Ads yönetimi', included: true },
      { label: 'Sosyal medya içerik yönetimi', included: true },
      { label: 'Aylık strateji toplantısı', included: true },
      { label: 'Çoklu dil desteği', included: true },
      { label: 'E-ticaret altyapısı', included: true },
      { label: 'Özel geliştirme (panel, raporlama)', included: true },
      { label: '6 ay ücretsiz destek + optimizasyon', included: true },
      { label: 'KVKK + yasal uyum danışmanlığı', included: true },
      { label: 'Öncelikli destek (SLA)', included: true },
    ],
    cta: 'Kurumsal Teklif Al',
  },
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
