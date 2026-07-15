import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { MapPin, TrendingUp, Building2 } from 'lucide-react';
import { REGIONS } from '@/lib/constants';

const REGION_DETAILS: Record<string, { description: string; stats: { value: string; label: string }[] }> = {
  temelli: {
    description: 'Ankara\'nın batısında, hızla gelişen sanayi ve konut bölgesi. OSB yakınlığı, artan nüfus ve altyapı yatırımlarıyla yatırımcıların gözdesi.',
    stats: [
      { value: '₺2.4M', label: 'ortalama m² fiyatı' },
      { value: '%35', label: 'son 3 yıl değer artışı' },
      { value: '48', label: 'aktif portföy' },
    ],
  },
  polatli: {
    description: 'Büyük ova içinde, tarım ve konut imarlı arsalar için ideal. Ulaşım ağına yakın, sakin ve yatırımcı dostu.',
    stats: [
      { value: '₺1.8M', label: 'ortalama fiyat' },
      { value: '%22', label: 'değer artışı' },
      { value: '24', label: 'aktif portföy' },
    ],
  },
  cankaya: {
    description: 'Başkentin en merkezi lokasyonlarından. Ticari ve konut imarlı arsalar prim değer taşıyor.',
    stats: [
      { value: '₺4.2M', label: 'ortalama fiyat' },
      { value: '%28', label: 'değer artışı' },
      { value: '15', label: 'aktif portföy' },
    ],
  },
  etimesgut: {
    description: 'Hobi bahçeleri ve küçük yatırımlar için tercih edilen, ulaşımı kolay bölge.',
    stats: [
      { value: '₺1.0M', label: 'ortalama fiyat' },
      { value: '%20', label: 'değer artışı' },
      { value: '8', label: 'aktif portföy' },
    ],
  },
};

export default function Regions() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Bölgeler</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Uzmanı olduğumuz <span className="gold-text italic">4 bölge</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Her bölgenin imar durumunu, fiyat trendlerini ve yatırım potansiyelini biliyoruz. Doğru bölgede doğru yatırım için bölge raporlarımızdan faydalanın.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => {
            const detail = REGION_DETAILS[r.slug];
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
                    {r.highlight && (
                      <Badge variant="gold" className="absolute right-3 top-3">Uzman Bölge</Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent">
                      <MapPin className="h-3 w-3" /> {r.district}
                    </div>
                    <h3 className="font-display text-2xl font-semibold">{r.name}</h3>
                    <p className="mt-2 text-sm text-foreground/60 line-clamp-2">{detail?.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <span className="text-muted-foreground">{detail?.stats[2].value} aktif ilan</span>
                      <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">Detay →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
