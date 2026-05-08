import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AdminEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Cliente Supabase com service_role key — usado APENAS em endpoints admin
 * server-side. Bypassa RLS. NUNCA expor ao cliente.
 */
export function createAdminClient(env: AdminEnv): SupabaseClient {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
