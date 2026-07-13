export type Channel = 'web' | 'whatsapp' | 'facebook' | 'instagram';

export type ContactType = 'buyer' | 'seller' | 'invest';

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
  { id: 'visit_scheduled', label: 'Yer Görüşmesi', color: 'bg-violet-500' },
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

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  currency: 'TRY' | 'USD';
  area_m2: number;
  imar_status?: string;
  tapu_status?: string;
  region: string;
  city: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
  features?: Record<string, string>;
  status: 'available' | 'reserved' | 'sold';
  published: boolean;
  featured?: boolean;
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
  interested_listing?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_region?: string;
  preferred_area_min?: number;
  preferred_area_max?: number;
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
  type: 'text' | 'photo' | 'listing' | 'location' | 'document';
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  contact: string;
  type: 'message' | 'status_change' | 'note' | 'photo_sent' | 'listing_shared' | 'created';
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

export interface BotSettings {
  id: string;
  system_prompt: string;
  handoff_keywords: string[];
  welcome_message: string;
  updated: string;
}
