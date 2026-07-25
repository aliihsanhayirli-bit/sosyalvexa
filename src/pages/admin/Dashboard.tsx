import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Inbox, MessageSquare, TrendingUp, Eye, Bot, ArrowUpRight, Building2, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { pb } from '@/lib/pb';
import { formatPrice } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, BarChart, Bar, CartesianGrid } from 'recharts';
import { CHANNELS, CONTACT_STATUSES } from '@/types';

interface Kpi {
  label: string; value: string | number; delta?: string; icon: typeof Users; color: string;
}

const TRAFFIC = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1} Haz`,
  ziyaret: 120 + Math.floor(Math.sin(i / 2) * 40) + Math.floor(Math.random() * 60),
  mesaj: 8 + Math.floor(Math.sin(i / 3) * 6) + Math.floor(Math.random() * 10),
}));

const CHANNEL_DATA = [
  { name: 'Web', value: 35, fill: '#00d4aa' },
  { name: 'WhatsApp', value: 28, fill: '#22c55e' },
  { name: 'Facebook', value: 22, fill: '#3b82f6' },
  { name: 'Instagram', value: 15, fill: '#ec4899' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    submissions: 0, contacts: 0, conversations: 0, revenue: 0,
    newContacts: 0, unread: 0, conversion: 24,
  });

  useEffect(() => {
    (async () => {
      try {
        const [sub, c, conv] = await Promise.all([
          pb.collection('contact_submissions').getList(1, 1, {}),
          pb.collection('contacts').getList(1, 1, {}),
          pb.collection('conversations').getList(1, 1, {}),
        ]);
        setStats((s) => ({
          ...s,
          submissions: sub.totalItems,
          contacts: c.totalItems,
          conversations: conv.totalItems,
        }));
      } catch {
        // PocketBase bağlı değilse demo veriler
        setStats((s) => ({ ...s, submissions: 12, contacts: 127, conversations: 89 }));
      }
    })();
  }, []);

  const kpis: Kpi[] = [
    { label: 'Form Başvurusu', value: stats.submissions, delta: '+12%', icon: Inbox, color: 'text-emerald-400' },
    { label: 'Toplam Lead', value: stats.contacts, delta: '+24%', icon: Users, color: 'text-cyan-400' },
    { label: 'Açık Konuşma', value: stats.conversations, delta: '+8%', icon: MessageSquare, color: 'text-violet-400' },
    { label: 'Dönüşüm Oranı', value: `%${stats.conversion}`, delta: '+3%', icon: TrendingUp, color: 'text-gold-300' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vexabiz Digital · Genel performans özeti</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                    <div className="mt-2 font-display text-3xl font-semibold">{k.value}</div>
                    {k.delta && (
                      <div className="mt-1 inline-flex items-center gap-0.5 text-xs text-emerald-400">
                        <ArrowUpRight className="h-3 w-3" /> {k.delta} bu ay
                      </div>
                    )}
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] ${k.color}`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ziyaret & Mesaj Trendi</CardTitle>
              <Badge variant="glass">Son 14 gün</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E0C460" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#E0C460" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(215 50% 9%)', border: '1px solid hsl(215 30% 18%)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="ziyaret" stroke="#00d4aa" fill="url(#grad1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="mesaj" stroke="#E0C460" fill="url(#grad2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kanal Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CHANNEL_DATA.map((c) => (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-semibold">{c.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.fill }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                <Bot className="h-3.5 w-3.5 text-accent" /> Bot Performansı
              </div>
              <div className="text-muted-foreground">Bugün <span className="text-accent font-semibold">42</span> mesaj yanıtlandı, <span className="text-gold-300 font-semibold">6</span> lead oluşturuldu.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son Lead'ler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Ahmet Yılmaz', service: 'Meta BM Kurulumu', channel: 'whatsapp', status: 'new' },
                { name: 'Fatma Demir', service: 'Kurumsal Web Sitesi', channel: 'web', status: 'qualified' },
                { name: 'Mehmet Kaya', service: 'CRM Kurulumu', channel: 'instagram', status: 'contacted' },
                { name: 'Ayşe Şahin', service: 'AI Çalışan', channel: 'facebook', status: 'visit_scheduled' },
                { name: 'Ali Çelik', service: 'Tam Dijital Dönüşüm', channel: 'whatsapp', status: 'new' },
              ].map((c, i) => {
                const ch = CHANNELS.find((x) => x.id === c.channel);
                const st = CONTACT_STATUSES.find((x) => x.id === c.status);
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-sm font-semibold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.service}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{ch?.label}</span>
                      <span className={`h-2 w-2 rounded-full ${st?.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONTACT_STATUSES.map((s) => ({ name: s.label.split(' ')[0], value: 5 + Math.floor(Math.random() * 20) }))}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(215 50% 9%)', border: '1px solid hsl(215 30% 18%)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#00d4aa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
