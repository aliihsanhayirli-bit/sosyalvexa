import { useState } from 'react';
import { Plus, Mail, MoreVertical, Shield, ShieldCheck, UserCog } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TeamMember {
  id: string; name: string; email: string; role: 'admin' | 'agent'; status: 'active' | 'invited'; lastActive: string; listings: number;
}

const TEAM: TeamMember[] = [
  { id: 'u1', name: 'Yusuf Çağrı Aksoy', email: 'yusuf@ycayatirim.com.tr', role: 'admin', status: 'active', lastActive: new Date().toISOString(), listings: 28 },
  { id: 'u2', name: 'Selin Kaya', email: 'selin@ycayatirim.com.tr', role: 'admin', status: 'active', lastActive: new Date(Date.now() - 3600_000).toISOString(), listings: 12 },
  { id: 'u3', name: 'Murat Demir', email: 'murat@ycayatirim.com.tr', role: 'agent', status: 'active', lastActive: new Date(Date.now() - 7200_000).toISOString(), listings: 8 },
  { id: 'u4', name: 'Ayşe Kılıç', email: 'ayse@ycayatirim.com.tr', role: 'agent', status: 'invited', lastActive: '', listings: 0 },
];

export default function AdminUsers() {
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'agent' });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Takım Yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">{TEAM.length} üye · Rol bazlı erişim</p>
        </div>
        <Button variant="gold" onClick={() => setShowInvite((v) => !v)}>
          <Plus className="h-4 w-4" /> Davet Et
        </Button>
      </div>

      {showInvite && (
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-display text-lg font-semibold">Yeni Üye Davet Et</h3>
            <p className="mt-1 text-sm text-muted-foreground">Davet linki e-posta ile gönderilir.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input type="email" placeholder="E-posta" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="agent">Danışman</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowInvite(false)}>İptal</Button>
              <Button variant="gold">Davet Gönder</Button>
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
                <th className="p-4">Arsa</th>
                <th className="p-4">Son Aktif</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((m) => (
                <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-sm font-semibold">
                        {m.name.split(' ').map((n) => n.charAt(0)).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {m.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {m.role === 'admin' ? (
                      <Badge variant="gold"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
                    ) : (
                      <Badge variant="glass"><UserCog className="h-3 w-3" /> Danışman</Badge>
                    )}
                  </td>
                  <td className="p-4 text-foreground/80">{m.listings}</td>
                  <td className="p-4 text-foreground/70 text-xs">
                    {m.lastActive ? format(new Date(m.lastActive), 'd MMM, HH:mm', { locale: tr }) : '—'}
                  </td>
                  <td className="p-4">
                    {m.status === 'active' ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Davetli</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
