import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { REFERENCES } from '@/lib/constants';

const FADE = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function References() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div {...FADE} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Referanslarımız</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Yaptığımız <span className="gold-text italic">işler</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Farklı sektörlerden işletmelere kurumsal site, dijital altyapı ve özel yazılım çözümleri. Her biri canlı, her biri Vexabiz imzası.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
            >
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/50 via-primary/30 to-accent/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,168,43,0.2),transparent_60%)]" />
                <Globe className="h-12 w-12 text-accent/40 transition-all group-hover:scale-110 group-hover:text-accent" />
                <div className="absolute left-3 top-3">
                  <Badge variant="gold" className="text-[10px]">{r.tag}</Badge>
                </div>
                <div className="absolute right-3 top-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-semibold backdrop-blur-md">
                  {r.year}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs uppercase tracking-wider text-accent">{r.industry}</div>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">{r.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate">{r.url.replace(/^https?:\/\//, '')}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="container-wide pb-24">
        <div className="gradient-border relative overflow-hidden p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,43,0.18),transparent_60%)]" />
          <div className="relative">
            <Badge variant="gold" className="mb-4">Sıradaki Projeniz</Badge>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">
              Siz de <span className="gold-text italic">listemize</span> eklenin
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/70">
              30 dakikalık ücretsiz keşif görüşmesiyle projenizi konuşalım, yol haritası çıkaralım.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="gold" onClick={() => (window.location.href = '/iletisim')}>
                Görüşme Talep Et
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/hizmetler')}>
                Hizmetleri İncele
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
