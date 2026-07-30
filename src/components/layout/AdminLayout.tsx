import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, MessageSquare, CalendarDays, Bot, UserCog, Settings, LogOut, Building2, Bell,
} from 'lucide-react';
import { pb } from '@/lib/pb';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/kisiler', label: 'CRM · Kişiler', icon: Users },
  { to: '/admin/konusmalar', label: 'Konuşmalar', icon: MessageSquare },
  { to: '/admin/randevular', label: 'Randevular', icon: CalendarDays },
  { to: '/admin/bot', label: 'Bot & RAG', icon: Bot },
  { to: '/admin/kullanici', label: 'Takım', icon: UserCog },
  { to: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  // @ts-expect-error - PB v0.21+ uses 'model', fallback to 'record' for older versions
  const [user, setUser] = useState<Record<string, unknown> | null>(pb.authStore.model || pb.authStore.record);

  useEffect(() => {
    const unsub = pb.authStore.onChange(() => {
      // @ts-expect-error - PB v0.21+ uses 'model', fallback to 'record' for older versions
      setUser(pb.authStore.model || pb.authStore.record);
    }, true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate('/admin/login', { replace: true });
    }
  }, [pb.authStore.isValid, navigate]);

  const logout = () => {
    pb.authStore.clear();
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-card/40 backdrop-blur-xl lg:flex">
        <Link to="/" className="flex h-20 items-center gap-3 border-b border-white/[0.06] px-6">
          <img src="/logo.png" alt="Vexabiz Digital" className="h-10 w-10 rounded-full ring-1 ring-white/10" />
          <div>
            <div className="font-display text-base font-semibold leading-none">Vexabiz Admin</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Yönetim Paneli</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-foreground/70 hover:bg-white/[0.04] hover:text-foreground border border-transparent',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
              <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-500 text-sm font-semibold text-primary">
              {String((user as Record<string, unknown>).name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{String((user as Record<string, unknown>).name || 'Admin')}</div>
              <div className="truncate text-xs text-muted-foreground">{String((user as Record<string, unknown>).email || '')}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] py-2 text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.06] bg-card/30 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 lg:hidden">
            <Building2 className="h-5 w-5 text-accent" />
            <span className="font-display font-semibold">Vexabiz Admin</span>
          </div>
          <div className="hidden lg:block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Yönetim Paneli</div>
            <div className="font-display text-lg font-semibold">Hoş geldiniz</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] text-foreground/70 hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            <Link to="/" target="_blank" className="text-xs text-muted-foreground hover:text-accent">
              Siteyu Görüntüle →
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
