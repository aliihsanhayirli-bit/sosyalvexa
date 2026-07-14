import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { LayoutGrid, List, Plus, Search, Phone, MessageCircle, Mail, Filter, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { pb } from '@/lib/pb';
import { CHANNELS, CONTACT_STATUSES, type Contact, type ContactStatus, type Channel } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

const DEMO: Contact[] = [
  { id: 'c1', name: 'Ahmet Yılmaz', phone: '0532 111 22 33', email: 'ahmet@mail.com', type: 'buyer', status: 'new', source: 'whatsapp', tags: ['sıcak'], notes: 'Temelli OSB yakını bakıyor', budget_min: 1500000, budget_max: 3000000, created: '2024-12-15T10:00:00Z', updated: '2024-12-15T10:00:00Z' },
  { id: 'c2', name: 'Fatma Demir', phone: '0533 222 33 44', type: 'seller', status: 'qualified', source: 'web', tags: ['tarla'], notes: '2 dönüm tarla satmak istiyor', created: '2024-12-14T14:30:00Z', updated: '2024-12-15T09:00:00Z' },
  { id: 'c3', name: 'Mehmet Kaya', phone: '0534 333 44 55', type: 'buyer', status: 'contacted', source: 'instagram', tags: ['konut'], budget_min: 2000000, created: '2024-12-13T11:00:00Z', updated: '2024-12-14T16:00:00Z' },
  { id: 'c4', name: 'Ayşe Şahin', phone: '0535 444 55 66', type: 'invest', status: 'visit_scheduled', source: 'facebook', notes: 'Yatırım danışmanlığı', created: '2024-12-12T15:00:00Z', updated: '2024-12-15T08:00:00Z' },
  { id: 'c5', name: 'Ali Çelik', phone: '0536 555 66 77', type: 'seller', status: 'new', source: 'whatsapp', tags: ['konut'], created: '2024-12-15T12:00:00Z', updated: '2024-12-15T12:00:00Z' },
  { id: 'c6', name: 'Zeynep Aydın', phone: '0537 666 77 88', type: 'buyer', status: 'qualified', source: 'web', tags: ['sıcak', 'konut'], budget_min: 2500000, budget_max: 4000000, created: '2024-12-10T09:00:00Z', updated: '2024-12-14T11:00:00Z' },
  { id: 'c7', name: 'Hasan Polat', type: 'buyer', status: 'offer', source: 'whatsapp', tags: ['acil'], created: '2024-12-08T14:00:00Z', updated: '2024-12-15T11:00:00Z' },
  { id: 'c8', name: 'Elif Yıldız', phone: '0539 888 99 00', type: 'seller', status: 'won', source: 'web', notes: 'Tapu devri tamamlandı', created: '2024-11-15T10:00:00Z', updated: '2024-12-01T15:00:00Z' },
];

function ContactCard({ contact, isDragging, view }: { contact: Contact; isDragging?: boolean; view: 'kanban' | 'list' }) {
  const ch = CHANNELS.find((c) => c.id === contact.source);
  const typeLabel = contact.type === 'buyer' ? 'Alıcı' : contact.type === 'seller' ? 'Satıcı' : 'Yatırımcı';

  if (view === 'list') {
    return (
      <Link
        to={`/admin/kisiler/${contact.id}`}
        className={cn(
          'flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-accent/30',
          isDragging && 'opacity-30',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-sm font-semibold">
          {contact.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium">{contact.name}</div>
            <Badge variant={contact.type === 'buyer' ? 'default' : contact.type === 'seller' ? 'gold' : 'secondary'} className="text-[10px]">
              {typeLabel}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            {contact.phone && <span>{contact.phone}</span>}
            <span>•</span>
            <span>{ch?.label}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(contact.updated), { addSuffix: true, locale: tr })}</span>
          </div>
        </div>
        <div>
          <Badge variant="glass">{CONTACT_STATUSES.find((s) => s.id === contact.status)?.label}</Badge>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/admin/kisiler/${contact.id}`}
      className={cn(
        'block rounded-lg border border-white/[0.08] bg-card/80 p-3 shadow-sm transition-all hover:border-accent/40',
        isDragging && 'opacity-30',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30 text-xs font-semibold">
          {contact.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{contact.name}</div>
          <div className="text-[11px] text-muted-foreground">{ch?.label}</div>
        </div>
      </div>
      {contact.phone && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Phone className="h-3 w-3" /> {contact.phone}
        </div>
      )}
      {contact.notes && (
        <div className="mt-2 line-clamp-2 text-[11px] text-foreground/70">{contact.notes}</div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-2 text-[10px] text-muted-foreground">
        <span>{formatDistanceToNow(new Date(contact.updated), { addSuffix: true, locale: tr })}</span>
        {contact.budget_min && <span className="text-accent">{(contact.budget_min / 1_000_000).toFixed(1)}M+</span>}
      </div>
    </Link>
  );
}

function DraggableCard({ contact, view }: { contact: Contact; view: 'kanban' | 'list' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: contact.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ContactCard contact={contact} isDragging={isDragging} view={view} />
    </div>
  );
}

function KanbanColumn({ status, contacts, view }: { status: typeof CONTACT_STATUSES[number]; contacts: Contact[]; view: 'kanban' | 'list' }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-[400px] w-72 shrink-0 flex-col rounded-xl border border-white/[0.06] bg-card/30 backdrop-blur-sm transition-colors',
        isOver && 'border-accent/50 bg-accent/[0.03]',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', status.color)} />
          <span className="text-sm font-semibold">{status.label}</span>
        </div>
        <Badge variant="glass">{contacts.length}</Badge>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {contacts.map((c) => <DraggableCard key={c.id} contact={c} view={view} />)}
        {contacts.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/[0.05] text-xs text-muted-foreground">
            Boş
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [activeDrag, setActiveDrag] = useState<Contact | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    (async () => {
      try {
        const items = await pb.collection('contacts').getFullList<Contact>({ sort: '-updated' });
        setContacts(items);
      } catch (e) {
        toast.error('Kişiler yüklenemedi: ' + (e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = contacts.filter((c) => {
    if (search && !`${c.name} ${c.phone || ''} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (channelFilter !== 'all' && c.source !== channelFilter) return false;
    return true;
  });

  const onDragStart = (e: DragStartEvent) => {
    const c = contacts.find((c) => c.id === e.active.id);
    if (c) setActiveDrag(c);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveDrag(null);
    if (!e.over) return;
    const newStatus = e.over.id as ContactStatus;
    const id = e.active.id as string;
    setContacts((arr) => arr.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    try {
      await pb.collection('contacts').update(id, { status: newStatus });
    } catch {}
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">CRM · Kişiler</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} kişi · sürükle-bırak ile durum güncelle</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Yeni Kişi
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <Card className="border-0 shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="İsim, telefon veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="lg:w-40">
              <option value="all">Tüm Tipler</option>
              <option value="buyer">Alıcı</option>
              <option value="seller">Satıcı</option>
            </Select>
            <Select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as any)} className="lg:w-40">
              <option value="all">Tüm Kanallar</option>
              {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <div className="flex rounded-md border border-border p-1">
              <button
                onClick={() => setView('kanban')}
                className={cn('flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors', view === 'kanban' ? 'bg-accent/15 text-accent' : 'text-muted-foreground')}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={cn('flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors', view === 'list' ? 'bg-accent/15 text-accent' : 'text-muted-foreground')}
              >
                <List className="h-3.5 w-3.5" /> Liste
              </button>
            </div>
          </div>
        </Card>
      </Card>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {CONTACT_STATUSES.map((s) => (
              <KanbanColumn key={s.id} status={s} contacts={filtered.filter((c) => c.status === s.id)} view="kanban" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => <ContactCard key={c.id} contact={c} view="list" />)}
          </div>
        )}
        <DragOverlay>
          {activeDrag && <ContactCard contact={activeDrag} view="kanban" />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
