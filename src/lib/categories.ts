import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lesson } from './lessons';

export interface CategoryGroup {
  category: string; // 'empreendedor' | 'empregado' | 'geral'
  label: string;
  description: string;
  lessons: Lesson[];
}

const CATEGORY_META: Record<string, { label: string; description: string; order: number }> = {
  geral: { label: 'Fundamentos', description: 'Bases pra todos os perfis', order: 0 },
  empreendedor: { label: 'Empreendedor', description: 'Crie negócios com IA', order: 1 },
  empregado: { label: 'Empregado', description: 'Automatize seu trabalho', order: 2 },
};

export async function getLessonsByCategory(supabase: SupabaseClient): Promise<CategoryGroup[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !data) return [];

  const byCategory: Record<string, Lesson[]> = {};
  for (const lesson of data as unknown as Lesson[]) {
    const cat = lesson.category || 'geral';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(lesson);
  }

  const groups: CategoryGroup[] = [];
  for (const [cat, lessons] of Object.entries(byCategory)) {
    const meta = CATEGORY_META[cat] || { label: cat, description: '', order: 99 };
    groups.push({
      category: cat,
      label: meta.label,
      description: meta.description,
      lessons,
    });
  }

  groups.sort((a, b) => {
    const orderA = CATEGORY_META[a.category]?.order ?? 99;
    const orderB = CATEGORY_META[b.category]?.order ?? 99;
    return orderA - orderB;
  });

  return groups;
}
