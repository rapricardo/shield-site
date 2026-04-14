import { supabase } from './supabase';

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  meet_url: string | null;
  recording_youtube_id: string | null;
  category: string;
  visibility: string;
}

export async function getUpcomingEvents(): Promise<EventItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', now)
    .order('starts_at', { ascending: true });
  if (error || !data) return [];
  return data as unknown as EventItem[];
}

export async function getPastEvents(limit = 20): Promise<EventItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('starts_at', now)
    .order('starts_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as EventItem[];
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as EventItem;
}
