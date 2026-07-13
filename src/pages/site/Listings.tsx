import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Grid3x3, Map as MapIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { formatPrice, formatArea } from '@/lib/utils';
import { REGIONS } from '@/lib/constants';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoListing {
  id: string; slug: string; title: string; price: number; area: number; region: string;
  imar: string; tag?: string; tapu: string;
}

const DEMO: DemoListing[] = [
  { id: '1', slug: 'temelli-merkez-1250', title: 'Temelli Merkez · 1.250 m² İmarlı Konut Arsası', price: 2400000, area: 1250, region: 'temelli', imar: 'Konut (E:0.30)', tag: 'Yeni', tapu: 'Hazır' },
  { id: '2', slug: 'polatli-yolu-980', title: 'Polatlı Yolu Üzeri · 980 m²', price: 1850000, area: 980, region: 'polatli', imar: 'Konut (E:0.20)', tag: 'Fırsat', tapu: 'Hazır' },
  { id: '3', slug: 'sincan-sanayi-1640', title: 'Sincan Sanayi Yanı · 1.640 m² Yatırımlık', price: 3100000, area: 1640, region: 'cankaya', imar: 'Ticari (E:0.50)', tag: 'Popüler', tapu: 'Hazır' },
  { id: '4', slug: 'haymana-koy-720', title: 'Haymana Köy Cephesi · 720 m² Sıfır Arsa', price: 1450000, area: 720, region: 'haymana', imar: 'Tarla', tapu: 'Hazır' },
  { id: '5', slug: 'temelli-yatirim-2200', title: 'Temelli OSB Yakını · 2.200 m² Yatırım Arsası', price: 4200000, area: 2200, region: 'temelli', imar: 'Sanayi (E:0.60)', tag: 'Yatırım', tapu: 'Hazır' },
  { id: '6', slug: 'bala-merkez-1100', title: 'Bala Merkez · 1.100 m² Konut Arsası', price: 1750000, area: 1100, region: 'bala', imar: 'Konut (E:0.25)', tapu: 'Hazır' },
  { id: '7', slug: 'etimesgut-550', title: 'Etimesgut Sınırı · 550 m² Hobi Bahçesi', price: 950000, area: 550, region: 'etimesgut', imar: 'Hobi Bahçesi', tag: 'Yeni', tapu: 'Hazır' },
  { id: '8', slug: 'temelli-osb-3000', title: 'Temelli OSB Karşısı · 3.000 m² Sanayi', price: 6800000, area: 3000, region: 'temelli', imar: 'Sanayi (E:0.70)', tag: 'Stratejik', tapu: 'Hazır' },
];

export default function Listings() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const filtered = useMemo(() => {
    let arr = DEMO.filter((l) => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (region !== 'all' && l.region !== region) return false;
      return true;
    });
    if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sort === 'area-asc') arr.sort((a, b) => a.area - b.area);
    else if (sort === 'area-desc') arr.sort((a, b) => b.area - a.area);
    return arr;
  }, [search, region, sort]);

  return (
    <div className="container-wide py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <Badge variant="gold" className="mb-3">Arsa Portföyü</Badge>
        <h1 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
          Hayalinizdeki <span className="gold-text italic">arsa</span>
        </h1>
        <p className="mt-4 max-w-2xl text-foreground/60">
          Temelli ve çevresinde özenle seçilmiş, tüm hukuki kontrolleri yapılmış {DEMO.length} arsa.
        </p>
      </motion.div>

      <div className="mb-8 rounded-xl border border-white/[0.06] bg-card/40 p-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Arsa ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={region} onChange={(e) => setRegion(e.target.value)} className="lg:w-48">
            <option value="all">Tüm Bölgeler</option>
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="lg:w-48">
            <option value="newest">En Yeni</option>
            <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
            <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
            <option value="area-asc">Alan (Küçük → Büyük)</option>
            <option value="area-desc">Alan (Büyük → Küçük)</option>
          </Select>
          <div className="flex rounded-md border border-border p-1">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${view === 'grid' ? 'bg-accent/15 text-accent' : 'text-muted-foreground'}`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${view === 'map' ? 'bg-accent/15 text-accent' : 'text-muted-foreground'}`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Harita
            </button>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{filtered.length} sonuç bulundu</div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/arsalar/${l.slug}`}
                className="group block overflow-hidden rounded-xl border border-white/[0.06] bg-card/40 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/10"
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/30 to-accent/15">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,170,0.4),transparent_60%)]" />
                  <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                    <Building2 className="h-12 w-12" />
                  </div>
                  {l.tag && <Badge className="absolute left-3 top-3" variant="gold">{l.tag}</Badge>}
                  <div className="absolute right-3 top-3">
                    <Badge variant="glass">{l.imar}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent">
                    <MapPin className="h-3 w-3" /> {REGIONS.find((r) => r.slug === l.region)?.name}
                  </div>
                  <h3 className="line-clamp-2 font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    {l.title}
                  </h3>
                  <div className="mt-4 flex items-end justify-between border-t border-white/[0.06] pt-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{formatArea(l.area)}</div>
                      <div className="font-display text-xl font-semibold text-foreground">{formatPrice(l.price)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{l.tapu}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="relative h-[600px] overflow-hidden rounded-xl border border-white/[0.06] bg-card/40">
            <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
              <div className="text-center">
                <MapIcon className="mx-auto h-12 w-12" />
                <div className="mt-3 text-sm">Harita görünümü</div>
                <div className="mt-1 text-xs text-muted-foreground">PocketBase + MapLibre entegrasyonu hazır olduğunda parseller haritada görünecek</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,170,0.06),transparent_70%)]" />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((l) => (
              <Link
                key={l.id}
                to={`/arsalar/${l.slug}`}
                className="block rounded-lg border border-white/[0.06] bg-card/40 p-4 transition-colors hover:border-accent/30"
              >
                <div className="font-display text-base font-semibold text-foreground line-clamp-1">{l.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {REGIONS.find((r) => r.slug === l.region)?.name}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatArea(l.area)}</span>
                  <span className="font-semibold text-accent">{formatPrice(l.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
