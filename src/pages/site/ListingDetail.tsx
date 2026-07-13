import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Maximize2, FileCheck, Layers, Phone, MessageCircle, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatArea } from '@/lib/utils';
import { COMPANY, REGIONS } from '@/lib/constants';

const DEMO: Record<string, {
  id: string; slug: string; title: string; price: number; area: number; region: string;
  imar: string; tapu: string; description: string; features: string[]; coords: [number, number]; neighborhood: string;
}> = {
  'temelli-merkez-1250': {
    id: '1', slug: 'temelli-merkez-1250',
    title: 'Temelli Merkez · 1.250 m² İmarlı Konut Arsası',
    price: 2400000, area: 1250, region: 'temelli',
    imar: 'Konut (E:0.30, Hmax: 2 Kat)', tapu: 'Tapu Hazır · İpotek Yok',
    description: 'Temelli merkezde, gelişen konut bölgesinde yer alan 1.250 m² imarlı konut arsası. Tüm altyapı (elektrik, su, doğalgaz, kanalizasyon) hazır. Çevresinde yeni yapılaşma başlamış, hızlı değer artışı potansiyeli yüksek. Ana caddeye 200m, okullara ve sağlık ocağına yürüme mesafesinde.',
    features: ['Tüm altyapı hazır', 'Ana caddeye yakın', 'İfrazlı · 1 parsel', 'Güney cephe', 'Toplu taşıma', 'Okul ve sağlık ocağına yakın'],
    coords: [32.3847, 39.5633],
    neighborhood: 'Temelli Merkez · Sincan',
  },
};

const SAMPLE = {
  id: '1', slug: 'temelli-merkez-1250',
  title: 'Temelli Merkez · 1.250 m² İmarlı Konut Arsası',
  price: 2400000, area: 1250, region: 'temelli',
  imar: 'Konut (E:0.30, Hmax: 2 Kat)', tapu: 'Tapu Hazır · İpotek Yok',
  description: 'Temelli merkezde, gelişen konut bölgesinde yer alan 1.250 m² imarlı konut arsası. Tüm altyapı (elektrik, su, doğalgaz, kanalizasyon) hazır. Çevresinde yeni yapılaşma başlamış, hızlı değer artışı potansiyeli yüksek. Ana caddeye 200m, okullara ve sağlık ocağına yürüme mesafesinde.',
  features: ['Tüm altyapı hazır', 'Ana caddeye yakın', 'İfrazlı · 1 parsel', 'Güney cephe', 'Toplu taşıma', 'Okul ve sağlık ocağına yakın'],
  coords: [32.3847, 39.5633] as [number, number],
  neighborhood: 'Temelli Merkez · Sincan',
};

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const listing = slug && DEMO[slug] ? DEMO[slug] : SAMPLE;
  const region = REGIONS.find((r) => r.slug === listing.region);

  return (
    <div className="container-wide py-12">
      <Link to="/arsalar" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Tüm Arsalar
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="gold">Yeni</Badge>
              {region && <Badge variant="outline">{region.name}</Badge>}
              <Badge variant="glass">{listing.imar}</Badge>
            </div>
            <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl">{listing.title}</h1>
            <div className="mt-3 flex items-center gap-1.5 text-foreground/60">
              <MapPin className="h-4 w-4 text-accent" /> {listing.neighborhood}
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Maximize2, label: 'Alan', value: formatArea(listing.area) },
              { icon: Layers, label: 'İmar', value: listing.imar.split(' ')[0] },
              { icon: FileCheck, label: 'Tapu', value: 'Hazır' },
              { icon: Calendar, label: 'Güncellendi', value: 'Bugün' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-white/[0.06] bg-card/40 p-4 backdrop-blur-sm"
              >
                <s.icon className="mb-2 h-4 w-4 text-accent" />
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-display text-lg font-semibold text-foreground">{s.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-primary/30 to-accent/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,170,0.3),transparent_60%)]" />
                <div className="absolute inset-0 flex items-center justify-center text-foreground/30 text-xs">
                  Fotoğraf {i}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-semibold">Açıklama</h2>
            <p className="leading-relaxed text-foreground/75">{listing.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-semibold">Özellikler</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {listing.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-semibold">Konum</h2>
            <div className="relative h-80 overflow-hidden rounded-xl border border-white/[0.06] bg-card/40">
              <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
                <div className="text-center">
                  <MapPin className="mx-auto h-10 w-10 text-accent" />
                  <div className="mt-2 text-sm font-semibold text-foreground">{listing.neighborhood}</div>
                  <div className="mt-1 text-xs">{listing.coords[1].toFixed(4)}°N, {listing.coords[0].toFixed(4)}°E</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,170,0.08),transparent_70%)]" />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Liste Fiyatı</div>
            <div className="mt-1 font-display text-4xl font-semibold gold-text">{formatPrice(listing.price)}</div>
            <div className="mt-1 text-xs text-muted-foreground">~{formatPrice(Math.round(listing.price / listing.area))}/m²</div>

            <div className="my-6 h-px bg-white/[0.06]" />

            <div className="space-y-3">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:shadow-accent/50"
              >
                <Phone className="h-4 w-4" /> Hemen Ara
              </a>
              <a
                href={`${COMPANY.whatsapp}?text=${encodeURIComponent(`Merhaba, "${listing.title}" hakkında bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-foreground/70">
              <div className="font-semibold text-foreground">📍 Yer Görüşmesi</div>
              <p className="mt-1.5">Arsayı birlikte gezmek için randevu oluşturalım. Profesyonel fotoğraf ve konum bilgisi anlık olarak paylaşılır.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
