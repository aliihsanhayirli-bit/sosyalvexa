import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Maximize2, FileCheck, Layers, Phone, MessageCircle, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatArea } from '@/lib/utils';
import { COMPANY, REGIONS } from '@/lib/constants';
import { pb, getFileUrl } from '@/lib/pb';

interface Listing {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  area_m2: number;
  region: string;
  city: string;
  neighborhood: string;
  imar_status: string;
  tapu_status: string;
  status: string;
  photos: string[];
  features: Record<string, unknown> | null;
  lat: number;
  lng: number;
  created: string;
  updated: string;
}

const FEATURE_LABELS: Record<string, string> = {
  share_m2: 'Hisse Büyüklüğü',
  share_ratio: 'Hisse Oranı',
  parcel_no: 'Ada/Parsel',
  property_type: 'Taşınmaz Türü',
  unit_price_tl_m2: 'Birim Fiyat',
};

function formatFeatureValue(key: string, value: unknown): string {
  if (key === 'unit_price_tl_m2' && typeof value === 'number') {
    return `${value.toLocaleString('tr-TR')} TL/m²`;
  }
  if (key === 'share_ratio' && typeof value === 'number') {
    return `%${(value * 100).toFixed(2)}`;
  }
  if (key === 'share_m2' && typeof value === 'number') {
    return `${value.toLocaleString('tr-TR')} m²`;
  }
  return String(value);
}

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await pb.collection('listings').getFirstListItem<Listing>(
          `slug="${slug.replace(/"/g, '\\"')}"`,
        );
        if (!cancelled) setListing(result);
      } catch (e) {
        if (!cancelled) {
          setListing(null);
          setError(e instanceof Error ? e.message : 'Arsa bulunamadı');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return <Navigate to="/arsalar" replace />;
  }

  const region = REGIONS.find((r) => r.slug === listing.region.toLowerCase());
  const photoUrls = (listing.photos ?? []).map((p) =>
    getFileUrl({ collectionId: listing.collectionId, id: listing.id }, p),
  );
  const featureEntries = listing.features ? Object.entries(listing.features) : [];
  const neighborhoodLabel = [listing.neighborhood, listing.city].filter(Boolean).join(' · ');
  const updatedLabel = new Date(listing.updated).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container-wide py-12">
      <Link to="/arsalar" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Tüm Arsalar
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {listing.featured && <Badge variant="gold">Öne Çıkan</Badge>}
              {region && <Badge variant="outline">{region.name}</Badge>}
              {listing.status === 'available' && <Badge variant="glass">Satılık</Badge>}
              {listing.status === 'reserved' && <Badge variant="glass">Rezerve</Badge>}
              {listing.imar_status && <Badge variant="glass">{listing.imar_status}</Badge>}
            </div>
            <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl">{listing.title}</h1>
            {neighborhoodLabel && (
              <div className="mt-3 flex items-center gap-1.5 text-foreground/60">
                <MapPin className="h-4 w-4 text-accent" /> {neighborhoodLabel}
              </div>
            )}
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Maximize2, label: 'Alan', value: formatArea(listing.area_m2) },
              { icon: Layers, label: 'İmar', value: listing.imar_status || '—' },
              { icon: FileCheck, label: 'Tapu', value: listing.tapu_status ? listing.tapu_status.split(' ')[0] : '—' },
              { icon: CheckCircle2, label: 'Güncellendi', value: updatedLabel },
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
                <div className="line-clamp-2 font-display text-base font-semibold text-foreground">{s.value}</div>
              </motion.div>
            ))}
          </div>

          {photoUrls.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] bg-card">
                  <img src={url} alt={`${listing.title} fotoğraf ${i + 1}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-primary/30 to-accent/10">
                <div className="absolute inset-0 flex items-center justify-center text-foreground/30 text-xs">
                  Fotoğraf eklenmemiş
                </div>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-semibold">Açıklama</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/75">{listing.description}</p>
          </div>

          {featureEntries.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-semibold">Özellikler</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {featureEntries.map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{FEATURE_LABELS[key] ?? key}:</span>
                    <span>{formatFeatureValue(key, value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listing.lat && listing.lng && (
            <div className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-semibold">Konum</h2>
              <div className="relative h-80 overflow-hidden rounded-xl border border-white/[0.06] bg-card/40">
                <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-accent" />
                    <div className="mt-2 text-sm font-semibold text-foreground">{neighborhoodLabel || 'Konum'}</div>
                    <div className="mt-1 text-xs">{listing.lat.toFixed(4)}°N, {listing.lng.toFixed(4)}°E</div>
                    {neighborhoodLabel && (
                      <a
                        href={`https://www.google.com/maps?q=${listing.lat},${listing.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-accent hover:underline"
                      >
                        Google Maps'te aç →
                      </a>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,170,0.08),transparent_70%)]" />
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Liste Fiyatı</div>
            <div className="mt-1 font-display text-4xl font-semibold gold-text">
              {formatPrice(listing.price, (listing.currency as 'TRY' | 'USD') ?? 'TRY')}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ~{formatPrice(Math.round(listing.price / Math.max(1, listing.area_m2)))}/m²
            </div>

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
              <div className="font-semibold text-foreground">Yer Görüşmesi</div>
              <p className="mt-1.5">Arsayı birlikte gezmek için randevu oluşturalım. Profesyonel fotoğraf ve konum bilgisi anlık olarak paylaşılır.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
