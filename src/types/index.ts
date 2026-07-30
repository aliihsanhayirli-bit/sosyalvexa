export type Channel = 'web' | 'whatsapp' | 'facebook' | 'instagram';

export type ContactType = 'buyer' | 'seller' | 'invest' | 'other';

export type ContactStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'visit_scheduled'
  | 'offer'
  | 'won'
  | 'lost';

export const CONTACT_STATUSES: { id: ContactStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Yeni', color: 'bg-slate-500' },
  { id: 'contacted', label: 'İletişimde', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Nitelikli', color: 'bg-cyan-500' },
  { id: 'visit_scheduled', label: 'Toplantı Planlandı', color: 'bg-violet-500' },
  { id: 'offer', label: 'Teklif', color: 'bg-amber-500' },
  { id: 'won', label: 'Kazanıldı', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Kaybedildi', color: 'bg-rose-500' },
];

export const CHANNELS: { id: Channel; label: string; color: string }[] = [
  { id: 'web', label: 'Web Chat', color: 'bg-cyan-500' },
  { id: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-500' },
  { id: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { id: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
];

export interface ServiceRecord {
  id: string;
  slug: string;
  title: string;
  short: string;
  desc: string;
  icon: string;
  bullets: string[];
  price_from?: string;
  duration?: string;
  order: number;
  published: boolean;
  created: string;
  updated: string;
}

export interface PackageRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  setup: string;
  monthly: string;
  features: { label: string; included: boolean }[];
  highlight: boolean;
  cta: string;
  order: number;
  published: boolean;
  created: string;
  updated: string;
}

export interface ReferenceRecord {
  id: string;
  title: string;
  url: string;
  description: string;
  tag: string;
  year: string;
  industry: string;
  logo?: string;
  order: number;
  published: boolean;
  created: string;
  updated: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: ContactType;
  status: ContactStatus;
  source: Channel;
  assigned_to?: string;
  tags?: string[];
  notes?: string;
  interested_service?: string;
  budget_min?: number;
  budget_max?: number;
  external_id?: string;
  created: string;
  updated: string;
}

export interface Conversation {
  id: string;
  contact: string;
  channel: Channel;
  started_at: string;
  last_message_at: string;
  bot_active: boolean;
  assigned_agent?: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: 'bot' | 'customer' | 'agent' | 'system';
  content: string;
  type: 'text' | 'photo' | 'service' | 'location' | 'document';
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  contact: string;
  type: 'message' | 'status_change' | 'note' | 'photo_sent' | 'service_shared' | 'created';
  title?: string;
  description?: string;
  ref_id?: string;
  meta?: Record<string, unknown>;
  actor?: string;
  timestamp: string;
}

export interface BotDocument {
  id: string;
  title: string;
  filename: string;
  chunks: { text: string; embedding: number[] }[];
  created: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'done';

export interface Appointment {
  id: string;
  contact: string;
  conversation?: string;
  name: string;
  phone?: string;
  service?: string;
  date: string;
  duration_min?: number;
  channel: Channel;
  status: AppointmentStatus;
  notes?: string;
  source: 'bot' | 'admin';
  created: string;
}

export const APPOINTMENT_STATUSES: { id: AppointmentStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Bekliyor', color: 'bg-amber-400' },
  { id: 'confirmed', label: 'Onaylandı', color: 'bg-emerald-400' },
  { id: 'cancelled', label: 'İptal', color: 'bg-zinc-500' },
  { id: 'done', label: 'Tamamlandı', color: 'bg-blue-400' },
];

export interface BotSettings {
  id: string;
  system_prompt: string;
  handoff_keywords: string[];
  welcome_message: string;
  updated: string;
}
