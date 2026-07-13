import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, Sparkles, Bot, Save, Loader2, X, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Doc {
  id: string;
  title: string;
  source: string;
  chunkCount: number;
  active: boolean;
  created: string;
  filename: string;
}

const DEMO_DOCS: Doc[] = [
  { id: 'd1', title: 'YCA Şirket Broşürü', source: 'YCA_2024.pdf', chunkCount: 24, active: true, created: '2024-12-10', filename: 'brochure.pdf' },
  { id: 'd2', title: 'Sıkça Sorulan Sorular', source: 'sss.md', chunkCount: 18, active: true, created: '2024-12-12', filename: 'faq.md' },
  { id: 'd3', title: 'Temelli Bölge Raporu 2024', source: 'temelli_2024.pdf', chunkCount: 42, active: true, created: '2024-12-14', filename: 'temelli.pdf' },
];

const DEFAULT_PROMPT = `Sen YCA Yatırım'ın yapay zeka danışmanısın. Ankara Temelli ve çevresinde arsa alım-satımı konusunda uzman bir firmayız. Görevin:

1. Müşterilere sıcak, profesyonel ve güven veren bir dille yanıt vermek
2. Müşterinin alıcı mı satıcı mı olduğunu anlamak
3. Bütçe, bölge, m² gibi temel bilgileri toplamak
4. Bölgedeki güncel portföy ve yatırım fırsatları hakkında bilgi vermek
5. Hukuki süreçler için mutlaka canlı danışmana yönlendirmek

Cevaplarında:
- Kısa ve net ol (max 3-4 cümle)
- Samimi ama profesyonel ol
- Mümkün olduğunda somut rakamlar ve veriler kullan
- Yatırım potansiyeli vurgula
- Sonunda mutlaka aksiyon öner (görüşme, yer gösterme, portföy gönderme)

Handoff: Eğer müşteri "danışman", "görüşme", "arayın", "insan" gibi kelimeler kullanırsa veya tapu/hukuki konu konuşuluyorsa, "Sizi hemen bir danışmanımıza yönlendiriyorum" de ve bildirim oluştur.`;

const DEFAULT_WELCOME = `Merhaba 👋 YCA Yatırım'a hoş geldiniz! Ankara Temelli ve çevresinde arsa alım-satımı konusunda 15+ yıllık tecrübemizle hizmetinizdeyiz.

Size nasıl yardımcı olabilirim? Arsa almak mı, satmak mı istiyorsunuz?`;

export default function AdminBot() {
  const [docs, setDocs] = useState<Doc[]>(DEMO_DOCS);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [welcome, setWelcome] = useState(DEFAULT_WELCOME);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      // Demo: skip actual embedding
      await new Promise((r) => setTimeout(r, 600));
      const newDoc: Doc = {
        id: 'd' + Date.now() + Math.random(),
        title: file.name.replace(/\.[^.]+$/, ''),
        source: file.name,
        chunkCount: Math.floor(Math.random() * 40) + 10,
        active: true,
        created: new Date().toISOString().split('T')[0],
        filename: file.name,
      };
      setDocs((d) => [newDoc, ...d]);
      toast.success(`${file.name} embedding yapıldı (${newDoc.chunkCount} parça)`);
    }
    setUploading(false);
  };

  const removeDoc = (id: string) => {
    if (!confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;
    setDocs((d) => d.filter((x) => x.id !== id));
  };

  const toggleDoc = (id: string) => {
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  };

  const saveSettings = () => {
    toast.success('Bot ayarları kaydedildi');
  };

  const testBot = async () => {
    if (!testMsg.trim()) return;
    if (!apiKey) {
      setTestResult('⚠️ Gemini API anahtarı tanımlı değil. .env dosyasına VITE_GEMINI_API_KEY ekleyin.\n\nDemo cevap: Merhaba! Bütçenizi öğrenebilir miyim? Size uygun arsalar önerebilirim.');
      return;
    }
    setTesting(true);
    try {
      const genai = new GoogleGenerativeAI(apiKey);
      const model = genai.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
      const result = await model.generateContent(testMsg);
      setTestResult(result.response.text());
    } catch (err) {
      setTestResult('Hata: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

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
          <Badge variant="glass">Model: {modelName}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold-300" /> System Prompt</CardTitle>
                <Button variant="gold" size="sm" onClick={saveSettings}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {d.source} · {d.chunkCount} parça · {d.created}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDoc(d.id)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${d.active ? 'bg-accent' : 'bg-white/[0.1]'}`}
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
