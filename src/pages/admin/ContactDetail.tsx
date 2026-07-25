import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ArrowLeft, Phone, Mail, MessageCircle, MapPin, Send, Image as ImageIcon, FileText,
  CheckCircle2, MessageSquare, Tag, Edit3, Save, X, User, Briefcase, Calendar, Building2, Sparkles,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { CHANNELS, CONTACT_STATUSES, type Contact, type ContactStatus } from '@/types';
import { formatPrice, formatPhone } from '@/lib/utils';
import { toast } from 'sonner';
import { pb } from '@/lib/pb';

type MsgRecord = {
  id: string;
  conversation: string;
  sender: 'bot' | 'customer' | 'agent' | 'system';
  content: string;
  type: 'text' | 'photo' | 'listing' | 'location' | 'document';
  created: string;
  attachments?: string[];
};

type ConvRecord = {
  id: string;
  contact: string;
  channel: string;
  last_message_at: string;
  bot_active: boolean;
};

type TimelineRecord = {
  id: string;
  contact: string;
  type: 'created' | 'message' | 'status_change' | 'note' | 'photo_sent' | 'listing_shared';
  title: string;
  description?: string;
  ref_id?: string;
  meta?: { from?: string | null; to?: string | null };
  created: string;
};

const TYPE_LABELS: Record<string, string> = { buyer: 'Alıcı', seller: 'Satıcı' };
const TYPE_COLORS: Record<string, string> = { buyer: 'bg-cyan-500', seller: 'bg-amber-500' };

function TimelineIcon({ type }: { type: TimelineRecord['type'] }) {
  const map: Record<TimelineRecord['type'], { icon: typeof MessageSquare; color: string }> = {
    created: { icon: User, color: 'bg-slate-500' },
    message: { icon: MessageSquare, color: 'bg-cyan-500' },
    status_change: { icon: CheckCircle2, color: 'bg-amber-500' },
    note: { icon: Edit3, color: 'bg-violet-500' },
    photo_sent: { icon: ImageIcon, color: 'bg-emerald-500' },
    listing_shared: { icon: Building2, color: 'bg-gold-500' },
  };
  const { icon: Icon, color } = map[type] || map.created;
  return <div className={`flex h-8 w-8 items-center justify-center rounded-full ${color} text-white`}><Icon className="h-4 w-4" /></div>;
}

export default function AdminContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [conversation, setConversation] = useState<ConvRecord | null>(null);
  const [messages, setMessages] = useState<MsgRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [reply, setReply] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, convs, tl] = await Promise.all([
        pb.collection('contacts').getOne<Contact>(id),
        pb.collection('conversations').getList<ConvRecord>(1, 1, { filter: `contact = "${id}"` }),
        pb.collection('timeline_events').getList<TimelineRecord>(1, 100, { filter: `contact = "${id}"`, sort: '-created' }),
      ]);
      setContact(c);
      setDraft(c);
      const conv = convs.items[0] || null;
      setConversation(conv);
      if (conv) {
        const ms = await pb.collection('messages').getList<MsgRecord>(1, 200, {
          filter: `conversation = "${conv.id}"`,
          sort: 'created',
        });
        setMessages(ms.items);
      } else {
        setMessages([]);
      }
      setTimeline(tl.items);
    } catch (e) {
      toast.error('Kişi yüklenemedi: ' + (e as Error).message);
      navigate('/admin/kisiler');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const ensureConversation = async (): Promise<ConvRecord | null> => {
    if (conversation) return conversation;
    if (!contact) return null;
    try {
      const created = await pb.collection('conversations').create<ConvRecord>({
        contact: contact.id,
        channel: contact.source,
        started_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        bot_active: true,
        unread_count: 0,
      } as never);
      setConversation(created);
      return created;
    } catch (e) {
      toast.error('Konuşma oluşturulamadı: ' + (e as Error).message);
      return null;
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !id) return;
    setSending(true);
    try {
      const conv = await ensureConversation();
      if (!conv) return;
      await pb.collection('messages').create({
        conversation: conv.id,
        sender: 'agent',
        content: reply.trim(),
        type: 'text',
      });
      await pb.collection('conversations').update(conv.id, { last_message_at: new Date().toISOString() });
      setReply('');
      const ms = await pb.collection('messages').getList<MsgRecord>(1, 200, {
        filter: `conversation = "${conv.id}"`,
        sort: 'created',
      });
      setMessages(ms.items);
    } catch (e) {
      toast.error('Gönderilemedi: ' + (e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const sendLocationPhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (!files.length || !id) return;
      const conv = await ensureConversation();
      if (!conv) return;
      const fd = new FormData();
      fd.append('conversation', conv.id);
      fd.append('sender', 'agent');
      fd.append('type', 'photo');
      fd.append('content', files[0].name);
      for (const f of files) fd.append('attachments', f);
      try {
        await pb.collection('messages').create(fd);
        await pb.collection('timeline_events').create({
          contact: id,
          type: 'photo_sent',
          title: 'Konum fotoğrafı gönderildi',
          description: files.map((f) => f.name).join(', '),
        } as never);
        toast.success(`${files.length} fotoğraf gönderildi`);
        loadAll();
      } catch (err) {
        toast.error('Fotoğraf gönderilemedi: ' + (err as Error).message);
      }
    };
    input.click();
  };

  const saveContact = async () => {
    if (!draft || !id) return;
    try {
      await pb.collection('contacts').update(id, draft);
      setContact(draft);
      setEditing(false);
      toast.success('Kişi güncellendi');
    } catch (e) {
      toast.error('Güncelleme hatası: ' + (e as Error).message);
    }
  };

  const changeStatus = async (s: ContactStatus) => {
    if (!contact || !id) return;
    const prev = contact.status;
    setContact({ ...contact, status: s });
    try {
      await pb.collection('contacts').update(id, { status: s });
      await pb.collection('timeline_events').create({
        contact: id,
        type: 'status_change',
        title: `Durum: ${CONTACT_STATUSES.find((x) => x.id === s)?.label}`,
        meta: { from: prev, to: s },
      } as never);
      loadAll();
    } catch (e) {
      toast.error('Durum güncellenemedi: ' + (e as Error).message);
    }
  };

  if (loading || !contact) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const ch = CHANNELS.find((c) => c.id === contact.source);

  return (
    <div className="p-6 lg:p-8">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> CRM
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 font-display text-2xl font-semibold">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-semibold">{contact.name}</h1>
                    <Badge variant="glass" className="capitalize">
                      <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${TYPE_COLORS[contact.type]}`} />
                      {TYPE_LABELS[contact.type]}
                    </Badge>
                    <Badge variant="outline">{ch?.label}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-accent">
                        <Phone className="h-3.5 w-3.5" /> {formatPhone(contact.phone)}
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-accent">
                        <Mail className="h-3.5 w-3.5" /> {contact.email}
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(contact.tags || []).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Select value={contact.status} onChange={(e) => changeStatus(e.target.value as ContactStatus)} className="w-44">
                    {CONTACT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
                    {editing ? <><X className="h-3.5 w-3.5" /> İptal</> : <><Edit3 className="h-3.5 w-3.5" /> Düzenle</>}
                  </Button>
                </div>
              </div>

              {editing && draft && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Ad Soyad</label>
                      <Input value={draft.name} onChange={(e) => setDraft((d) => d && { ...d, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Telefon</label>
                      <Input value={draft.phone || ''} onChange={(e) => setDraft((d) => d && { ...d, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">E-posta</label>
                      <Input value={draft.email || ''} onChange={(e) => setDraft((d) => d && { ...d, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Bütçe Min</label>
                      <Input type="number" value={draft.budget_min || 0} onChange={(e) => setDraft((d) => d && { ...d, budget_min: Number(e.target.value) })} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-muted-foreground">Notlar</label>
                      <Textarea rows={3} value={draft.notes || ''} onChange={(e) => setDraft((d) => d && { ...d, notes: e.target.value })} />
                    </div>
                  </div>
                  <Button variant="gold" size="sm" onClick={saveContact}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
                </motion.div>
              )}

              {(contact.budget_min || contact.budget_max) && (
                <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-sm">
                  <Briefcase className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Bütçe:</span>
                  <span className="font-semibold text-foreground">
                    {contact.budget_min ? formatPrice(contact.budget_min) : ''}
                    {contact.budget_min && contact.budget_max && ' - '}
                    {contact.budget_max ? formatPrice(contact.budget_max) : ''}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Konuşma</CardTitle>
                <Badge variant="glass">{messages.length} mesaj</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={scrollRef} className="max-h-[480px] space-y-3 overflow-y-auto pr-2">
                {messages.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.08] p-6 text-center text-sm text-muted-foreground">
                    Henüz mesaj yok. Aşağıdan ilk mesajı gönderebilirsiniz.
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'agent' ? 'justify-end' : m.sender === 'customer' ? 'justify-start' : 'justify-center'}`}>
                    {m.sender === 'system' ? (
                      <div className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">{m.content}</div>
                    ) : m.type === 'photo' ? (
                      <div className="max-w-[70%] overflow-hidden rounded-2xl border border-white/[0.08]">
                        {m.attachments && m.attachments.length > 0 ? (
                          <img
                            src={pb.files.getUrl({ collectionId: pb.collection('messages').collectionIdOrName, id: m.id }, m.attachments[0])}
                            alt={m.content}
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/30 to-accent/15 text-xs text-foreground/40">
                            {m.content}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.sender === 'agent'
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : m.sender === 'bot'
                          ? 'bg-violet-500/15 text-foreground/90 rounded-bl-sm border border-violet-500/20'
                          : 'bg-white/[0.05] text-foreground/90 rounded-bl-sm border border-white/[0.06]'
                      }`}>
                        {m.sender === 'bot' && <div className="mb-1 flex items-center gap-1 text-[10px] text-violet-300"><Sparkles className="h-3 w-3" /> Bot</div>}
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        <div className={`mt-1 text-[10px] ${m.sender === 'agent' ? 'text-accent-foreground/60' : 'text-muted-foreground'}`}>
                          {format(new Date(m.created), 'HH:mm', { locale: tr })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                <button onClick={sendLocationPhoto} className="rounded-md border border-white/[0.08] p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-accent" title="Konum fotoğrafı gönder">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="rounded-md border border-white/[0.08] p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-accent" title="Teklif paylaş">
                  <FileText className="h-4 w-4" />
                </button>
                <Input
                  placeholder="Mesaj yaz..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  disabled={sending}
                />
                <Button onClick={sendReply} variant="gold" size="icon" disabled={sending || !reply.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Aktivite Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {timeline.length === 0 && (
                  <div className="text-xs text-muted-foreground">Henüz aktivite yok</div>
                )}
                <div className="absolute left-4 top-0 h-full w-px bg-white/[0.06]" />
                {timeline.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-3 pl-1"
                  >
                    <div className="relative z-10 shrink-0">
                      <TimelineIcon type={e.type} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="text-sm font-medium">{e.title}</div>
                      {e.description && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{e.description}</div>}
                      <div className="mt-1 text-[10px] text-muted-foreground/80">
                        {format(new Date(e.created), 'd MMM, HH:mm', { locale: tr })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hızlı İşlemler</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm transition-colors hover:border-accent/30">
                  <Phone className="h-4 w-4 text-accent" /> Hemen Ara
                </a>
              )}
              {contact.phone && (
                <a href={`https://wa.me/${contact.phone.replace(/\D/g, '').replace(/^0/, '90')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm transition-colors hover:bg-emerald-500/10">
                  <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp'tan Yaz
                </a>
              )}
              <Link to="/hizmetler" className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm transition-colors hover:border-accent/30">
                <MapPin className="h-4 w-4 text-accent" /> Hizmet Öner
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
