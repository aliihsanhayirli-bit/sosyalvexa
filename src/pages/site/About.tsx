import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Award, Target, Eye, Heart, Users, Building2, Calendar, MapPin } from 'lucide-react';
import { STATS, COMPANY } from '@/lib/constants';

const VALUES = [
  { icon: Award, title: 'Mükemmellik', desc: 'Her detayda kalite, her süreçte titizlik.' },
  { icon: Target, title: 'Sonuç Odaklılık', desc: 'Müşterimizin hedefine en kısa yoldan ulaşması.' },
  { icon: Eye, title: 'Şeffaflık', desc: 'Gizli ücret yok, her adım yazılı ve izlenebilir.' },
  { icon: Heart, title: 'Güven', desc: '15+ yıllık ilişki ağı ve yüzlerce referans.' },
];

const TIMELINE = [
  { year: '2010', title: 'Kuruluş', desc: 'GYD Grup, Ankara merkezde küçük bir ofisle gayrimenkul proje ve danışmanlık hizmetlerine başladı.' },
  { year: '2014', title: 'Büyüme', desc: 'Portföy 250 arsayı aştı, Ankara\'nın farklı bölgelerine genişledi.' },
  { year: '2018', title: 'Hukuki Süreç', desc: 'Kendi hukuk danışmanlığı birimini kurarak uçtan uca hizmet vermeye başladı.' },
  { year: '2021', title: 'Yatırım Danışmanlığı', desc: 'Bireysel yatırımcılar için portföy yönetimi ve değer artışı stratejileri.' },
  { year: '2024', title: 'Dijital Dönüşüm', desc: 'Online portföy, canlı danışmanlık ve yapay zekâ destekli hizmetler.' },
];

const TEAM = [
  { name: 'Ali İhsan Hayırlı', role: 'Kurucu & Genel Müdür', bio: 'Emlak sektöründe uzun yıllara dayanan tecrübe; Ankara imarlı arsa yatırımı ve proje danışmanlığı.' },
  { name: 'Selin Kaya', role: 'Hukuk Direktörü', bio: 'Tapu ve imar hukuku uzmanı.' },
  { name: 'Murat Demir', role: 'Yatırım Danışmanı', bio: 'Ankara geneli saha uzmanı.' },
];

export default function About() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Hakkımızda</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Ankara'nın <span className="gold-text italic">güvenilir</span> imarlı arsa markası
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            {COMPANY.name} olarak, 2010 yılından bu yana Ankara genelinde <strong>imarlı arsa</strong> alım-satımı, yatırım danışmanlığı ve hukuki süreç yönetimi alanlarında hizmet veriyoruz. Amacımız sadece arsa bulmak değil; müşterilerimizin hayatlarına değer katacak doğru yatırımları birlikte keşfetmek.
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
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">15+ yıllık <span className="gold-text italic">süreç</span></h2>
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
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
