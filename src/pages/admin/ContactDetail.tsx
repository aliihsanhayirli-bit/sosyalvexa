import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ArrowLeft, Phone, Mail, MessageCircle, MapPin, Send, Image as ImageIcon, FileText,
  CheckCircle2, MessageSquare, Tag, Edit3, Save, X, User, Briefcase, Calendar, Building2, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { CHANNELS, CONTACT_STATUSES, type Contact, type ContactStatus, type Message, type TimelineEvent } from '@/types';
import { formatPrice, formatPhone } from '@/lib/utils';
import { toast } from 'sonner';
import { pb } from '@/lib/pb';

const DEMO_CONTACT: Contact = {
  id: 'c1', name: 'Ahmet Yılmaz', phone: '0532 111 22 33', email: 'ahmet@mail.com',
  type: 'buyer', status: 'new', source: 'whatsapp',
  tags: ['sıcak', 'konut'], notes: 'Temelli OSB yakını bakıyor. Bütçe 1.5-3M arası.',
  budget_min: 1500000, budget_max: 3000000,
  created: '2024-12-15T10:00:00Z', updated: '2024-12-15T14:00:00Z',
};

const DEMO_MESSAGES: Message[] = [
  { id: 'm1', conversation: 'conv1', sender: 'customer', content: 'Merhaba, Temelli OSB yakınında 1.500 m² civarı arsa var mı?', type: 'text', timestamp: '2024-12-15T10:00:00Z' },
  { id: 'm2', conversation: 'conv1', sender: 'bot', content: 'Merhaba Ahmet Bey! 👋 YCA Yatırım\'a hoş geldiniz. Evet, Temelli OSB yakınında portföyümüzde uygun seçeneklerimiz var. Bütçeniz ve istediğiniz özellikler hakkında bilgi alabilir miyim?', type: 'text', timestamp: '2024-12-15T10:00:30Z' },
  { id: 'm3', conversation: 'conv1', sender: 'customer', content: '1.5-3 milyon arası, imarlı olsun', type: 'text', timestamp: '2024-12-15T10:01:00Z' },
  { id: 'm4', conversation: 'conv1', sender: 'bot', content: 'Harika! Size uygun 3 arsamız var. Hemen bir danışmanımız sizinle iletişime geçsin mi?', type: 'text', timestamp: '2024-12-15T10:01:30Z' },
  { id: 'm5', conversation: 'conv1', sender: 'system', content: 'Müşteri danışmana yönlendirildi', type: 'text', timestamp: '2024-12-15T10:02:00Z' },
  { id: 'm6', conversation: 'conv1', sender: 'agent', content: 'Merhaba Ahmet Bey, ben Yusuf. Bütçenize uygun 3 seçeneği size WhatsApp\'tan fotoğraflarıyla gönderiyorum.', type: 'text', timestamp: '2024-12-15T10:30:00Z' },
];

const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 't1', contact: 'c1', type: 'created', title: 'Kişi oluşturuldu', description: 'WhatsApp kanalından', timestamp: '2024-12-15T10:00:00Z' },
  { id: 't2', contact: 'c1', type: 'message', title: 'Müşteri mesajı', description: 'Merhaba, Temelli OSB yakınında...', timestamp: '2024-12-15T10:00:00Z' },
  { id: 't3', contact: 'c1', type: 'status_change', title: 'Durum: Yeni', description: 'Otomatik atandı', meta: { from: null, to: 'new' }, timestamp: '2024-12-15T10:00:00Z' },
  { id: 't4', contact: 'c1', type: 'message', title: 'Danışman mesajı', description: 'Merhaba Ahmet Bey, ben Yusuf...', timestamp: '2024-12-15T10:30:00Z' },
  { id: 't5', contact: 'c1', type: 'note', title: 'Not eklendi', description: 'Temelli OSB yakını bakıyor. Bütçe 1.5-3M arası.', timestamp: '2024-12-15T11:00:00Z' },
  { id: 't6', contact: 'c1', type: 'listing_shared', title: 'Arsa paylaşıldı', description: 'Temelli OSB · 1.640 m²', ref_id: 'l3', timestamp: '2024-12-15T11:30:00Z' },
];

const TYPE_LABELS = { buyer: 'Alıcı', seller: 'Satıcı', invest: 'Yatırımcı' };
const TYPE_COLORS = { buyer: 'bg-cyan-500', seller: 'bg-amber-500', invest: 'bg-violet-500' };

function TimelineIcon({ type }: { type: TimelineEvent['type'] }) {
  const map: Record<TimelineEvent['type'], { icon: typeof MessageSquare; color: string }> = {
    created: { icon: User, color: 'bg-slate-500' },
    message: { icon: MessageSquare, color: 'bg-cyan-500' },
    status_change: { icon: CheckCircle2, color: 'bg-amber-500' },
    note: { icon: Edit3, color: 'bg-violet-500' },
    photo_sent: { icon: ImageIcon, color: 'bg-emerald-500' },
    listing_shared: { icon: Building2, color: 'bg-gold-500' },
  };
  const { icon: Icon, color } = map[type];
  return <div className={`flex h-8 w-8 items-center justify-center rounded-full ${color} text-white`}><Icon className="h-4 w-4" /></div>;
}

export default function AdminContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>(DEMO_CONTACT);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(DEMO_TIMELINE);
  const [reply, setReply] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Contact>(DEMO_CONTACT);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const c = await pb.collection('contacts').getOne<Contact>(id!);
        setContact(c);
        setDraft(c);
      } catch { /* demo */ }
    })();
  }, [id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    const msg: Message = {
      id: 'tmp' + Date.now(),
      conversation: 'c1',
      sender: 'agent',
      content: reply,
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    setReply('');
    try {
      await pb.collection('messages').create({ conversation: 'c1', sender: 'agent', content: msg.content, type: 'text' });
      toast.success('Mesaj gönderildi');
    } catch { toast.success('Mesaj gönderildi (demo)'); }
  };

  const sendLocationPhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach((f) => {
        const url = URL.createObjectURL(f);
        const msg: Message = {
          id: 'tmp' + Date.now() + Math.random(),
          conversation: 'c1', sender: 'agent', type: 'photo',
          content: f.name, payload: { url },
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, msg]);
        setTimeline((t) => [...t, {
          id: 't' + Date.now(), contact: id!, type: 'photo_sent',
          title: 'Konum fotoğrafı gönderildi', description: f.name,
          timestamp: new Date().toISOString(),
        }]);
      });
      toast.success(`${files.length} fotoğraf gönderildi`);
    };
    input.click();
  };

  const saveContact = async () => {
    setContact(draft);
    setEditing(false);
    try { await pb.collection('contacts').update(id!, draft); } catch {}
    toast.success('Kişi güncellendi');
  };

  const changeStatus = async (s: ContactStatus) => {
    setContact((c) => ({ ...c, status: s }));
    setTimeline((t) => [...t, {
      id: 't' + Date.now(), contact: id!, type: 'status_change',
      title: `Durum: ${CONTACT_STATUSES.find((x) => x.id === s)?.label}`,
      meta: { from: contact.status, to: s },
      timestamp: new Date().toISOString(),
    }]);
    try { await pb.collection('contacts').update(id!, { status: s }); } catch {}
  };

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

              {editing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Ad Soyad</label>
                      <Input value={draft.name} onChange={(e) => setDraft((d: any) => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Telefon</label>
                      <Input value={draft.phone || ''} onChange={(e) => setDraft((d: any) => ({ ...d, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">E-posta</label>
                      <Input value={draft.email || ''} onChange={(e) => setDraft((d: any) => ({ ...d, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Bütçe Min</label>
                      <Input type="number" value={draft.budget_min || 0} onChange={(e) => setDraft((d: any) => ({ ...d, budget_min: Number(e.target.value) }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-muted-foreground">Notlar</label>
                      <Textarea rows={3} value={draft.notes || ''} onChange={(e) => setDraft((d: any) => ({ ...d, notes: e.target.value }))} />
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
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'agent' ? 'justify-end' : m.sender === 'customer' ? 'justify-start' : 'justify-center'}`}>
                    {m.sender === 'system' ? (
                      <div className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">{m.content}</div>
                    ) : m.type === 'photo' ? (
                      <div className="max-w-[70%] overflow-hidden rounded-2xl border border-white/[0.08]">
                        <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent/15 flex items-center justify-center text-xs text-foreground/40">
                          {m.content}
                        </div>
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
                          {format(new Date(m.timestamp), 'HH:mm', { locale: tr })}
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
                <button className="rounded-md border border-white/[0.08] p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-accent" title="Arsa paylaş">
                  <FileText className="h-4 w-4" />
                </button>
                <Input
                  placeholder="Mesaj yaz..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                />
                <Button onClick={sendReply} variant="gold" size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Aktivite Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                <div className="absolute left-4 top-0 h-full w-px bg-white/[0.06]" />
                {timeline.slice().reverse().map((e, i) => (
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
                        {format(new Date(e.timestamp), 'd MMM, HH:mm', { locale: tr })}
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
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm transition-colors hover:border-accent/30">
                <Phone className="h-4 w-4 text-accent" /> Hemen Ara
              </a>
              {contact.phone && (
                <a href={`https://wa.me/${contact.phone.replace(/\D/g, '').replace(/^0/, '90')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm transition-colors hover:bg-emerald-500/10">
                  <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp'tan Yaz
                </a>
              )}
              <Link to="/arsalar" className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm transition-colors hover:border-accent/30">
                <MapPin className="h-4 w-4 text-accent" /> Arsa Öner
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
