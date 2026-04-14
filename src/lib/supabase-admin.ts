import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com service_role key — usado APENAS em endpoints admin
 * server-side. Bypassa RLS. NUNCA expor ao cliente.
 */
export function createAdminClient() {
  return createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
