import { supabase } from './supabase';

export interface EnrolledCohort {
  cohort_id: string;
  name: string;
  product_slug: string;
  product_name: string;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  notes: string | null;
}

// Retorna todas as turmas em que o usuário está matriculado (pode ser mais de uma no futuro)
export async function getEnrolledCohorts(userId: string): Promise<EnrolledCohort[]> {
  const { data, error } = await supabase
    .from('user_access')
    .select(`
      cohort_id,
      product_slug,
      cohorts (
        id,
        name,
        starts_at,
        ends_at,
        meet_url,
        notes,
        active
      ),
      products (
        name
      )
    `)
    .eq('user_id', userId)
    .not('cohort_id', 'is', null);

  if (error || !data) return [];

  const result: EnrolledCohort[] = [];
  for (const row of data as any[]) {
    const cohort = Array.isArray(row.cohorts) ? row.cohorts[0] : row.cohorts;
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (cohort && cohort.active) {
      result.push({
        cohort_id: row.cohort_id,
        name: cohort.name,
        product_slug: row.product_slug,
        product_name: product?.name || row.product_slug,
        starts_at: cohort.starts_at,
        ends_at: cohort.ends_at,
        meet_url: cohort.meet_url,
        notes: cohort.notes,
      });
    }
  }

  return result;
}
