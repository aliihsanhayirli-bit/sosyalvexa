import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Form';
import { COMPANY } from '@/lib/constants';
import { pb } from '@/lib/pb';

interface SettingsRecord {
  id: string;
  company_name?: string;
  brand?: string;
  tagline?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

const EMPTY: Omit<SettingsRecord, 'id'> = {
  company_name: COMPANY.name,
  brand: COMPANY.brand,
  tagline: COMPANY.tagline,
  phone: COMPANY.phone,
  email: COMPANY.email,
  address: COMPANY.address,
  description: COMPANY.description,
  hours: COMPANY.hours,
  facebook: COMPANY.social.facebook,
  instagram: COMPANY.social.instagram,
  whatsapp: '',
};

export default function AdminSettings() {
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SettingsRecord, 'id'>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await pb.collection('settings').getList<SettingsRecord>(1, 1);
        if (list.items.length > 0) {
          const r = list.items[0];
          setId(r.id);
          setForm({
            company_name: r.company_name ?? COMPANY.name,
            brand: r.brand ?? COMPANY.brand,
            tagline: r.tagline ?? COMPANY.tagline,
            description: r.description ?? COMPANY.description,
            phone: r.phone ?? COMPANY.phone,
            email: r.email ?? COMPANY.email,
            address: r.address ?? COMPANY.address,
            hours: r.hours ?? COMPANY.hours,
            facebook: r.facebook ?? COMPANY.social.facebook,
            instagram: r.instagram ?? COMPANY.social.instagram,
            whatsapp: r.whatsapp ?? '',
          });
        } else {
          const created = await pb.collection('settings').create<SettingsRecord>({ ...EMPTY, singleton: true } as never);
          setId(created.id);
        }
      } catch (e) {
        toast.error('Ayarlar yüklenemedi: ' + (e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await pb.collection('settings').update<SettingsRecord>(id, { ...form, singleton: true } as never);
      toast.success('Ayarlar kaydedildi');
    } catch (e) {
      toast.error('Kayıt hatası: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Sistem Ayarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">Firma bilgileri, iletişim, sosyal medya</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-accent" /> Firma Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ticari Ünvan</label>
              <Input value={form.company_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Marka Adı</label>
              <Input value={form.brand ?? ''} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Slogan</label>
              <Input value={form.tagline ?? ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Açıklama</label>
              <Textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-accent" /> İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Telefon</label>
              <Input value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-posta</label>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Adres</label>
              <Input value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Çalışma Saatleri</label>
              <Input value={form.hours ?? ''} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">WhatsApp Numarası</label>
              <Input value={form.whatsapp ?? ''} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="905324892567" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Facebook className="h-5 w-5 text-accent" /> Sosyal Medya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Facebook</label>
              <Input value={form.facebook ?? ''} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Instagram</label>
              <Input value={form.instagram ?? ''} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-accent" /> Entegrasyon Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { name: 'PocketBase', status: 'Bağlı', color: 'bg-emerald-500', desc: 'Veritabanı · Auth · Storage' },
              { name: 'Google Gemini', status: import.meta.env.VITE_GEMINI_API_KEY ? 'API Key OK' : 'API Key Eksik', color: import.meta.env.VITE_GEMINI_API_KEY ? 'bg-emerald-500' : 'bg-rose-500' },
              { name: 'Meta WhatsApp', status: 'Webhook hazır', color: 'bg-amber-500' },
              { name: 'Meta Messenger', status: 'Webhook hazır', color: 'bg-amber-500' },
              { name: 'Instagram Graph API', status: 'Webhook hazır', color: 'bg-amber-500' },
              { name: 'MapLibre GL', status: 'Hazır', color: 'bg-emerald-500' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${c.color}`} />
                  {c.name}
                </div>
                <span className="text-xs text-muted-foreground">{c.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="gold" size="lg" onClick={save} disabled={saving || !id}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Tüm Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
