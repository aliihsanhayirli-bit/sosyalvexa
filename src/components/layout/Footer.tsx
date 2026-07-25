import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { COMPANY, NAV } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/[0.06] bg-gradient-to-b from-background to-black/60">
      <div className="container-wide py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt={COMPANY.brand} className="h-14 w-14 rounded-full ring-1 ring-white/10" />
              <div>
                <div className="font-display text-xl font-semibold text-foreground">{COMPANY.brand}</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {COMPANY.shortTagline}
                </div>
              </div>
            </Link>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">{COMPANY.description}</p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={COMPANY.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={COMPANY.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={COMPANY.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={COMPANY.social.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Keşfet</div>
            <ul className="space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-muted-foreground transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/kvkk" className="text-sm text-muted-foreground transition-colors hover:text-accent">
                  KVKK Aydınlatma
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">İletişim</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-accent">{COMPANY.phone}</a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-accent">{COMPANY.email}</a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {COMPANY.address}
              </li>
              <li className="text-xs text-muted-foreground/80">{COMPANY.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>
            © {new Date().getFullYear()} {COMPANY.name}. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            Tüm sistemler aktif
          </div>
        </div>
      </div>
    </footer>
  );
}
