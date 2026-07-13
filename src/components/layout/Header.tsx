import { NavLink, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { NAV, COMPANY } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent',
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-accent/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            <img src="/logo.png" alt="YCA Yatırım" className="relative h-12 w-12 rounded-full ring-1 ring-white/10" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-lg font-semibold leading-none text-foreground">YCA Yatırım</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Temelli · Ankara
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-foreground/70 hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-accent transition-colors"
          >
            <Phone className="h-4 w-4" />
            {COMPANY.phone}
          </a>
          <Button variant="gold" size="sm" className="hidden md:inline-flex" onClick={() => (window.location.href = '/iletisim')}>
            İletişim
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden rounded-md p-2 text-foreground/80 hover:bg-white/5"
            aria-label="Menüyü aç/kapat"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-background/95 backdrop-blur-xl">
          <nav className="container-wide flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="border-b border-white/[0.04] py-3 text-base font-medium text-foreground/80 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="mt-4 flex items-center gap-2 text-accent"
            >
              <Phone className="h-4 w-4" /> {COMPANY.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
