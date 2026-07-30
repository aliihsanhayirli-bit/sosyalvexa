import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md text-center"
      >
        <div className="font-display text-[140px] font-semibold leading-none gold-text">404</div>
        <h1 className="mt-4 font-display text-3xl font-medium">Sayfa bulunamadı</h1>
        <p className="mt-3 text-foreground/60">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="gold" size="lg"><Home className="h-4 w-4" /> Anasayfa</Button>
          </Link>
          <Link to="/hizmetler">
            <Button variant="outline" size="lg"><ArrowLeft className="h-4 w-4" /> Hizmetlere Dön</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
