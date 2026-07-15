import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { pb } from '@/lib/pb';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      toast.success('Giriş başarılı');
      navigate('/admin');
    } catch {
      toast.error('Giriş başarısız. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-card/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-gold-500/30">
              <img src="/logo.png" alt="GYD Grup" className="h-12 w-12 rounded-full" />
            </div>
            <h1 className="font-display text-3xl font-semibold">GYD Admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">Yönetim paneline giriş yapın</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gydgrup.com.tr"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            PocketBase Auth · Güvenli bağlantı
          </div>
        </div>
      </motion.div>
    </div>
  );
}
