import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type { SupabaseClient };

export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

/**
 * Cria um cliente Supabase a partir de env de runtime.
 * Use `getRuntimeEnv(locals)` pra obter o env em endpoints/páginas SSR.
 */
export function createSupabase(env: SupabaseEnv): SupabaseClient {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
