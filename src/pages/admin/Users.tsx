import { useEffect, useState } from 'react';
import { Plus, Mail, MoreVertical, Shield, ShieldCheck, UserCog, Loader2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { pb } from '@/lib/pb';
import { toast } from 'sonner';

interface Member {
  id: string;
  name?: string;
  email: string;
  role?: 'admin' | 'agent' | 'viewer';
  verified: boolean;
  created: string;
  updated: string;
  avatar?: string;
}

export default function AdminUsers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });

  const load = async () => {
    try {
      const list = await pb.collection('users').getList<Member>(1, 100, { sort: '-created' });
      setMembers(list.items);
    } catch (e) {
      toast.error('Üyeler yüklenemedi: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error('E-posta ve şifre gerekli');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Şifre en az 8 karakter');
      return;
    }
    setSaving(true);
    try {
      // PocketBase auth create'inde verified=true reddedilir; önce oluştur, sonra verify et
      const created = await pb.collection('users').create({
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.password,
        name: form.name.trim(),
        role: form.role,
        emailVisibility: true,
      } as never);
      try {
        await pb.collection('users').update(created.id, { verified: true } as never);
      } catch {
        // verified alanı güncellenemezse kullanıcı yine de giriş yapabilir, sadece doğrulanmamış olur
      }
      toast.success('Üye eklendi (giriş yapabilir)');
      setForm({ name: '', email: '', password: '', role: 'agent' });
      setShowInvite(false);
      load();
    } catch (e) {
      toast.error('Ekleme hatası: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (m: Member, role: 'admin' | 'agent' | 'viewer') => {
    try {
      await pb.collection('users').update(m.id, { role } as never);
      toast.success('Rol güncellendi');
      load();
    } catch (e) {
      toast.error('Hata: ' + (e as Error).message);
    }
  };

  const remove = async (m: Member) => {
    if (!confirm(`${m.email} kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await pb.collection('users').delete(m.id);
      toast.success('Üye silindi');
      load();
    } catch (e) {
      toast.error('Silme hatası: ' + (e as Error).message);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Takım Yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">{members.length} üye · Rol bazlı erişim</p>
        </div>
        <Button variant="gold" onClick={() => setShowInvite((v) => !v)}>
          <Plus className="h-4 w-4" /> {showInvite ? 'İptal' : 'Yeni Üye'}
        </Button>
      </div>

      {showInvite && (
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-display text-lg font-semibold">Yeni Üye Ekle</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Kullanıcı oluşturulur, şifreyle birlikte giriş yapabilir. Davet maili PocketBase SMTP ayarıyla gönderilir.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input type="email" placeholder="E-posta" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input type="password" placeholder="Şifre (min 8 karakter)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="agent">Danışman</option>
                <option value="admin">Admin</option>
                <option value="viewer">Görüntüleyici</option>
              </Select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowInvite(false)}>İptal</Button>
              <Button variant="gold" onClick={invite} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ekle'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Üye</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Kayıt Tarihi</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Henüz üye yok</td></tr>
              )}
              {members.map((m) => {
                const initials = (m.name || m.email).split(/[\s@]/).map((s) => s.charAt(0)).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-sm font-semibold">
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium">{m.name || m.email.split('@')[0]}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {m.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Select
                        value={m.role || 'viewer'}
                        onChange={(e) => updateRole(m, e.target.value as 'admin' | 'agent' | 'viewer')}
                        className="h-8 w-32 text-xs"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Danışman</option>
                        <option value="viewer">Görüntüleyici</option>
                      </Select>
                    </td>
                    <td className="p-4 text-foreground/70 text-xs">
                      {format(new Date(m.created), 'd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="p-4">
                      {m.verified ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Doğrulanmamış</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove(m)} title="Sil">
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><Shield className="h-4 w-4 text-accent" /> Roller</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="font-semibold text-gold-300">Admin</div>
                <div className="mt-1 text-xs text-muted-foreground">Tüm arsalar, kullanıcılar, bot ayarları, sistem ayarları. Tam yetki.</div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="font-semibold text-accent">Danışman</div>
                <div className="mt-1 text-xs text-muted-foreground">Sadece atanmış arsalar ve lead'ler. CRM'de kişi kartı düzenleme.</div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="font-semibold text-muted-foreground">Görüntüleyici</div>
                <div className="mt-1 text-xs text-muted-foreground">Sadece okuma. Düzenleme yetkisi yok.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
