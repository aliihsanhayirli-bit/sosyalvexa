import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, TrendingUp, Users, Map, Sparkles, Building2, HandshakeIcon, Bot } from 'lucide-react';
import { Hero3D } from '@/components/three/Hero3D';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SERVICES, STATS, REGIONS, COMPANY } from '@/lib/constants';
import { formatPrice, formatArea } from '@/lib/utils';
import { pb, getFileUrl } from '@/lib/pb';

interface FeaturedListing {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  area_m2: number;
  region: string;
  photos: string[];
}

const FALLBACK_FEATURED: { id: string; title: string; price: number; area: number; region: string; tag: string }[] = [
  { id: 'f1', title: 'Temelli Merkez · 1.250 m² İmarlı Konut Arsası', price: 2400000, area: 1250, region: 'Temelli', tag: 'Yeni' },
  { id: 'f2', title: 'Polatlı Yolu Üzeri · 980 m² Konut İmarlı', price: 1850000, area: 980, region: 'Polatlı', tag: 'Fırsat' },
  { id: 'f3', title: 'Sincan Sanayi Yanı · 1.640 m² Yatırımlık', price: 3100000, area: 1640, region: 'Sincan', tag: 'Popüler' },
];

const WHY = [
  { icon: ShieldCheck, title: 'Güvenli Süreç', desc: 'Tapu, imar ve hukuki kontrolleri sizin adınıza yönetiyoruz.' },
  { icon: Award, title: '15+ Yıl Tecrübe', desc: 'Temelli bölgesinde derin yerel bilgi ve güçlü portföy.' },
  { icon: TrendingUp, title: 'Değer Artışı Odaklı', desc: 'Yatırımınızın uzun vadeli değer kazanmasını sağlıyoruz.' },
  { icon: HandshakeIcon, title: 'Şeffaf Komisyon', desc: 'Gizli ücret yok, her adım net ve yazılı sözleşmeli.' },
];

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await pb.collection('listings').getList<FeaturedListing>(1, 4, {
          filter: 'published = true',
          sort: '-featured,-created',
        });
        if (!cancelled) setFeatured(items);
      } catch {
        // Hata olursa boş bırak, fallback gösterilir
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const showFallback = !loading && featured.length === 0;
  const featuredToShow = featured.length > 0 ? featured : (showFallback ? FALLBACK_FEATURED : []);

  return (
    <>
      <Hero3D />

      {/* DİJİTAL DÖNÜŞÜM BANNER */}
      <section className="container-wide pt-10 sm:pt-14">
        <motion.div
          {...fadeIn}
          className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 p-5 sm:p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(212,168,43,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(212,168,43,0.12),transparent_55%)]" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/30">
              <Bot className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="mb-1 inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Yeni</span>
              </div>
              <p className="font-display text-base leading-relaxed text-foreground sm:text-lg">
                Dijital dönüşümümüz tamamlandı, <span className="gold-text italic">Yapay Zeka Çalışanlarımızla</span> hizmet vermeye devam ediyoruz.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SERVİSLER */}
      <section className="container-wide py-32">
        <motion.div {...fadeIn} className="mb-16 text-center">
          <Badge variant="gold" className="mb-4">Hizmetlerimiz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Her adımda <span className="gold-text italic">yanınızdayız</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
            Arsa alım-satımından tapu işlemlerine, yatırım danışmanlığından hukuki süreç yönetimine kadar uçtan uca çözüm.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group gradient-border p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {s.icon === 'TrendingUp' && <TrendingUp className="h-5 w-5" />}
                {s.icon === 'Search' && <Map className="h-5 w-5" />}
                {s.icon === 'LineChart' && <Sparkles className="h-5 w-5" />}
                {s.icon === 'ShieldCheck' && <ShieldCheck className="h-5 w-5" />}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ÖNE ÇIKAN ARSALAR */}
      <section className="relative container-wide py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <motion.div {...fadeIn} className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-4">Öne Çıkan Portföy</Badge>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Seçilmiş <span className="gold-text italic">fırsatlar</span>
            </h2>
          </div>
          <Link to="/arsalar" className="group inline-flex items-center gap-1.5 text-sm text-accent hover:gap-3 transition-all">
            Tüm Arsaları Gör <span>→</span>
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredToShow.length === 0 ? (
            <div className="col-span-full rounded-xl border border-white/[0.06] bg-card/40 p-12 text-center text-sm text-muted-foreground">
              Henüz öne çıkan arsa eklenmemiş. Admin panelden <code className="rounded bg-white/5 px-1.5 py-0.5">featured=true</code> olarak işaretleyin.
            </div>
          ) : (
            featuredToShow.map((l, i) => {
              const isFallback = !('collectionId' in l);
              const url = !isFallback && l.photos && l.photos.length > 0
                ? getFileUrl({ collectionId: l.collectionId, id: l.id }, l.photos[0])
                : null;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group overflow-hidden rounded-xl border border-white/[0.06] bg-card/40 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10"
                >
                  <Link to={`/arsalar/${('slug' in l && l.slug) || ''}`} className="block">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/40 to-accent/20">
                      {url ? (
                        <img src={url} alt={l.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,170,0.4),transparent_60%)]" />
                          <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                            <Building2 className="h-12 w-12" />
                          </div>
                        </>
                      )}
                      {('tag' in l) && l.tag && <Badge className="absolute left-3 top-3" variant="gold">{l.tag}</Badge>}
                    </div>
                    <div className="p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-accent">{l.region}</div>
                      <h3 className="line-clamp-1 font-display text-lg font-semibold text-foreground">{l.title}</h3>
                      <div className="mt-3 flex items-end justify-between border-t border-white/[0.06] pt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">{formatArea(l.area_m2 ?? l.area)}</div>
                          <div className="font-display text-lg font-semibold text-foreground">{formatPrice(l.price, (('currency' in l && l.currency as 'TRY' | 'USD') || 'TRY'))}</div>
                        </div>
                        <span className="text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">Detay →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* NEDEN GYD */}
      <section className="container-wide py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div {...fadeIn}>
            <Badge variant="gold" className="mb-4">Neden GYD Grup?</Badge>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Ankara'da <span className="gold-text italic">güvenilir</span> imarlı arsa adresi
            </h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">
              GYD Grup, sadece bir arsa bulma platformu değil; her müşterisine özel yatırım stratejisi, hukuki güvence ve uzun vadeli değer artışı sunan, <strong>imarlı arsa</strong> odaklı bir danışmanlık şirketidir.
            </p>
            <div className="mt-10 space-y-5">
              {WHY.map((w, i) => (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <w.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-foreground">{w.title}</h4>
                    <p className="text-sm text-foreground/60">{w.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn} className="relative">
            <div className="absolute -inset-8 rounded-3xl bg-accent/10 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md ${i % 2 ? 'sm:mt-8 lg:mt-0' : ''}`}
                >
                  <div className="font-display text-4xl font-semibold gold-text">{s.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* BÖLGELER */}
      <section className="container-wide py-32">
        <motion.div {...fadeIn} className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Bölgeler</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Uzmanı olduğumuz <span className="gold-text italic">bölgeler</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <motion.div
              key={r.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/bolgeler/${r.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-card/40 p-5 backdrop-blur-sm transition-all hover:border-accent/40 hover:bg-card/80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-semibold text-foreground">{r.name}</h3>
                    {r.highlight && <Badge variant="gold" className="text-[10px]">Uzman</Badge>}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.district} · Ankara</div>
                </div>
                <div className="text-2xl text-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-accent">→</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide py-32">
        <div className="gradient-border relative overflow-hidden p-12 text-center sm:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,170,0.18),transparent_60%)]" />
          <div className="relative">
            <Badge variant="gold" className="mb-4">Ücretsiz Danışmanlık</Badge>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Yatırım yolculuğunuza <span className="gold-text italic">bugün</span> başlayın
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/70">
              15 dakikalık bir görüşmeyle bütçenize ve hedefinize en uygun arsa seçeneklerini birlikte değerlendirelim.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="gold" size="lg" onClick={() => (window.location.href = '/iletisim')}>
                Randevu Talep Et
              </Button>
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-8 py-3 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-white/[0.08]"
              >
                WhatsApp'tan Yaz
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
