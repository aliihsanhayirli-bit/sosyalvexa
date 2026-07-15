export const COMPANY = {
  name: 'GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ.',
  brand: 'GYD Grup',
  tagline: 'Emlak Yatırımında Doğru Adres',
  description:
    'Ankara genelinde imarlı arsa almak, satmak ve yatırım yapmak isteyenler için profesyonel danışmanlık. Güven, şeffaflık ve uzun yıllara dayanan tecrübe.',
  phone: '0532 489 25 67',
  phoneRaw: '905324892567',
  email: 'info@gydgrup.com.tr',
  address: 'Ankara',
  whatsapp: 'https://wa.me/905324892567',
  social: {
    instagram: 'https://www.instagram.com/gydgrup/',
    facebook: 'https://www.facebook.com/gydgrupankara/',
    youtube: 'https://www.youtube.com/@GydGrupGayrimenkul',
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
  { slug: 'cankaya', name: 'Çankaya', district: 'Çankaya' },
  { slug: 'etimesgut', name: 'Etimesgut', district: 'Etimesgut' },
  { slug: 'mamak', name: 'Mamak', district: 'Mamak' },
  { slug: 'altindag', name: 'Altındağ', district: 'Altındağ' },
  { slug: 'yenimahalle', name: 'Yenimahalle', district: 'Yenimahalle' },
  { slug: 'kecioren', name: 'Keçiören', district: 'Keçiören' },
  { slug: 'sincan', name: 'Sincan', district: 'Sincan' },
  { slug: 'pursaklar', name: 'Pursaklar', district: 'Pursaklar' },
  { slug: 'polatli', name: 'Polatlı', district: 'Polatlı' },
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
