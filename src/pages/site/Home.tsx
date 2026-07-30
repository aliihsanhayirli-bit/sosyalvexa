import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Target, CheckCircle2, ArrowRight, ExternalLink,
  ShieldCheck, Award, HandshakeIcon, Sparkles, Bot,
} from 'lucide-react';
import { Hero3D } from '@/components/three/Hero3D';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SERVICES, STATS, REFERENCES, VALUE_PROPS, COMPANY } from '@/lib/constants';
import {
  Facebook, Globe, Users, Bot as BotIcon, Rocket, Server, Wrench,
} from 'lucide-react';

const ICON_MAP: Record<string, typeof Facebook> = {
  Facebook, Globe, Users, Bot: BotIcon, Rocket, Server, Wrench,
};

const WHY = [
  { icon: ShieldCheck, title: 'KVKK Uyumlu', desc: 'Tüm süreçlerimiz Kişisel Verilerin Korunması mevzuatına uygun yürütülür.' },
  { icon: Award, title: '5+ Yıl Tecrübe', desc: 'Sektörde 30+ tamamlanan proje, farklı ölçeklerde 25+ aktif müşteri.' },
  { icon: HandshakeIcon, title: 'Tek Elden, Uçtan Uca', desc: 'Meta + Web tek sözleşmeyle. Dağınık ajanslarla uğraşmayın.' },
  { icon: Sparkles, title: 'AI Destekli Operasyon', desc: 'Sadece kurulum değil; ölçüm, otomasyon ve sürekli optimizasyon.' },
];

const FADE = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function Home() {
  const [currentRef, setCurrentRef] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentRef((c) => (c + 1) % REFERENCES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Hero3D />

      <section className="container-wide pt-10 sm:pt-14">
        <motion.div
          {...FADE}
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
                <span className="gold-text italic">Yapay zeka çalışanlarımızla</span> hizmetinizdeyiz.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container-wide py-32">
        <motion.div {...FADE} className="mb-16 text-center">
          <Badge variant="gold" className="mb-4">Hizmetlerimiz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            İşletmeniz için <span className="gold-text italic">uçtan uca dijital</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
            Meta altyapısından yapay zeka asistanına — 1 kerede tam.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s, i) => {
            const Icon = ICON_MAP[s.icon] || Globe;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group"
              >
                <Link
                  to={`/hizmetler/${s.slug}`}
                  className="block h-full rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{s.short}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent">
                    Detay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative container-wide py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <motion.div {...FADE} className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-4">Referanslarımız</Badge>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Tamamlanan <span className="gold-text italic">projeler</span>
            </h2>
          </div>
          <Link to="/referanslar" className="group inline-flex items-center gap-1.5 text-sm text-accent hover:gap-3 transition-all">
            Tümünü Gör <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REFERENCES.map((r, i) => (
            <motion.a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-card/40 backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 ${
                i === currentRef ? 'border-accent/60 ring-1 ring-accent/20' : 'border-white/[0.06]'
              }`}
            >
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/50 via-primary/30 to-accent/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,168,43,0.2),transparent_60%)]" />
                <div className="font-display text-3xl font-bold gold-text">
                  {r.title.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()}
                </div>
                <div className="absolute right-3 top-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-semibold backdrop-blur-md">
                  {r.year}
                </div>
                <div className="absolute left-3 top-3">
                  <Badge variant="gold" className="text-[10px]">{r.tag}</Badge>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs uppercase tracking-wider text-accent">{r.industry}</div>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65 line-clamp-3">{r.description}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" /> {r.url.replace(/^https?:\/\//, '')}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="container-wide py-32">
        <motion.div {...FADE} className="mb-16 text-center">
          <Badge variant="gold" className="mb-4">Neden Vexabiz?</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Üç <span className="gold-text italic">sözümüz</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((vp, i) => {
            const Icon = i === 0 ? Zap : i === 1 ? Target : CheckCircle2;
            return (
              <motion.div
                key={vp.title}
                {...FADE}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-white/[0.06] bg-card/40 p-7 backdrop-blur-sm transition-all hover:border-accent/40"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{vp.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{vp.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container-wide py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div {...FADE}>
            <Badge variant="gold" className="mb-4">Neden Bizi Seçmelisiniz?</Badge>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Teknoloji <span className="gold-text italic">+ strateji</span> + uygulama
            </h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">
              Vexabiz, sadece bir dijital ajans değil; işletmenizin büyümesini hızlandıran uçtan uca bir dönüşüm ortağı. Stratejiden kuruluma, ölçümden optimizasyona.
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

          <motion.div {...FADE} className="relative">
            <div className="absolute -inset-8 rounded-3xl bg-accent/10 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-md ${i % 2 ? 'sm:mt-8' : ''}`}
                >
                  <div className="font-display text-3xl font-semibold gold-text sm:text-4xl">{s.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-wide py-32">
        <div className="gradient-border relative overflow-hidden p-12 text-center sm:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,43,0.18),transparent_60%)]" />
          <div className="relative">
            <Badge variant="gold" className="mb-4">Ücretsiz Keşif Görüşmesi</Badge>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Dijital dönüşümünüze <span className="gold-text italic">bugün</span> başlayın
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/70">
              30 dakikalık görüşmeyle işletmenizin ihtiyacını anlayıp size özel yol haritası çıkaralım.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="gold" size="lg" onClick={() => (window.location.href = '/iletisim')}>
                Görüşme Talep Et
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
