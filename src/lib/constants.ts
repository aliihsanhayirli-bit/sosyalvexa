export const COMPANY = {
  name: 'YCA TİCARİ YATIRIM DANIŞMANLIK LTD. ŞTİ.',
  brand: 'YCA Yatırım',
  tagline: 'Temelli\'nin Premium Arsa Uzmanı',
  description:
    'Ankara Temelli ve çevresinde arsa almak, satmak ve yatırım yapmak isteyenler için profesyonel danışmanlık. Güven, şeffaflık ve 15+ yıllık tecrübe.',
  phone: '0545 655 10 70',
  phoneRaw: '905456551070',
  email: 'info@ycayatirim.com.tr',
  address: 'Temelli Mahallesi, Ankara',
  whatsapp: 'https://wa.me/905456551070',
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
  },
  hours: 'Pazartesi - Cumartesi · 09:00 - 19:00',
  foundedYear: 2010,
} as const;

export const NAV = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Arsalar', href: '/arsalar' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Bölgeler', href: '/bolgeler' },
  { label: 'İletişim', href: '/iletisim' },
] as const;

export interface Region {
  slug: string;
  name: string;
  district: string;
  highlight?: boolean;
}

export const REGIONS: Region[] = [
  { slug: 'temelli', name: 'Temelli', district: 'Sincan', highlight: true },
  { slug: 'polatli', name: 'Polatlı', district: 'Polatlı' },
  { slug: 'haymana', name: 'Haymana', district: 'Haymana' },
  { slug: 'bala', name: 'Bala', district: 'Bala' },
  { slug: 'cankaya', name: 'Çankaya', district: 'Çankaya' },
  { slug: 'etimesgut', name: 'Etimesgut', district: 'Etimesgut' },
];

export interface Service {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const SERVICES: Service[] = [
  {
    id: 'satis',
    title: 'Arsa Satışı',
    desc: 'Arsanızı en doğru fiyatla, doğru alıcıyla buluşturuyoruz. Profesyonel fotoğraflama, doğru hedef kitle ve hukuki danışmanlık dahil.',
    icon: 'TrendingUp',
  },
  {
    id: 'alim',
    title: 'Arsa Alımı',
    desc: 'Bütçenize ve hedefinize uygun arsaları seçiyor, imar durumu ve tapu kontrollerini sizin adınıza yapıyoruz.',
    icon: 'Search',
  },
  {
    id: 'yatirim',
    title: 'Yatırım Danışmanlığı',
    desc: 'Bölgenin gelişim potansiyelini analiz ediyor, uzun vadeli değer artışı sağlayacak arsaları öneriyoruz.',
    icon: 'LineChart',
  },
  {
    id: 'tapu',
    title: 'Tapu & Hukuki Süreç',
    desc: 'Tapu devri, imar durumu, ipotek ve haciz sorguları, sözleşme hazırlığı — tüm hukuki süreçleri yönetiyoruz.',
    icon: 'ShieldCheck',
  },
];

export const STATS = [
  { value: '15+', label: 'Yıllık Tecrübe' },
  { value: '2.000+', label: 'Portföy' },
  { value: '1.200+', label: 'Mutlu Müşteri' },
  { value: '₺850M+', label: 'Gerçekleşen İşlem Hacmi' },
];
