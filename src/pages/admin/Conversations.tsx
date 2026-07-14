import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bot, UserCheck, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CHANNELS, type Channel } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { pb } from '@/lib/pb';
import { toast } from 'sonner';

interface ConvRecord {
  id: string;
  collectionId: string;
  contact: string;
  channel: Channel;
  started_at: string;
  last_message_at: string;
  bot_active: boolean;
  unread_count: number;
  expand?: {
    contact?: { id: string; name: string };
  };
}

interface MsgRecord {
  id: string;
  conversation: string;
  sender: 'bot' | 'customer' | 'agent' | 'system';
  content: string;
  type: 'text' | 'photo' | 'listing' | 'location' | 'document';
  created: string;
}

export default function AdminConversations() {
  const [convs, setConvs] = useState<ConvRecord[]>([]);
  const [messages, setMessages] = useState<MsgRecord[]>([]);
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    try {
      const list = await pb.collection('conversations').getList<ConvRecord>(1, 100, {
        sort: '-last_message_at',
        expand: 'contact',
      });
      setConvs(list.items);
      if (list.items.length > 0 && !active) setActive(list.items[0].id);
    } catch (e) {
      toast.error('Konuşmalar yüklenemedi: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const list = await pb.collection('messages').getList<MsgRecord>(1, 200, {
        filter: `conversation = "${convId}"`,
        sort: 'created',
      });
      setMessages(list.items);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      toast.error('Mesajlar yüklenemedi: ' + (e as Error).message);
    }
  };

  useEffect(() => {
    loadConvs();
  }, []);

  useEffect(() => {
    if (active) {
      loadMessages(active);
      // realtime
      pb.collection('messages').unsubscribe('*');
      pb.collection('messages').subscribe('*', (e) => {
        if (e.action === 'create' && e.record.conversation === active) {
          setMessages((m) => [...m, e.record as unknown as MsgRecord]);
        }
      });
    }
    return () => {
      pb.collection('messages').unsubscribe('*');
    };
  }, [active]);

  const filtered = convs.filter((c) => {
    const name = c.expand?.contact?.name || '';
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (channel !== 'all' && c.channel !== channel) return false;
    return true;
  });

  const activeConv = convs.find((c) => c.id === active);
  const ch = activeConv ? CHANNELS.find((c) => c.id === activeConv.channel) : null;
  const activeName = activeConv?.expand?.contact?.name || '—';

  const send = async () => {
    if (!active || !draft.trim()) return;
    setSending(true);
    try {
      await pb.collection('messages').create({
        conversation: active,
        sender: 'agent',
        content: draft.trim(),
        type: 'text',
      });
      await pb.collection('conversations').update(active, { last_message_at: new Date().toISOString() });
      setDraft('');
      loadConvs();
    } catch (e) {
      toast.error('Gönderilemedi: ' + (e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const toggleBot = async () => {
    if (!activeConv) return;
    try {
      await pb.collection('conversations').update(activeConv.id, { bot_active: !activeConv.bot_active });
      loadConvs();
      toast.success(activeConv.bot_active ? 'Danışman devraldı' : 'Bot aktif edildi');
    } catch (e) {
      toast.error('Hata: ' + (e as Error).message);
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
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">Konuşma bulunamadı</div>
            )}
            {filtered.map((c) => {
              const cCh = CHANNELS.find((x) => x.id === c.channel);
              const name = c.expand?.contact?.name || '—';
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
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold">{name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false, locale: tr })}
                      </div>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${cCh?.color}`} />
                      <span className="truncate">{cCh?.label}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {c.bot_active ? <Badge variant="glass" className="text-[9px]"><Bot className="h-2.5 w-2.5" /> Bot</Badge> : <Badge variant="gold" className="text-[9px]"><UserCheck className="h-2.5 w-2.5" /> Danışman</Badge>}
                      {c.unread_count > 0 && <Badge className="text-[9px]">{c.unread_count}</Badge>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {activeConv ? (
            <>
              <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 font-semibold">
                    {activeName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{activeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {ch?.label} · Son mesaj {format(new Date(activeConv.last_message_at), 'HH:mm', { locale: tr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeConv.bot_active ? 'outline' : 'gold'}
                    size="sm"
                    onClick={toggleBot}
                  >
                    {activeConv.bot_active ? <><UserCheck className="h-3.5 w-3.5" /> Botu Devral</> : <><Bot className="h-3.5 w-3.5" /> Botu Aktif Et</>}
                  </Button>
                  <Link to={`/admin/kisiler/${activeConv.contact}`} className="text-xs text-accent hover:underline">
                    Kişi Kartı →
                  </Link>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-6">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Henüz mesaj yok
                  </div>
                )}
                {messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const sameDay = prev && new Date(prev.created).toDateString() === new Date(m.created).toDateString();
                  return (
                    <div key={m.id}>
                      {!sameDay && (
                        <div className="my-2 text-center text-xs text-muted-foreground">
                          {format(new Date(m.created), 'd MMMM yyyy', { locale: tr })}
                        </div>
                      )}
                      <div className={cn('flex', m.sender === 'agent' || m.sender === 'bot' ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                            m.sender === 'agent'
                              ? 'rounded-br-sm bg-accent/20 text-foreground'
                              : m.sender === 'bot'
                              ? 'rounded-br-sm bg-gold-500/15 text-foreground'
                              : m.sender === 'system'
                              ? 'bg-white/[0.03] text-muted-foreground italic'
                              : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.05]',
                          )}
                        >
                          {m.sender !== 'customer' && (
                            <div className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                              {m.sender === 'agent' ? 'Danışman' : m.sender === 'bot' ? 'Bot' : 'Sistem'}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{m.content}</div>
                          <div className="mt-1 text-right text-[10px] text-muted-foreground/60">
                            {format(new Date(m.created), 'HH:mm', { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/[0.06] p-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Yanıt yaz..."
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    className="min-h-[40px]"
                  />
                  <Button variant="gold" onClick={send} disabled={sending || !draft.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gönder'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Soldan bir konuşma seçin
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
