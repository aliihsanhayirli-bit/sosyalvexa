import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PACKAGES, COMPANY } from '@/lib/constants';
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
            Dijital dönüşüm ihtiyacınıza göre 3 farklı paket. Hemen başlayın, doğru çözümle büyüyün — 1 kerede tam.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
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
                  ? 'border-accent/60 shadow-2xl shadow-accent/20 lg:-mt-4 lg:scale-105'
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
                {p.setup && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Kurulum</span>
                    <span className="font-display text-lg font-semibold text-foreground">{p.setup}</span>
                  </div>
                )}
                {p.monthly && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Aylık</span>
                    <span className="font-display text-lg font-semibold text-foreground">{p.monthly}</span>
                  </div>
                )}
              </div>

              <ul className="mb-7 flex-1 space-y-2.5">
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

              <Button
                variant={p.highlight ? 'gold' : 'outline'}
                onClick={() => (window.location.href = '/iletisim')}
                className="w-full"
              >
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div {...FADE} className="rounded-2xl border border-white/[0.06] bg-card/30 p-6">
            <Badge variant="outline" className="mb-3">Sektör Ortalaması</Badge>
            <h3 className="font-display text-xl font-semibold">Karşılaştırmalı Fiyatlandırma (TL, KDV hariç)</h3>
            <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Hizmet</th>
                    <th className="px-4 py-2.5">Düşük</th>
                    <th className="px-4 py-2.5">Orta</th>
                    <th className="px-4 py-2.5">Yüksek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {[
                    ['Meta BM kurulumu (tek seferlik)', '3.000', '15.000', '30.000'],
                    ['Kurumsal web sitesi (tek seferlik)', '15.000', '40.000', '75.000'],
                    ['E-ticaret (hazır altyapı)', '45.000', '65.000', '120.000'],
                    ['Sosyal medya yönetimi (aylık)', '5.000', '15.000', '40.000'],
                  ].map(([hizmet, dusuk, orta, yuksek]) => (
                    <tr key={hizmet} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-foreground/85">{hizmet}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{dusuk}</td>
                      <td className="px-4 py-2.5 text-accent">{orta}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{yuksek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              * Kaynak: Kurgu Ajans, Vayes, Sercan Sevincer, Ajansör, Kreatifmerkezi (2025-2026 ortalaması).
            </p>
          </motion.div>

          <motion.div {...FADE} className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6">
            <Badge variant="gold" className="mb-3">Sık Sorulan</Badge>
            <h3 className="font-display text-xl font-semibold">Net Yanıtlar</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <div className="font-semibold text-foreground">Fiyatlar KDV dahil mi?</div>
                <p className="mt-1 text-foreground/70">Yukarıdaki tüm tutarlar KDV hariçtir. %20 KDV eklenecektir.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Sözleşme süresi?</div>
                <p className="mt-1 text-foreground/70">Kurulum ücretleri tek seferliktir. Aylık yönetim için minimum 3 aylık sözleşme.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Ödeme nasıl?</div>
                <p className="mt-1 text-foreground/70">%50 başlangıç, %50 teslim. Banka havalesi veya kredi kartı. Kurumsal fatura.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Reklam bütçesi dahil mi?</div>
                <p className="mt-1 text-foreground/70">Yönetim ücreti hariçtir. Meta/Google'a ödenen reklam bütçesi doğrudan platformadır.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Özel teklif?</div>
                <p className="mt-1 text-foreground/70">Tabii. 30 dakikalık ücretsiz keşif görüşmesinde size özel teklif hazırlıyoruz.</p>
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
    </div>
  );
}
