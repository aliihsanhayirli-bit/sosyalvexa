import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Msg = { id: string; role: 'user' | 'bot'; content: string; suggestions?: string[]; ts: number };

const INITIAL: Msg = {
  id: 'init',
  role: 'bot',
  ts: Date.now(),
  content: `Merhaba, ben GYD Asistan 👋\n\n${COMPANY.brand} olarak Ankara genelinde **imarlı arsa** alım-satımı, proje geliştirme ve yatırım danışmanlığı yapıyoruz. Size nasıl yardımcı olabilirim?`,
  suggestions: ['Arsa satın almak istiyorum', 'Arsa satmak istiyorum', 'Yatırım danışmanlığı', 'Fiyat teklifi al'],
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && unread) setUnread(0);
  }, [open, unread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8).map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('chat-failed');
      const data = (await res.json()) as { reply: string; suggestions?: string[] };
      const botMsg: Msg = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: data.reply,
        suggestions: data.suggestions,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch {
      const fallback: Msg = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: `Şu an teknik bir sorun yaşıyoruz. Hemen bir danışmanımızla görüşmek için ${COMPANY.phone} numarasını arayabilir veya WhatsApp'tan yazabilirsiniz.`,
        ts: Date.now(),
      };
      setMessages((m) => [...m, fallback]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-2xl shadow-accent/40',
          'border-2 border-white/10',
        )}
        aria-label="Chat'i aç"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-24 right-6 z-40 flex h-[600px] max-h-[calc(100vh-8rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden',
              'rounded-2xl border border-white/10 bg-card/95 shadow-2xl shadow-black/50 backdrop-blur-2xl',
            )}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-4">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold-500 text-sm font-semibold text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">GYD Asistan</div>
                <div className="text-[11px] text-muted-foreground">Online · ortalama 1 dk yanıt</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-white/[0.05] text-foreground/90 rounded-bl-sm border border-white/[0.06]',
                      )}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                    {m.suggestions && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
                          >
                            {s}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm text-foreground/70">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> yazıyor…
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-white/[0.06] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
                aria-label="Gönder"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-2 text-center text-[10px] text-muted-foreground/70">
              Gemini AI · GYD Grup tarafından eğitildi
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
