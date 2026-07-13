import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { pb } from '@/lib/pb';
import { REGIONS } from '@/lib/constants';

const DEMO: Record<string, any> = {
  '1': {
    title: 'Temelli Merkez · 1.250 m² İmarlı Konut Arsası',
    slug: 'temelli-merkez-1250',
    description: 'Temelli merkezde, gelişen konut bölgesinde yer alan 1.250 m² imarlı konut arsası.',
    price: 2400000, currency: 'TRY', area_m2: 1250,
    imar_status: 'Konut (E:0.30, Hmax: 2 Kat)',
    tapu_status: 'Tapu Hazır · İpotek Yok',
    region: 'temelli', city: 'Ankara',
    neighborhood: 'Temelli Merkez', lat: 39.5633, lng: 32.3847,
    status: 'available', published: true, featured: true,
  },
};

export default function AdminListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    title: '', slug: '', description: '',
    price: 0, currency: 'TRY', area_m2: 0,
    imar_status: '', tapu_status: '',
    region: 'temelli', city: 'Ankara', neighborhood: '',
    lat: 0, lng: 0, status: 'available', published: true, featured: false,
  });
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const rec = await pb.collection('listings').getOne(id);
        setForm(rec);
      } catch {
        setForm({ ...DEMO[id] || form, ...form });
      }
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== 'photos' && k !== 'collectionId' && k !== 'collectionName' && k !== 'id' && k !== 'created' && k !== 'updated') {
          data.append(k, String(v));
        }
      });
      photos.forEach((p) => data.append('photos', p));

      if (isNew) await pb.collection('listings').create(data);
      else await pb.collection('listings').update(id!, data);
      toast.success('Kaydedildi');
      navigate('/admin/arsalar');
    } catch (err) {
      toast.error('Hata: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Geri
      </button>
      <h1 className="font-display text-3xl font-semibold">{isNew ? 'Yeni Arsa' : 'Arsayı Düzenle'}</h1>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Başlık *</label>
                <Input required value={form.title} onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">URL Slug *</label>
                <Input required value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} placeholder="temelli-merkez-1250" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Açıklama *</label>
                <Textarea required rows={6} value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fiyat & Alan</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Fiyat *</label>
                <Input type="number" required value={form.price} onChange={(e) => setForm((f: any) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Para Birimi</label>
                <Select value={form.currency} onChange={(e) => setForm((f: any) => ({ ...f, currency: e.target.value }))}>
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Alan (m²) *</label>
                <Input type="number" required value={form.area_m2} onChange={(e) => setForm((f: any) => ({ ...f, area_m2: Number(e.target.value) }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>İmar & Tapu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">İmar Durumu</label>
                <Input value={form.imar_status} onChange={(e) => setForm((f: any) => ({ ...f, imar_status: e.target.value }))} placeholder="Konut (E:0.30, Hmax: 2 Kat)" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tapu Durumu</label>
                <Input value={form.tapu_status} onChange={(e) => setForm((f: any) => ({ ...f, tapu_status: e.target.value }))} placeholder="Tapu Hazır · İpotek Yok" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotoğraflar</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] p-8 transition-colors hover:border-accent/40 hover:bg-accent/5">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="mt-2 text-sm text-foreground/80">Fotoğrafları sürükle veya seç</div>
                <div className="mt-1 text-xs text-muted-foreground">JPG/PNG/WEBP · Max 8MB · En fazla 20 adet</div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPhotos((p) => [...p, ...files].slice(0, 20));
                  }}
                />
              </label>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {photos.map((f, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.04]">
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((p) => p.filter((_, x) => x !== i))}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Konum</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Bölge *</label>
                <Select value={form.region} onChange={(e) => setForm((f: any) => ({ ...f, region: e.target.value }))}>
                  {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Şehir</label>
                <Input value={form.city} onChange={(e) => setForm((f: any) => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mahalle</label>
                <Input value={form.neighborhood} onChange={(e) => setForm((f: any) => ({ ...f, neighborhood: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Enlem</label>
                  <Input type="number" step="0.000001" value={form.lat} onChange={(e) => setForm((f: any) => ({ ...f, lat: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Boylam</label>
                  <Input type="number" step="0.000001" value={form.lng} onChange={(e) => setForm((f: any) => ({ ...f, lng: Number(e.target.value) }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Yayın</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Durum</label>
                <Select value={form.status} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}>
                  <option value="available">Mevcut</option>
                  <option value="reserved">Rezerve</option>
                  <option value="sold">Satıldı</option>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((f: any) => ({ ...f, published: e.target.checked }))} className="rounded" />
                Yayında
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f: any) => ({ ...f, featured: e.target.checked }))} className="rounded" />
                Öne çıkan
              </label>
            </CardContent>
          </Card>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            <Save className="h-4 w-4" /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
