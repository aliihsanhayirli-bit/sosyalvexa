import { motion } from 'framer-motion';
import { Check, X, Sparkles, ShieldCheck, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PACKAGES, MAINTENANCE_PLANS, ADDON_MODULES, COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const FADE = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function Packages() {
  return (
    <div>
      <section className="container-wide py-24">
        <motion.div {...FADE} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">Fiyat Paketleri</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Şeffaf <span className="gold-text italic">fiyat</span>, net kapsam
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Kliniğinizi veya işletmenizi dijitalde yönetmek için ihtiyacınız olan tüm sistem tek pakette: web sitesi, CRM, yapay zeka, Meta doğrulamaları, reklam altyapısı ve sunucu kurulumu.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {PACKAGES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card/40 p-7 backdrop-blur-sm transition-all',
                p.highlight
                  ? 'border-accent/60 shadow-2xl shadow-accent/20 lg:-mt-4 lg:scale-[1.02]'
                  : 'border-white/[0.06] hover:border-accent/40',
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-accent-foreground shadow-lg shadow-accent/30">
                    <Sparkles className="h-3 w-3" /> En Popüler
                  </div>
                </div>
              )}

              <div className="mb-1 font-display text-2xl font-semibold">{p.name}</div>
              <div className="mb-6 text-sm text-foreground/60">{p.tagline}</div>

              <div className="mb-6 space-y-2 border-b border-white/[0.06] pb-6">
                {p.listValue && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Liste Değeri</span>
                    <span className="text-sm text-muted-foreground line-through">{p.listValue}</span>
                  </div>
                )}
                {p.setup && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Paket Fiyatı</span>
                    <span className="font-display text-xl font-semibold gold-text">{p.setup}</span>
                  </div>
                )}
                {p.note && (
                  <div className="pt-1 text-xs text-foreground/60">{p.note}</div>
                )}
              </div>

              <ul className="mb-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={f.included ? 'text-foreground/85' : 'text-muted-foreground/50 line-through'}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {p.items && (
                <details className="group mb-7 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-foreground/80 [&::-webkit-details-marker]:hidden">
                    <span>Paket içeriği · {p.items.length} kalem</span>
                    <Plus className="h-4 w-4 text-accent transition-transform group-open:rotate-45" />
                  </summary>
                  <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06]">
                    {p.items.map((it) => (
                      <li key={it.label} className="flex items-baseline justify-between gap-3 px-4 py-2 text-xs">
                        <span className="text-foreground/75">{it.label}</span>
                        <span className="shrink-0 text-muted-foreground">{it.price}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <Button
                variant={p.highlight ? 'gold' : 'outline'}
                onClick={() => (window.location.href = '/iletisim')}
                className="mt-auto w-full"
              >
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide pb-24">
        <motion.div {...FADE} className="mb-10 text-center">
          <Badge variant="outline" className="mb-4">Bakım Paketleri</Badge>
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Kurulumdan sonra da <span className="gold-text italic">yanınızdayız</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/60">
            Sunucunuzu biz yönetiyorsak bakım paketi zorunludur. Sisteminiz güncel, yedekli ve hızlı kalır.
          </p>
        </motion.div>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {MAINTENANCE_PLANS.map((m) => (
            <motion.div
              key={m.id}
              {...FADE}
              className={cn(
                'rounded-2xl border p-7 backdrop-blur-sm',
                m.highlight ? 'border-accent/50 bg-accent/[0.06]' : 'border-white/[0.06] bg-card/40',
              )}
            >
              <div className="flex items-baseline justify-between">
                <div className="font-display text-xl font-semibold">{m.name}</div>
                <div className="font-display text-lg font-semibold gold-text">{m.price}</div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {m.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide pb-24">
        <motion.div {...FADE} className="rounded-2xl border border-white/[0.06] bg-card/30 p-6 sm:p-8">
          <Badge variant="outline" className="mb-3">İsteğe Bağlı Modüller</Badge>
          <h2 className="font-display text-2xl font-semibold">Paketinizi büyütün</h2>
          <p className="mt-2 text-sm text-foreground/60">
            İhtiyaç duydukça modül ekleyin — her modül mevcut sisteminize entegre kurulur.
          </p>
          <div className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {ADDON_MODULES.map((a) => (
              <div key={a.label} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-2 text-sm">
                <span className="text-foreground/80">{a.label}</span>
                <span className="shrink-0 text-accent">{a.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div {...FADE} className="rounded-2xl border border-white/[0.06] bg-card/30 p-6">
            <Badge variant="outline" className="mb-3">Sektör Ortalaması</Badge>
            <h3 className="font-display text-xl font-semibold">Türkiye Piyasası Fiyat Aralıkları (TL, KDV hariç)</h3>
            <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Hizmet</th>
                    <th className="px-4 py-2.5">Düşük</th>
                    <th className="px-4 py-2.5">Yüksek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {[
                    ['Kurumsal web sitesi', '15.000', '40.000'],
                    ['Klinik web sitesi', '15.000', '30.000'],
                    ['Meta reklam hesabı kurulumu', '5.000', '15.000'],
                    ['Business Manager doğrulama', '5.000', '20.000'],
                    ['CRM kurulumu', '20.000', '100.000'],
                    ['AI chatbot', '10.000', '60.000'],
                    ['VPS kurulumu', '5.000', '15.000'],
                  ].map(([hizmet, dusuk, yuksek]) => (
                    <tr key={hizmet} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-foreground/85">{hizmet}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{dusuk}</td>
                      <td className="px-4 py-2.5 text-accent">{yuksek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              * Temmuz 2026 Türkiye piyasası ajans fiyat araştırması ortalaması. Paketlerimiz bu hizmetlerin 6-7'sini tek çatıda toplar.
            </p>
          </motion.div>

          <motion.div {...FADE} className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6">
            <Badge variant="gold" className="mb-3">Çalışma Şartları</Badge>
            <h3 className="font-display text-xl font-semibold">Net Yanıtlar</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <div className="font-semibold text-foreground">Ödeme nasıl?</div>
                <p className="mt-1 text-foreground/70">%50 peşinat sözleşmeyle, kalan %50 teslimde. Ödemeler şirket hesabına havale/EFT ile alınır, kurumsal fatura kesilir. Fiyatlara %20 KDV eklenir.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Teslim süresi?</div>
                <p className="mt-1 text-foreground/70">Dijital Başlangıç 7-10 iş günü, Dijital Klinik Pro 15-25 iş günü. Süre, içerik ve erişim bilgileri eksiksiz teslim edildiğinde başlar.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Revizyon hakkı?</div>
                <p className="mt-1 text-foreground/70">Tasarımda 2 revizyon dahildir. Sonraki revizyonlar ayrıca ücretlendirilir.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Yazılım kimin oluyor?</div>
                <p className="mt-1 text-foreground/70">Sistem size özel VPS'te çalışır, verileriniz sizde kalır. Yazılım lisansı bize aittir; siz kullanım hakkını satın alırsınız.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Randevu nasıl işliyor?</div>
                <p className="mt-1 text-foreground/70">Sitedeki yapay zeka asistanımıza veya WhatsApp hattımıza yazın — uygun gün ve saati birlikte netleştirip keşif görüşmenizi planlayalım.</p>
              </div>
            </div>
            <Button variant="gold" className="mt-6 w-full" onClick={() => (window.location.href = '/iletisim')}>
              Özel Teklif Al
            </Button>
            <a
              href={COMPANY.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-center text-sm text-emerald-300 hover:text-emerald-200"
            >
              veya WhatsApp'tan yaz →
            </a>
          </motion.div>
        </div>
      </section>

      <section className="container-wide pb-24">
        <motion.div {...FADE} className="gradient-border relative overflow-hidden p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,43,0.15),transparent_60%)]" />
          <div className="relative mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-4 font-display text-2xl font-medium sm:text-3xl">Sözleşmeli, faturalı, garantili teslim</h2>
            <p className="mx-auto mt-3 text-foreground/70">
              Her proje yazılı hizmet sözleşmesiyle başlar: kapsam, takvim, ödeme planı ve teslim garantileri net şekilde tanımlıdır.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
