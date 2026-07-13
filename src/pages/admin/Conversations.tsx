import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bot, UserCheck, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CHANNELS, type Channel } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Conv {
  id: string;
  contactId: string;
  contactName: string;
  channel: Channel;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  botActive: boolean;
}

const CONVS: Conv[] = [
  { id: '1', contactId: 'c1', contactName: 'Ahmet Yılmaz', channel: 'whatsapp', lastMessage: 'Fotoğraflar için teşekkürler, bugün geleceğim', lastMessageAt: new Date(Date.now() - 5 * 60_000).toISOString(), unread: 2, botActive: false },
  { id: '2', contactId: 'c2', contactName: 'Fatma Demir', channel: 'web', lastMessage: 'Tapu devri ne kadar sürer?', lastMessageAt: new Date(Date.now() - 25 * 60_000).toISOString(), unread: 0, botActive: true },
  { id: '3', contactId: 'c3', contactName: 'Mehmet Kaya', channel: 'instagram', lastMessage: 'Sincan OSB arsalarınızı görebilir miyim?', lastMessageAt: new Date(Date.now() - 2 * 3600_000).toISOString(), unread: 1, botActive: true },
  { id: '4', contactId: 'c4', contactName: 'Ayşe Şahin', channel: 'facebook', lastMessage: 'Yer gösterme için Salı uygun', lastMessageAt: new Date(Date.now() - 5 * 3600_000).toISOString(), unread: 0, botActive: false },
  { id: '5', contactId: 'c5', contactName: 'Ali Çelik', channel: 'whatsapp', lastMessage: 'Merhaba, 5 dönüm arazim var satmak istiyorum', lastMessageAt: new Date(Date.now() - 24 * 3600_000).toISOString(), unread: 3, botActive: true },
  { id: '6', contactId: 'c6', contactName: 'Zeynep Aydın', channel: 'web', lastMessage: 'Bütçeme uygun bir şey bulursanız beni arar mısınız?', lastMessageAt: new Date(Date.now() - 48 * 3600_000).toISOString(), unread: 0, botActive: false },
];

export default function AdminConversations() {
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [active, setActive] = useState<string>(CONVS[0].id);

  const filtered = CONVS.filter((c) => {
    if (search && !c.contactName.toLowerCase().includes(search.toLowerCase())) return false;
    if (channel !== 'all' && c.channel !== channel) return false;
    return true;
  });

  const activeConv = CONVS.find((c) => c.id === active)!;
  const ch = CHANNELS.find((c) => c.id === activeConv.channel);

  return (
    <div className="flex h-[calc(100vh-5rem)] p-6 lg:p-8">
      <Card className="flex w-full overflow-hidden">
        <div className="flex w-80 shrink-0 flex-col border-r border-white/[0.06]">
          <div className="border-b border-white/[0.06] p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Konuşma ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              <button
                onClick={() => setChannel('all')}
                className={cn('rounded-full px-3 py-1 text-[10px] uppercase tracking-wider', channel === 'all' ? 'bg-accent/15 text-accent' : 'bg-white/[0.04] text-muted-foreground')}
              >
                Tümü
              </button>
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={cn('rounded-full px-3 py-1 text-[10px] uppercase tracking-wider', channel === c.id ? 'bg-accent/15 text-accent' : 'bg-white/[0.04] text-muted-foreground')}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const cCh = CHANNELS.find((x) => x.id === c.channel);
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-white/[0.04] p-3 text-left transition-colors',
                    active === c.id ? 'bg-accent/5' : 'hover:bg-white/[0.02]',
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-sm font-semibold">
                    {c.contactName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold">{c.contactName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: false, locale: tr })}
                      </div>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${cCh?.color}`} />
                      <span className="truncate">{c.lastMessage}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {c.botActive ? <Badge variant="glass" className="text-[9px]"><Bot className="h-2.5 w-2.5" /> Bot</Badge> : <Badge variant="gold" className="text-[9px]"><UserCheck className="h-2.5 w-2.5" /> Danışman</Badge>}
                      {c.unread > 0 && <Badge className="text-[9px]">{c.unread}</Badge>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 font-semibold">
                {activeConv.contactName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{activeConv.contactName}</div>
                <div className="text-xs text-muted-foreground">{ch?.label} · Son mesaj {format(new Date(activeConv.lastMessageAt), 'HH:mm', { locale: tr })}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeConv.botActive ? (
                <Button variant="outline" size="sm"><UserCheck className="h-3.5 w-3.5" /> Botu Devral</Button>
              ) : (
                <Button variant="gold" size="sm"><Bot className="h-3.5 w-3.5" /> Botu Aktif Et</Button>
              )}
              <Link to={`/admin/kisiler/${activeConv.contactId}`} className="text-xs text-accent hover:underline">Kişi Kartı →</Link>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            <div className="text-center text-xs text-muted-foreground">
              {format(new Date(Date.now() - 30 * 60_000), 'd MMMM yyyy', { locale: tr })}
            </div>
            {[
              { sender: 'customer', content: activeConv.lastMessage, t: activeConv.lastMessageAt },
            ].map((m, i) => (
              <div key={i} className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.05] px-4 py-2.5 text-sm">
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            <div className="text-center text-xs text-muted-foreground/60">Konuşma geçmişi için kişi kartını ziyaret edin</div>
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-center gap-2">
              <Input placeholder="Yanıt yaz..." />
              <Button variant="gold">Gönder</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
