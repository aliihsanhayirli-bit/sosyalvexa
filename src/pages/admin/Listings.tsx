import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Filter, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { pb } from '@/lib/pb';
import { formatPrice, formatArea } from '@/lib/utils';
import type { Listing } from '@/types';
import { REGIONS } from '@/lib/constants';
import { toast } from 'sonner';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'gold' | 'secondary' | 'destructive' }> = {
  available: { label: 'Mevcut', variant: 'default' },
  reserved: { label: 'Rezerve', variant: 'gold' },
  sold: { label: 'Satıldı', variant: 'secondary' },
};

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await pb.collection('listings').getFullList<Listing>({ sort: '-created' });
        setListings(items);
      } catch (e) {
        toast.error('İlanlar yüklenemedi: ' + (e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = listings.filter((l) => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (region !== 'all' && l.region !== region) return false;
    if (status !== 'all' && l.status !== status) return false;
    return true;
  });

  const remove = async (id: string) => {
    if (!confirm('Bu arsayı silmek istediğinize emin misiniz?')) return;
    try {
      await pb.collection('listings').delete(id);
      setListings((arr) => arr.filter((l) => l.id !== id));
      toast.success('Arsa silindi');
    } catch (e) {
      toast.error('Silme hatası: ' + (e as Error).message);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Arsalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} ilan listeleniyor</p>
        </div>
        <Link to="/admin/arsalar/yeni">
          <Button variant="gold"><Plus className="h-4 w-4" /> Yeni Arsa</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Arsa ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={region} onChange={(e) => setRegion(e.target.value)} className="lg:w-48">
              <option value="all">Tüm Bölgeler</option>
              {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="lg:w-48">
              <option value="all">Tüm Durumlar</option>
              <option value="available">Mevcut</option>
              <option value="reserved">Rezerve</option>
              <option value="sold">Satıldı</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Arsa</th>
                  <th className="p-4">Bölge</th>
                  <th className="p-4">Alan</th>
                  <th className="p-4">Fiyat</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Yayın</th>
                  <th className="p-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const reg = REGIONS.find((r) => r.slug === l.region);
                  const sb = STATUS_BADGE[l.status];
                  return (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 text-accent">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{l.title}</div>
                            <div className="text-xs text-muted-foreground">{l.imar_status} · {l.tapu_status}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground/80">{reg?.name || l.region}</td>
                      <td className="p-4 text-foreground/80">{formatArea(l.area_m2)}</td>
                      <td className="p-4 font-semibold text-foreground">{formatPrice(l.price, l.currency)}</td>
                      <td className="p-4"><Badge variant={sb.variant}>{sb.label}</Badge></td>
                      <td className="p-4">
                        {l.published ? <Badge variant="default">Yayında</Badge> : <Badge variant="outline">Taslak</Badge>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/arsalar/${l.slug}`} target="_blank" className="rounded-md p-1.5 text-muted-foreground hover:bg-white/[0.05] hover:text-foreground" title="Görüntüle">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link to={`/admin/arsalar/${l.id}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-white/[0.05] hover:text-accent" title="Düzenle">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400" title="Sil">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">Sonuç bulunamadı</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
