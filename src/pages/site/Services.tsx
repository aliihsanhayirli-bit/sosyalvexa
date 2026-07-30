import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SERVICES, PROCESS, COMPANY } from '@/lib/constants';
import {
  Facebook, Globe, Users, Bot as BotIcon, Rocket, Server, Wrench, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS: Record<string, typeof Facebook> = {
  Facebook, Globe, Users, Bot: BotIcon, Rocket, Server, Wrench,
};

export default function Services() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Hizmetlerimiz</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Her ihtiyaca <span className="gold-text italic">özel çözüm</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Diş klinikleri, fizik tedavi merkezleri ve güzellik merkezleri başta olmak üzere — Meta altyapısından yapay zeka asistanına, her hizmetimiz tek başına veya paket halinde, hızlı ve uçtan uca.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] || Globe;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/hizmetler/${s.slug}`}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 p-8 backdrop-blur-sm transition-all hover:border-accent/40"
                >
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-all group-hover:bg-accent/20" />
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-gold-500/10 text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-semibold">{s.title}</h2>
                    <p className="mt-3 text-foreground/70 leading-relaxed">{s.short}</p>
                    <div className="mt-5 flex items-center gap-3 text-sm">
                      {s.priceFrom && (
                        <span className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent">
                          Başlangıç: {s.priceFrom}
                        </span>
                      )}
                      {s.duration && (
                        <span className="text-xs text-muted-foreground">· {s.duration}</span>
                      )}
                    </div>
                    <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
                      Detaylı bilgi al <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Sürecimiz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">5 adımda <span className="gold-text italic">hızlı</span> süreç</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-sm"
            >
              <div className="font-display text-3xl font-semibold gold-text">{p.step}</div>
              <div className="mt-3 font-display text-lg font-semibold">{p.title}</div>
              <div className="mt-2 text-sm text-foreground/60">{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="gradient-border relative overflow-hidden p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,43,0.18),transparent_60%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">Hangi hizmet sizin için?</h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/70">30 dakikalık ücretsiz ön görüşmeyle ihtiyacınızı anlayıp doğru hizmeti birlikte belirleyelim.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="gold" onClick={() => (window.location.href = '/iletisim')}>Görüşme Talep Et</Button>
              <a href={`tel:${COMPANY.phoneRaw}`} className="text-sm text-foreground/70 hover:text-accent">
                veya {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
