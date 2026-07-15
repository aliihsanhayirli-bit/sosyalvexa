import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, TrendingUp, ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { REGIONS } from '@/lib/constants';

const REGION_DETAILS: Record<string, { description: string; stats: { value: string; label: string }[]; highlights: string[] }> = {
  temelli: {
    description: 'Ankara\'nın batısında, hızla gelişen sanayi ve konut bölgesi. OSB yakınlığı, artan nüfus ve altyapı yatırımlarıyla yatırımcıların gözdesi.',
    stats: [
      { value: '₺2.4M', label: 'ortalama m² fiyatı' },
      { value: '%35', label: 'son 3 yıl değer artışı' },
      { value: '48', label: 'aktif portföy' },
    ],
    highlights: [
      'Organize Sanayi Bölgesi\'ne 5dk mesafe',
      'Ankara merkeze 45dk, Esenboğa Havalimanı\'na 1.5 saat',
      'Yeni açılan devlet hastanesine yakın',
      'Toplu taşıma ve okul bölgesinde',
      'Tüm altyapı (doğalgaz, kanalizasyon) hazır',
    ],
  },
  polatli: {
    description: 'Büyük ova içinde, tarım ve konut imarlı arsalar için ideal. Ulaşım ağına yakın, sakin ve yatırımcı dostu.',
    stats: [
      { value: '₺1.8M', label: 'ortalama fiyat' },
      { value: '%22', label: 'değer artışı' },
      { value: '24', label: 'aktif portföy' },
    ],
    highlights: ['TCDD YHT durağına yakın', 'Verimli tarım arazisi', 'Konut imarlı parseller', 'Hızlı tapu devri'],
  },
  cankaya: {
    description: 'Başkentin en merkezi lokasyonlarından. Ticari ve konut imarlı arsalar prim değer taşıyor.',
    stats: [{ value: '₺4.2M', label: 'ortalama fiyat' }, { value: '%28', label: 'değer artışı' }, { value: '15', label: 'aktif portföy' }],
    highlights: ['Merkezi konum', 'Ticari potansiyel', 'Yüksek prim değer', 'Tam altyapı'],
  },
  etimesgut: {
    description: 'Hobi bahçeleri ve küçük yatırımlar için tercih edilen, ulaşımı kolay bölge.',
    stats: [{ value: '₺1.0M', label: 'ortalama fiyat' }, { value: '%20', label: 'değer artışı' }, { value: '8', label: 'aktif portföy' }],
    highlights: ['Hobi bahçesi', 'Kolay ulaşım', 'Küçük bütçeye uygun', 'Hızlı tapu'],
  },
};

export default function RegionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const region = REGIONS.find((r) => r.slug === slug);
  if (!region) return <Navigate to="/bolgeler" replace />;
  const detail = REGION_DETAILS[slug!] || REGION_DETAILS.temelli;

  return (
    <div>
      <section className="container-wide py-16">
        <Link to="/bolgeler" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Tüm Bölgeler
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <Badge variant="gold" className="mb-3">Bölge Raporu</Badge>
            <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-accent">
              <MapPin className="h-4 w-4" /> {region.district} · Ankara
            </div>
            <h1 className="font-display text-5xl font-medium leading-tight tracking-tight sm:text-6xl">
              {region.name}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground/75">{detail.description}</p>
          </div>
          <div className="grid gap-3">
            {detail.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-card/40 p-5 backdrop-blur-sm">
                <div className="font-display text-3xl font-semibold gold-text">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container-wide py-16">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Bölge Özellikleri</Badge>
          <h2 className="font-display text-3xl font-medium">Neden <span className="gold-text italic">{region.name}?</span></h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {detail.highlights.map((h) => (
            <div key={h} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-card/40 p-4">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div className="text-sm text-foreground/80">{h}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide py-16">
        <div className="gradient-border p-10 text-center">
          <h3 className="font-display text-2xl font-medium">{region.name}'de arsa bakıyorum</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">Bölge uzmanımızdan bölgeye özel portföy ve yatırım raporu alın.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="gold" onClick={() => (window.location.href = '/iletisim')}>Görüşme Talep Et</Button>
            <Link to="/arsalar" className="inline-flex items-center gap-1 text-sm text-accent hover:gap-2 transition-all">
              Tüm arsalara bak <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
