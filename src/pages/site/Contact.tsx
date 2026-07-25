import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, Loader2 } from 'lucide-react';
import { COMPANY, SERVICES } from '@/lib/constants';
import { pb } from '@/lib/pb';

const TYPES = [
  { value: 'meta', label: 'Meta Business Manager kurulumu' },
  { value: 'web', label: 'Kurumsal web sitesi' },
  { value: 'crm', label: 'CRM kurulumu' },
  { value: 'ai', label: 'Yapay zeka çalışanı' },
  { value: 'other', label: 'Diğer / bilmiyorum' },
];

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', type: 'meta', subject: '', message: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }
    setLoading(true);
    try {
      await pb.collection('contact_submissions').create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        type: form.type,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        status: 'new',
        source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      toast.success('Mesajınız alındı! En kısa sürede dönüş yapacağız.');
      setForm({ name: '', phone: '', email: '', type: 'meta', subject: '', message: '' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error('Gönderim başarısız: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="container-wide py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <Badge variant="gold" className="mb-4">İletişim</Badge>
          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl text-balance">
            Bir adım <span className="gold-text italic">öndesiniz</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/70">
            Formu doldurun, ortalama 1 saat içinde uzman danışmanımız sizi arasın. Veya doğrudan arayın — bugün müsaitiz.
          </p>
        </motion.div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={submit}
            className="rounded-2xl border border-white/[0.08] bg-card/40 p-8 backdrop-blur-md"
          >
            <h2 className="font-display text-2xl font-semibold">Mesaj Gönderin</h2>
            <p className="mt-1 text-sm text-foreground/60">Tüm alanlar gizli tutulur, 3. şahıslarla paylaşılmaz.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Ad Soyad *</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Telefon *</label>
                <Input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">E-posta</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="ornek@firma.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Hizmet *</label>
                <Select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Konu</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Örn: E-ticaret sitemiz için Meta BM kurulumu"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Mesajınız *</label>
                <Textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Mevcut durum, hedef, bütçe aralığı, deadline vb."
                />
              </div>
            </div>

            <Button variant="gold" size="lg" className="mt-6 w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gönder
            </Button>
            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              Gönderim ile birlikte{' '}
              <Link to="/kvkk" target="_blank" className="text-accent hover:underline">
                KVKK aydınlatma metni
              </Link>
              {' '}kapsamında kişisel verilerinizin işlenmesini kabul etmiş olursunuz.
            </div>
          </motion.form>

          <aside className="space-y-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-card/40 p-5 backdrop-blur-md transition-colors hover:border-accent/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Telefon</div>
                <div className="font-display text-lg font-semibold">{COMPANY.phone}</div>
              </div>
            </a>

            <a
              href={COMPANY.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 transition-colors hover:bg-emerald-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-300/80">WhatsApp</div>
                <div className="font-display text-lg font-semibold">Hızlı Yaz</div>
              </div>
            </a>

            <a
              href={`mailto:${COMPANY.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-card/40 p-5 backdrop-blur-md transition-colors hover:border-accent/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">E-posta</div>
                <div className="font-display text-lg font-semibold">{COMPANY.email}</div>
              </div>
            </a>

            <div className="rounded-2xl border border-white/[0.08] bg-card/40 p-5 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hizmet Bölgesi</div>
                  <div className="font-display text-lg font-semibold">{COMPANY.address} (Uzaktan Çalışma)</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {COMPANY.hours}
              </div>
            </div>

            <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5">
              <div className="text-xs uppercase tracking-wider text-accent">Hizmetlerimiz</div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.id}>
                    <Link to={`/hizmetler/${s.slug}`} className="text-foreground/80 hover:text-accent">
                      → {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
