import { supabase } from './supabase';

export interface Lesson {
  id: string;
  product_slug: string;
  slug: string;
  title: string;
  description: string | null;
  type: 'video' | 'download' | 'text' | 'live_replay';
  content_ref: string | null;
  summary_md: string | null;
  order_index: number;
  category: string;
  is_free: boolean;
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Lesson;
}

export async function getNextLesson(
  productSlug: string,
  currentOrder: number
): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('product_slug', productSlug)
    .gt('order_index', currentOrder)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Lesson;
}
