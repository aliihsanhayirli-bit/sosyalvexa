import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, MapPin, ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { REGIONS } from '@/lib/constants';
import { pb } from '@/lib/pb';

interface Region {
  id: string;
  collectionId: string;
  slug: string;
  name: string;
  district: string;
  highlight: boolean;
  description: string;
  stats: { value: string; label: string }[];
  highlights: string[];
  cover_image: string | null;
  created: string;
  updated: string;
}

const FALLBACK: Pick<Region, 'description' | 'stats' | 'highlights'> = {
  description: 'GYD Grup uzman ekibi tarafından takip edilen, portföyümüzde düzenli olarak imarlı arsa sunulan bölge. Detaylı bilgi için ofisimizle iletişime geçin.',
  stats: [
    { value: '₺—', label: 'ortalama fiyat' },
    { value: '—', label: 'değer artışı' },
    { value: '—', label: 'aktif portföy' },
  ],
  highlights: ['GYD Grup uzman desteği', 'Hızlı tapu devri', 'Hukuki danışmanlık dahil'],
};

export default function RegionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const regionMeta = REGIONS.find((r) => r.slug === slug);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const r = await pb.collection('regions').getFirstListItem<Region>(
          `slug="${slug.replace(/"/g, '\\"')}"`,
        );
        if (!cancelled) setRegion(r);
      } catch {
        if (!cancelled) setRegion(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (!regionMeta) return <Navigate to="/bolgeler" replace />;
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const data = region ?? ({ ...FALLBACK, name: regionMeta.name, district: regionMeta.district, highlight: regionMeta.highlight } as Partial<Region>);
  const stats = data.stats?.length ? data.stats : FALLBACK.stats;
  const highlights = data.highlights?.length ? data.highlights : FALLBACK.highlights;

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
              <MapPin className="h-4 w-4" /> {data.district} · Ankara
            </div>
            <h1 className="font-display text-5xl font-medium leading-tight tracking-tight sm:text-6xl">
              {data.name}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground/75">{data.description}</p>
            {!region && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-300/80">
                <AlertCircle className="h-3.5 w-3.5" />
                Detaylı rapor admin panelden eklenebilir
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {stats.map((s) => (
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
          <h2 className="font-display text-3xl font-medium">Neden <span className="gold-text italic">{data.name}?</span></h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((h) => (
            <div key={h} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-card/40 p-4">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div className="text-sm text-foreground/80">{h}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide py-16">
        <div className="gradient-border p-10 text-center">
          <h3 className="font-display text-2xl font-medium">{data.name}'de arsa bakıyorum</h3>
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
