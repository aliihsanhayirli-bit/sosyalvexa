import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Form';
import { COMPANY } from '@/lib/constants';

export default function AdminSettings() {
  const [form, setForm] = useState<{
    name: string; brand: string; tagline: string; phone: string; email: string;
    address: string; facebook: string; instagram: string; description: string; hours: string;
  }>({
    name: COMPANY.name,
    brand: COMPANY.brand,
    tagline: COMPANY.tagline,
    phone: COMPANY.phone,
    email: COMPANY.email,
    address: COMPANY.address,
    facebook: COMPANY.social.facebook,
    instagram: COMPANY.social.instagram,
    description: COMPANY.description,
    hours: COMPANY.hours,
  });

  const save = () => {
    toast.success('Ayarlar kaydedildi (yerel önizleme)');
  };

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
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Marka Adı</label>
              <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Slogan</label>
              <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Açıklama</label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
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
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-posta</label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Adres</label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Çalışma Saatleri</label>
              <Input value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
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
              <Input value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Instagram</label>
              <Input value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
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
        <Button variant="gold" size="lg" onClick={save}>
          <Save className="h-4 w-4" /> Tüm Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
