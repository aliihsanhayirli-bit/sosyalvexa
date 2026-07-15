import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { REGIONS } from '@/lib/constants';
import { pb } from '@/lib/pb';

interface Region {
  id: string;
  slug: string;
  name: string;
  district: string;
  highlight: boolean;
  description: string;
  stats: { value: string; label: string }[];
}

const FALLBACK_DESCRIPTION = 'YCA Yatırım uzman ekibi tarafından takip edilen, portföyümüzde düzenli olarak arsa sunulan bölge. Detaylı bilgi için ofisimizle iletişime geçin.';
const FALLBACK_STATS: { value: string; label: string }[] = [
  { value: '—', label: 'ortalama fiyat' },
  { value: '—', label: 'değer artışı' },
  { value: '—', label: 'aktif portföy' },
];

export default function Regions() {
  const [regionData, setRegionData] = useState<Record<string, Pick<Region, 'description' | 'stats' | 'highlight'>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await pb.collection('regions').getList<Region>(1, 50, { sort: 'name' });
        if (!cancelled) {
          const map: typeof regionData = {};
          for (const r of items) {
            map[r.slug] = {
              description: r.description,
              stats: r.stats ?? FALLBACK_STATS,
              highlight: r.highlight,
            };
          }
          setRegionData(map);
        }
      } catch {
        // Hata olursa boş bırak, fallback'ler gösterilir
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Bölgeler</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Uzmanı olduğumuz <span className="gold-text italic">{REGIONS.length} bölge</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Her bölgenin imar durumunu, fiyat trendlerini ve yatırım potansiyelini biliyoruz. Doğru bölgede doğru yatırım için bölge raporlarımızdan faydalanın.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r, i) => {
              const detail = regionData[r.slug];
              const description = detail?.description ?? FALLBACK_DESCRIPTION;
              const isHighlight = detail?.highlight ?? r.highlight ?? false;
              const stats = detail?.stats ?? FALLBACK_STATS;
              const portCount = stats[2]?.value ?? '—';
              return (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/bolgeler/${r.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm transition-all hover:border-accent/40"
                  >
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/30 to-accent/15">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,170,0.4),transparent_60%)]" />
                      <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                        <Building2 className="h-12 w-12" />
                      </div>
                      {isHighlight && (
                        <Badge variant="gold" className="absolute right-3 top-3">Uzman Bölge</Badge>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent">
                        <MapPin className="h-3 w-3" /> {r.district}
                      </div>
                      <h3 className="font-display text-2xl font-semibold">{r.name}</h3>
                      <p className="mt-2 text-sm text-foreground/60 line-clamp-2">{description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                        <span className="text-muted-foreground">{portCount} aktif ilan</span>
                        <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">Detay →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
