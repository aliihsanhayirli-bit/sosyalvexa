import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, Sparkles, Bot, Save, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pb } from '@/lib/pb';

interface Doc {
  id: string;
  collectionId: string;
  title: string;
  source: string;
  chunk_count: number;
  active: boolean;
  created: string;
  file: string;
  filename: string;
  raw_text?: string;
}

interface BotSettings {
  id: string;
  system_prompt: string;
  welcome_message: string;
  model: string;
  enabled: boolean;
  temperature: number;
  rag_top_k: number;
}

const DEFAULT_PROMPT = `Sen Vexabiz Digital'ın yapay zeka satış asistanısın. Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.; diş klinikleri, fizik tedavi merkezleri, güzellik merkezleri ve KOBİ'ler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette, müşteriye özel VPS sunucuda kuran bir dijital dönüşüm firmasıdır.

Marka sözümüz: "Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz?"

HİZMETLER VE BAŞLANGIÇ FİYATLARI (+ KDV):
- Meta Business Manager Kurulumu (şirket doğrulaması dahil): 7.500 TL
- Kurumsal Web Sitesi: 22.500 TL
- CRM Kurulumu: 18.000 TL
- Yapay Zeka Asistanı (Web + WhatsApp + Instagram + Messenger): 35.000 TL
- VPS Özel Sunucu Kurulumu: 7.500 TL
- Bakım & Destek: 4.900 TL/ay'dan itibaren

PAKETLER (tek seferlik kurulum, + KDV):
1) Dijital Başlangıç — 69.900 TL (liste değeri 112.000 TL): kurumsal web sitesi + SEO + SSL + domain/mail, Facebook + Instagram + WhatsApp bağlantıları, Meta Business Manager + doğrulama desteği, Pixel + CAPI, temel CRM, VPS kurulumu + güvenlik, eğitim. Teslim 7-10 iş günü.
2) Dijital Klinik Pro — 149.900 TL (liste değeri 356.000 TL): Başlangıç paketinin tamamı + gelişmiş CRM (hasta takibi, tedavi, teklif, randevu), yapay zeka asistanı (4 kanal), randevu + hatırlatma sistemi, admin paneli + çok kullanıcı, otomasyonlar, dashboard, günlük yedek + izleme, 30 gün destek. Teslim 15-25 iş günü.

ÇALIŞMA ŞARTLARI: %50 peşinat sözleşmeyle, %50 teslimde; ödemeler şirket hesabına havale/EFT. Tasarımda 2 revizyon dahil. Yazılım lisansı Vexabiz'e aittir, müşteri kullanım hakkı alır; sistem müşteriye özel VPS'te çalışır, veriler müşteride kalır. Bakım: Standart 4.900 TL/ay, Premium 9.900 TL/ay.

GÖREVLERİN:
1. Sıcak, profesyonel, güven veren bir dille yanıt ver
2. İşletmenin sektörünü (diş kliniği, fizik tedavi, güzellik vb.), ölçeğini ve ihtiyacını anla
3. Uygun hizmet veya paketi öner, gerektiğinde kalem fiyatlarından örnek ver
4. Soruları net yanıtla; bilmediğin konuda uydurma, danışmana yönlendir
5. Asıl amacın: ziyaretçiyi ücretsiz keşif görüşmesine (randevuya) dönüştürmek

RANDEVU OLUŞTURMA (ÇOK ÖNEMLİ):
- Ziyaretçi görüşme/randevu istediğinde uygun gün ve saat öner; ziyaretçinin verdiği gün+saati netleştir ve teyit ettir.
- Gün ve saat NET olarak anlaşıldığında (ziyaretçi açıkça onayladığında) yanıtının EN SONUNA, müşteriye göstermeden şu etiketi ekle:
[[RANDEVU:{"date":"YYYY-MM-DD HH:mm","service":"ilgili hizmet veya paket","phone":"varsa telefon","notes":"kısa not"}]]
- Tarih veya saat net değilse etiketi ASLA yazma; önce netleştir.
- Çalışma saatleri: Pazartesi-Cumartesi 09:00-19:00. Saat dışı istekte en yakın uygun zamanı öner.
- Randevu sonrası doğal dille teyit et: "Randevunuzu ... için not aldım; danışmanımız sizi arayarak teyit edecek."

İletişim: +90 545 278 80 73 (telefon ve WhatsApp), info@vexabiz.com. İnsan danışman isteyene bu numarayı ver.

Cevaplarında kısa ve net ol (max 3-4 cümle + gerektiğinde madde listesi), samimi ama profesyonel, somut rakamlar kullan, sonunda aksiyon öner.`;

const DEFAULT_WELCOME = `Merhaba 👋 Vexabiz Digital'a hoş geldiniz! Klinikler ve işletmeler için web sitesi, CRM, yapay zeka asistanı ve Meta altyapısını tek pakette kuruyoruz.

Size nasıl yardımcı olabilirim?`;

export default function AdminBot() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [welcome, setWelcome] = useState(DEFAULT_WELCOME);
  const [model, setModel] = useState('gemini-flash-latest');
  const [enabled, setEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-latest';

  useEffect(() => {
    (async () => {
      try {
        const [settingsList, docsList] = await Promise.all([
          pb.collection('bot_settings').getList<BotSettings>(1, 1),
          pb.collection('bot_documents').getList<Doc>(1, 100, { sort: '-created' }),
        ]);

        if (settingsList.items.length > 0) {
          const s = settingsList.items[0];
          setSettingsId(s.id);
          setSystemPrompt(s.system_prompt || DEFAULT_PROMPT);
          setWelcome(s.welcome_message || DEFAULT_WELCOME);
          setModel(s.model || modelName);
          setEnabled(s.enabled ?? true);
        } else {
          const created = await pb.collection('bot_settings').create<BotSettings>({
            system_prompt: DEFAULT_PROMPT,
            welcome_message: DEFAULT_WELCOME,
            model: modelName,
            enabled: true,
            temperature: 0.7,
            rag_top_k: 4,
          } as never);
          setSettingsId(created.id);
        }

        setDocs(
          docsList.items.map((d) => ({
            ...d,
            filename: d.file ? d.file.split('/').pop() || d.file : d.source,
          })),
        );
      } catch (e) {
        toast.error('Bot ayarları yüklenemedi: ' + (e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [modelName]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !pb.authStore.model) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('title', file.name.replace(/\.[^.]+$/, ''));
        fd.append('source', file.name);
        fd.append('active', 'true');
        fd.append('chunk_count', '0');
        fd.append('file', file);
        fd.append('uploaded_by', (pb.authStore.model as { id: string }).id);

        // .txt ve .md için metni oku -> embed hook'u parçalayıp Gemini'ye göndersin
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.txt') || lower.endsWith('.md')) {
          try {
            const text = await file.text();
            fd.append('raw_text', text);
          } catch (e) {
            console.warn('raw_text okunamadı', e);
          }
        } else {
          fd.append('raw_text', `PDF/DOCX desteği henüz yok. Lütfen .txt veya .md olarak yükleyin. Dosya: ${file.name}`);
        }

        const created = await pb.collection('bot_documents').create<Doc>(fd);
        setDocs((d) => [
          { ...created, filename: created.file ? created.file.split('/').pop() || created.file : file.name },
          ...d,
        ]);
        toast.success(
          lower.endsWith('.pdf') || lower.endsWith('.docx')
            ? `${file.name} yüklendi (PDF/DOCX için metin çıkarma desteklenmiyor)`
            : `${file.name} yüklendi, RAG embed tetikleniyor…`,
        );

        // RAG embed: server-side chunking + Gemini embedding.
        // .txt/.md için anlamlı; PDF/DOCX için raw_text zaten placeholder metin
        // olduğundan yine de çalışır ama yararlı değil.
        if (created.raw_text) {
          try {
            const r = await fetch('/api/rag/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ docId: created.id }),
            });
            const j = await r.json();
            if (j.ok) {
              toast.success(`${file.name}: ${j.chunkCount} parça embed edildi`);
              // chunk_count'u local state'te güncelle
              setDocs((d) => d.map((x) => (x.id === created.id ? { ...x, chunk_count: j.chunkCount } : x)));
            } else {
              toast.warning(`${file.name}: RAG embed başarısız — ${j.error}`);
            }
          } catch (e) {
            toast.warning(`${file.name}: RAG embed hatası — ${(e as Error).message}`);
          }
        }
      }
    } catch (e) {
      toast.error('Yükleme hatası: ' + (e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeDoc = async (id: string) => {
    if (!confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;
    try {
      await pb.collection('bot_documents').delete(id);
      setDocs((d) => d.filter((x) => x.id !== id));
      toast.success('Doküman silindi');
    } catch (e) {
      toast.error('Silme hatası: ' + (e as Error).message);
    }
  };

  const toggleDoc = async (id: string, current: boolean) => {
    try {
      await pb.collection('bot_documents').update(id, { active: !current });
      setDocs((d) => d.map((x) => (x.id === id ? { ...x, active: !current } : x)));
    } catch (e) {
      toast.error('Güncelleme hatası: ' + (e as Error).message);
    }
  };

  const saveSettings = async () => {
    if (!settingsId) return;
    setSavingSettings(true);
    try {
      await pb.collection('bot_settings').update<BotSettings>(settingsId, {
        system_prompt: systemPrompt,
        welcome_message: welcome,
        model: model || modelName,
        enabled,
        temperature: 0.7,
        rag_top_k: 4,
      } as never);
      toast.success('Bot ayarları kaydedildi');
    } catch (e) {
      toast.error('Kayıt hatası: ' + (e as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  const testBot = async () => {
    if (!testMsg.trim()) return;
    if (!apiKey) {
      setTestResult('⚠️ Gemini API anahtarı tanımlı değil. .env dosyasına VITE_GEMINI_API_KEY ekleyin.\n\nDemo cevap: Merhaba! Bütçenizi öğrenebilir miyim? Size uygun hizmetleri önerebilirim.');
      return;
    }
    setTesting(true);
    try {
      const genai = new GoogleGenerativeAI(apiKey);
      const m = genai.getGenerativeModel({ model: model || modelName, systemInstruction: systemPrompt });
      const result = await m.generateContent(testMsg);
      setTestResult(result.response.text());
    } catch (err) {
      setTestResult('Hata: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Bot & RAG</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gemini AI · Bilgi tabanı · System prompt</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiKey ? 'default' : 'destructive'}>
            {apiKey ? 'API Key OK' : 'API Key Eksik'}
          </Badge>
          <Badge variant="glass">Model: {model || modelName}</Badge>
          <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Aktif' : 'Pasif'}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold-300" /> System Prompt</CardTitle>
                <Button variant="gold" size="sm" onClick={saveSettings} disabled={savingSettings || !settingsId}>
                  {savingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Kaydet
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5"
                  />
                  Bot aktif
                </label>
                <span className="ml-4 text-xs text-muted-foreground">Model:</span>
                <Input value={model} onChange={(e) => setModel(e.target.value)} className="h-8 max-w-[200px] font-mono text-xs" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Hoşgeldin Mesajı</label>
                <Textarea rows={3} value={welcome} onChange={(e) => setWelcome(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">System Prompt</label>
                <Textarea rows={14} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="font-mono text-xs" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Botun kişiliğini, tonunu, kurallarını ve ne zaman danışmana yönlendireceğini tanımlar.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-accent" /> Bilgi Tabanı (RAG)</CardTitle>
                <Button onClick={() => fileRef.current?.click()} variant="gold" size="sm" disabled={uploading}>
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Doküman Yükle
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.md,.txt,.docx"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Yüklenen dokümanlar otomatik olarak parçalara ayrılır, embedding yapılır ve RAG pipeline'ında kullanılır.
                Desteklenen: PDF, MD, TXT, DOCX.
              </p>
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{d.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.source} · {d.chunk_count} parça · {d.created?.split('T')[0] || d.created}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDoc(d.id, d.active)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${d.active ? 'bg-accent' : 'bg-white/[0.1]'}`}
                      title={d.active ? 'Pasif yap' : 'Aktif yap'}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${d.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => removeDoc(d.id)}>
                      <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center text-sm text-muted-foreground">
                    Henüz doküman yüklenmedi
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-accent" /> Test Konsolu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Test mesajı yaz..."
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && testBot()}
                  className="pl-10"
                />
              </div>
              <Button variant="gold" className="w-full" onClick={testBot} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Botu Test Et
              </Button>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs"
                >
                  <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-accent">
                    <Bot className="h-3.5 w-3.5" /> Bot Yanıtı
                  </div>
                  <div className="whitespace-pre-wrap text-foreground/80">{testResult}</div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Omnichannel Durum</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { name: 'Web Chat', status: 'Aktif', color: 'bg-emerald-500' },
                { name: 'WhatsApp Cloud API', status: 'Webhook hazır', color: 'bg-amber-500' },
                { name: 'Facebook Messenger', status: 'Webhook hazır', color: 'bg-amber-500' },
                { name: 'Instagram DM', status: 'Webhook hazır', color: 'bg-amber-500' },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${c.color}`} />
                    {c.name}
                  </div>
                  <span className="text-xs text-muted-foreground">{c.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
