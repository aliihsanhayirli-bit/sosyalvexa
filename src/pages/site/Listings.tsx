import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Grid3x3, Map as MapIcon, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Form';
import { formatPrice, formatArea } from '@/lib/utils';
import { REGIONS } from '@/lib/constants';
import { Link } from 'react-router-dom';
import { pb, getFileUrl } from '@/lib/pb';

interface Listing {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  area_m2: number;
  region: string;
  city: string;
  neighborhood: string;
  imar_status: string;
  tapu_status: string;
  status: string;
  featured: boolean;
  photos: string[];
  features: Record<string, unknown> | null;
  lat: number;
  lng: number;
  created: string;
}

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await pb.collection('listings').getList<Listing>(1, 200, {
          filter: 'published = true',
          sort: '-featured,-created',
        });
        if (!cancelled) setListings(result.items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Listeler yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let arr = listings.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.title} ${l.neighborhood} ${l.imar_status} ${l.tapu_status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (region !== 'all' && l.region.toLowerCase() !== region) return false;
      return true;
    });
    if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sort === 'area-asc') arr.sort((a, b) => a.area_m2 - b.area_m2);
    else if (sort === 'area-desc') arr.sort((a, b) => b.area_m2 - a.area_m2);
    else arr.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1) || b.created.localeCompare(a.created));
    return arr;
  }, [listings, search, region, sort]);

  const photoUrl = (l: Listing) =>
    l.photos && l.photos.length > 0
      ? getFileUrl({ collectionId: l.collectionId, id: l.id }, l.photos[0])
      : null;

  return (
    <div className="container-wide py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <Badge variant="gold" className="mb-3">Arsa Portföyü</Badge>
        <h1 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
          Hayalinizdeki <span className="gold-text italic">arsa</span>
        </h1>
        <p className="mt-4 max-w-2xl text-foreground/60">
          Temelli ve çevresinde özenle seçilmiş, tüm hukuki kontrolleri yapılmış {listings.length} arsa.
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
        <div className="mt-3 text-xs text-muted-foreground">
          {loading ? 'Yükleniyor…' : error ? `Hata: ${error}` : `${filtered.length} sonuç bulundu`}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-card/40 p-12 text-center text-muted-foreground">
          Aradığınız kriterlere uygun arsa bulunamadı.
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => {
            const url = photoUrl(l);
            return (
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
                    {url ? (
                      <img
                        src={url}
                        alt={l.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,170,0.4),transparent_60%)]" />
                        <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                          <Building2 className="h-12 w-12" />
                        </div>
                      </>
                    )}
                    {l.featured && <Badge className="absolute left-3 top-3" variant="gold">Öne Çıkan</Badge>}
                    {l.imar_status && <div className="absolute right-3 top-3"><Badge variant="glass">{l.imar_status}</Badge></div>}
                  </div>
                  <div className="p-5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent">
                      <MapPin className="h-3 w-3" /> {REGIONS.find((r) => r.slug === l.region.toLowerCase())?.name ?? l.region}
                    </div>
                    <h3 className="line-clamp-2 font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                      {l.title}
                    </h3>
                    <div className="mt-4 flex items-end justify-between border-t border-white/[0.06] pt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{formatArea(l.area_m2)}</div>
                        <div className="font-display text-xl font-semibold text-foreground">{formatPrice(l.price, (l.currency as 'TRY' | 'USD') ?? 'TRY')}</div>
                      </div>
                      {l.tapu_status && <div className="text-right text-xs text-muted-foreground line-clamp-2 max-w-[40%]">{l.tapu_status}</div>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
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
            {filtered.map((l) => {
              const url = photoUrl(l);
              return (
                <Link
                  key={l.id}
                  to={`/arsalar/${l.slug}`}
                  className="flex gap-3 rounded-lg border border-white/[0.06] bg-card/40 p-3 transition-colors hover:border-accent/30"
                >
                  {url ? (
                    <img src={url} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary/30 to-accent/15 text-foreground/30">
                      <Building2 className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-semibold text-foreground line-clamp-1">{l.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {REGIONS.find((r) => r.slug === l.region.toLowerCase())?.name ?? l.region}
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">{formatArea(l.area_m2)}</span>
                      <span className="font-semibold text-accent">{formatPrice(l.price, (l.currency as 'TRY' | 'USD') ?? 'TRY')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
