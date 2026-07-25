import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SERVICES, COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const FADE = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return <Navigate to="/hizmetler" replace />;

  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06] py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,168,43,0.12),transparent_55%)]" />
        <div className="container-wide relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <Link to="/hizmetler" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
              <ArrowLeft className="h-4 w-4" /> Tüm Hizmetler
            </Link>
            <Badge variant="gold" className="mb-4">{service.short}</Badge>
            <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
              {service.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground/70">{service.desc}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              {service.priceFrom && (
                <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-accent">
                  <Tag className="h-4 w-4" />
                  <span>Başlangıç: <strong>{service.priceFrom}</strong></span>
                </div>
              )}
              {service.duration && (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-foreground/80">
                  <Clock className="h-4 w-4" />
                  <span>Teslim: <strong>{service.duration}</strong></span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <motion.div {...FADE}>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Neler <span className="gold-text italic">yapıyoruz</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {service.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-card/30 p-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-foreground/85">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.aside {...FADE} className="space-y-4">
            <div className="gradient-border relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,43,0.18),transparent_60%)]" />
              <div className="relative">
                <Badge variant="gold" className="mb-3">Teklif Al</Badge>
                <h3 className="font-display text-2xl font-semibold">Size özel çözüm</h3>
                <p className="mt-2 text-sm text-foreground/70">
                  30 dakikalık ücretsiz keşif görüşmesinde ihtiyacınızı anlayıp yol haritası çıkaralım.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Button variant="gold" onClick={() => (window.location.href = '/iletisim')}>
                    Teklif Talep Et
                  </Button>
                  <a
                    href={COMPANY.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/10"
                  >
                    WhatsApp'tan Yaz
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-card/30 p-5 text-sm text-foreground/70">
              <div className="font-semibold text-foreground">Neden Vexabiz?</div>
              <ul className="mt-3 space-y-1.5">
                <li>✓ 30+ tamamlanan proje</li>
                <li>✓ Hızlı teslim (3-15 gün)</li>
                <li>✓ Uçtan uca dijital dönüşüm</li>
                <li>✓ KVKK uyumlu</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="container-wide py-24">
        <h2 className="mb-12 text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Diğer <span className="gold-text italic">hizmetlerimiz</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              to={`/hizmetler/${s.slug}`}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-sm transition-all hover:border-accent/40',
              )}
            >
              <div className="mb-3 font-display text-lg font-semibold">{s.title}</div>
              <p className="text-sm text-foreground/60">{s.short}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent">
                İncele <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
