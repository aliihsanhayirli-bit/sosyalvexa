import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, X, CheckCheck, Loader2, Phone, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CHANNELS, APPOINTMENT_STATUSES, type Appointment, type AppointmentStatus } from '@/types';
import { format, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { pb } from '@/lib/pb';
import { toast } from 'sonner';

const FILTERS: { id: AppointmentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'pending', label: 'Bekliyor' },
  { id: 'confirmed', label: 'Onaylandı' },
  { id: 'done', label: 'Tamamlandı' },
  { id: 'cancelled', label: 'İptal' },
];

export default function AdminAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const f = filter === 'all' ? '' : `status = "${filter}"`;
      const list = await pb.collection('appointments').getList<Appointment>(1, 200, {
        sort: '-date',
        ...(f ? { filter: f } : {}),
      });
      setItems(list.items);
    } catch (e) {
      toast.error('Randevular yüklenemedi: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  useEffect(() => {
    pb.collection('appointments').subscribe('*', () => load());
    return () => {
      pb.collection('appointments').unsubscribe();
    };
  }, [filter]);

  const setStatus = async (id: string, status: AppointmentStatus) => {
    setBusy(id);
    try {
      await pb.collection('appointments').update(id, { status });
      toast.success(
        status === 'confirmed' ? 'Randevu onaylandı' : status === 'done' ? 'Randevu tamamlandı' : 'Randevu iptal edildi',
      );
      load();
    } catch (e) {
      toast.error('Güncellenemedi: ' + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const statusOf = (s: AppointmentStatus) => APPOINTMENT_STATUSES.find((x) => x.id === s);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Randevular</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yapay zeka asistanının oluşturduğu randevular · son teyit sizde
          </p>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                filter === f.id
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-white/[0.08] text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
          <div className="mt-4 font-display text-lg">Henüz randevu yok</div>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Asistan müşterilerle anlaştığında randevular burada listelenir.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const st = statusOf(a.status);
            const ch = CHANNELS.find((c) => c.id === a.channel);
            const d = new Date(a.date);
            const past = isPast(d);
            return (
              <Card key={a.id} className={cn('p-4 sm:p-5', a.status === 'cancelled' && 'opacity-55')}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/25">
                    <span className="font-display text-lg font-bold leading-none text-accent">{format(d, 'd')}</span>
                    <span className="mt-0.5 text-[10px] uppercase text-accent/80">{format(d, 'MMM', { locale: tr })}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.name}</span>
                      <Badge variant="glass" className="text-[10px]">{ch?.label || a.channel}</Badge>
                      {past && a.status === 'pending' && (
                        <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-300">Geçmiş tarih</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-foreground/70">
                      {format(d, 'EEEE, d MMMM yyyy · HH:mm', { locale: tr })}
                      {a.service ? ` · ${a.service}` : ''}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {a.phone && (
                        <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 hover:text-accent">
                          <Phone className="h-3 w-3" /> {a.phone}
                        </a>
                      )}
                      {a.notes && <span className="truncate">Not: {a.notes}</span>}
                      <span>Kaynak: {a.source === 'bot' ? 'AI Asistan' : 'Admin'}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn('h-2 w-2 rounded-full', st?.color)} />
                      {st?.label}
                    </span>
                    {busy === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {a.status === 'pending' && (
                          <>
                            <Button size="sm" variant="gold" onClick={() => setStatus(a.id, 'confirmed')}>
                              <Check className="mr-1 h-3.5 w-3.5" /> Onayla
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'cancelled')}>
                              <X className="mr-1 h-3.5 w-3.5" /> İptal
                            </Button>
                          </>
                        )}
                        {a.status === 'confirmed' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'done')}>
                              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Tamamlandı
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'cancelled')}>
                              <X className="mr-1 h-3.5 w-3.5" /> İptal
                            </Button>
                          </>
                        )}
                      </>
                    )}
                    <Link
                      to={`/admin/kisiler/${a.contact}`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      Kişi <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
