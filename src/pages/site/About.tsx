import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Award, Target, Eye, Heart, Users, Rocket, Calendar, MapPin, Zap } from 'lucide-react';
import { STATS, COMPANY, VALUE_PROPS } from '@/lib/constants';

const VALUES = [
  { icon: Award, title: 'Mükemmellik', desc: 'Her projede kalite, her süreçte titizlik.' },
  { icon: Target, title: 'Sonuç Odaklılık', desc: 'Ölçülebilir KPI ve net teslim.' },
  { icon: Eye, title: 'Şeffaflık', desc: 'Gizli ücret yok, net sözleşme, anlık rapor.' },
  { icon: Heart, title: 'Güven', desc: '5+ yıllık ilişki ağı ve yüzlerce referans.' },
];

const TIMELINE = [
  { year: '2018', title: 'Kuruluş', desc: 'Vexabiz, küçük bir ekiple KOBİ\'lere web tasarım ve dijital pazarlama hizmetleri sunmaya başladı.' },
  { year: '2020', title: 'Meta Uzmanlığı', desc: 'Facebook & Instagram Business Manager kurulumu ve reklam yönetimi yetkinliği kazandık.' },
  { year: '2022', title: 'CRM & Otomasyon', desc: 'HubSpot, Bitrix24, Pipedrive entegrasyonları ile satış otomasyonu hizmeti ekledik.' },
  { year: '2024', title: 'Yapay Zeka', desc: 'İşletmelere özel AI asistan ve omnichannel bot geliştirme hizmetini portföye ekledik.' },
  { year: '2025', title: 'Tam Dijital Dönüşüm', desc: 'Meta + Web + CRM + AI paketlerini tek elden uçtan uca sunmaya başladık.' },
];

const TEAM = [
  { name: 'Ali İhsan Hayırlı', role: 'Kurucu & Genel Müdür', bio: 'Yazılım ve dijital dönüşüm alanında 10+ yıl tecrübe; Vexabiz\'in stratejik yönlendiricisi.' },
  { name: 'Ece Yıldız', role: 'Dijital Strateji Direktörü', bio: 'Meta, Google ve TikTok reklam stratejileri; 100+ KOBİ dönüşümü.' },
  { name: 'Murat Demir', role: 'Teknik Lider', bio: 'Full-stack geliştirici; CRM, panel ve AI entegrasyonları.' },
];

export default function About() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Hakkımızda</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Dijital dönüşümün <span className="gold-text italic">uçtan uca</span> adresi
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            <strong>{COMPANY.name}</strong> olarak, 2018'den bu yana Türkiye genelinde KOBİ ve işletmelere <strong>Meta Business Manager kurulumu</strong> ve <strong>kurumsal web sitesi</strong> hizmetleri veriyoruz. Amacımız sadece kurulum yapmak değil; işletmenizin dijital altyapısını uçtan uca kurup ölçülebilir büyüme sağlamak.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-sm">
              <div className="font-display text-4xl font-semibold gold-text">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Üç Sözümüz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Birlikte <span className="gold-text italic">çalışırken</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((vp, i) => {
            const Icon = i === 0 ? Zap : i === 1 ? Target : Rocket;
            return (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-card/40 p-7 backdrop-blur-sm"
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

      <section className="container-wide py-24">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4">Değerlerimiz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">İnandığımız <span className="gold-text italic">ilkeler</span></h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="gradient-border p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-foreground/60">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4">Yolculuğumuz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            <span className="gold-text italic">{new Date().getFullYear() - 2018}+ yıllık</span> süreç
          </h2>
        </div>
        <div className="relative space-y-8 border-l border-white/[0.08] pl-8">
          {TIMELINE.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 ring-4 ring-background">
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div className="font-display text-2xl font-semibold gold-text">{t.year}</div>
              <div className="mt-1 font-display text-xl font-semibold">{t.title}</div>
              <div className="mt-2 max-w-2xl text-foreground/70">{t.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="mb-12 text-center">
          <Badge variant="gold" className="mb-4">Ekibimiz</Badge>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">Sizinle ilgilenen <span className="gold-text italic">profesyoneller</span></h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-2xl font-semibold gold-text">
                {m.name.charAt(0)}
              </div>
              <div className="mt-4 font-display text-xl font-semibold">{m.name}</div>
              <div className="text-sm text-accent">{m.role}</div>
              <div className="mt-2 text-sm text-foreground/60">{m.bio}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
