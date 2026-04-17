import { supabase } from './supabase';

export interface ProductProgress {
  productSlug: string;
  productName: string;
  total: number;
  completed: number;
  percent: number; // 0-100, inteiro
}

export interface NextLesson {
  slug: string;
  title: string;
  orderIndex: number;
}

export type UnlockReason =
  | 'completed'
  | 'first'
  | 'sequential'
  | 'blocked'
  | 'missing_access'
  | 'not_found';

export interface UnlockCheck {
  unlocked: boolean;
  reason: UnlockReason;
  fallbackLessonSlug?: string;
}

/**
 * Retorna progresso do aluno em cada produto que ele tem acesso.
 */
export async function getProductProgressList(userId: string): Promise<ProductProgress[]> {
  const { data: access } = await supabase
    .from('user_access')
    .select('product_slug, products(name)')
    .eq('user_id', userId);

  const productSlugs = (access || []).map((a: any) => a.product_slug as string);
  if (productSlugs.length === 0) return [];

  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug, product_slug, title, order_index')
    .in('product_slug', productSlugs)
    .order('order_index', { ascending: true });

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId);

  const completedSet = new Set((progress || []).map((p) => p.lesson_slug));

  const byProduct = new Map<string, { name: string; total: number; completed: number }>();
  for (const a of (access || []) as any[]) {
    byProduct.set(a.product_slug, {
      name: a.products?.name || a.product_slug,
      total: 0,
      completed: 0,
    });
  }
  for (const l of lessons || []) {
    const p = byProduct.get(l.product_slug as string);
    if (!p) continue;
    p.total += 1;
    if (completedSet.has(l.slug)) p.completed += 1;
  }

  return Array.from(byProduct.entries()).map(([slug, v]) => ({
    productSlug: slug,
    productName: v.name,
    total: v.total,
    completed: v.completed,
    percent: v.total === 0 ? 0 : Math.round((v.completed / v.total) * 100),
  }));
}

/**
 * Próxima aula não concluída de um produto (menor order_index sem lesson_progress).
 * Retorna null se todas já foram concluídas ou não há aulas.
 */
export async function getNextLesson(
  userId: string,
  productSlug: string
): Promise<NextLesson | null> {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug, title, order_index')
    .eq('product_slug', productSlug)
    .order('order_index', { ascending: true });

  if (!lessons || lessons.length === 0) return null;

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId);

  const completedSet = new Set((progress || []).map((p) => p.lesson_slug));

  for (const l of lessons) {
    if (!completedSet.has(l.slug)) {
      return { slug: l.slug, title: l.title, orderIndex: l.order_index };
    }
  }
  return null;
}

/**
 * Heurística do produto "mais recente" do aluno.
 *   1) Produto cuja última aula concluída é a mais recente
 *   2) Senão, produto com user_access.granted_at mais recente
 *   3) Senão, null
 */
export async function getMostRecentProduct(userId: string): Promise<string | null> {
  const { data: lastProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastProgress) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('product_slug')
      .eq('slug', lastProgress.lesson_slug)
      .maybeSingle();
    if (lesson?.product_slug) return lesson.product_slug as string;
  }

  const { data: lastAccess } = await supabase
    .from('user_access')
    .select('product_slug')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (lastAccess?.product_slug as string) || null;
}

/**
 * Verifica se uma aula está desbloqueada para o aluno.
 *
 * Regra:
 *  - Aulas com is_free=true dispensam user_access
 *  - Se aluno já concluiu a aula (lesson_progress existe), segue desbloqueada (retroativo)
 *  - Primeira aula do produto (menor order_index) é desbloqueada se tem acesso
 *  - Demais aulas exigem lesson_progress da aula imediatamente anterior (maior order_index < atual)
 */
export async function isLessonUnlocked(
  userId: string,
  lessonSlug: string
): Promise<UnlockCheck> {
  const { data: lesson } = await supabase
    .from('lessons')
    .select('slug, product_slug, order_index, is_free')
    .eq('slug', lessonSlug)
    .maybeSingle();

  if (!lesson) return { unlocked: false, reason: 'not_found' };

  // Acesso ao produto (pulado se a aula for gratuita)
  if (!lesson.is_free && lesson.product_slug) {
    const { data: access } = await supabase
      .from('user_access')
      .select('product_slug')
      .eq('user_id', userId)
      .eq('product_slug', lesson.product_slug)
      .maybeSingle();
    if (!access) return { unlocked: false, reason: 'missing_access' };
  }

  // Retroativo: se o aluno já concluiu, libera
  const { data: ownProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId)
    .eq('lesson_slug', lessonSlug)
    .maybeSingle();
  if (ownProgress) return { unlocked: true, reason: 'completed' };

  if (!lesson.product_slug) {
    // aula órfã, sem produto — trata como primeira
    return { unlocked: true, reason: 'first' };
  }

  const { data: siblings } = await supabase
    .from('lessons')
    .select('slug, order_index')
    .eq('product_slug', lesson.product_slug)
    .order('order_index', { ascending: true });

  if (!siblings || siblings.length === 0) {
    return { unlocked: false, reason: 'blocked' };
  }

  if (siblings[0].slug === lessonSlug) {
    return { unlocked: true, reason: 'first' };
  }

  const prev = siblings
    .filter((s) => s.order_index < (lesson.order_index as number))
    .sort((a, b) => (b.order_index as number) - (a.order_index as number))[0];

  if (!prev) return { unlocked: true, reason: 'first' };

  const { data: prevProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId)
    .eq('lesson_slug', prev.slug)
    .maybeSingle();

  if (prevProgress) return { unlocked: true, reason: 'sequential' };

  return { unlocked: false, reason: 'blocked', fallbackLessonSlug: prev.slug };
}
