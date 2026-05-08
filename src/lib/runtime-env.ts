/**
 * Helper centralizado pra acessar variáveis de ambiente.
 *
 * Em Cloudflare Pages, secrets só estão disponíveis em runtime via
 * `Astro.locals.runtime.env`. `import.meta.env` em build não vê secrets.
 *
 * Esta função pega de `locals.runtime.env` em produção e cai pra
 * `import.meta.env` em dev local (que carrega `.env`).
 */
export interface RuntimeEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  ASAAS_API_KEY?: string;
}

export function getRuntimeEnv(locals: App.Locals): RuntimeEnv {
  const runtimeEnv = (locals as { runtime?: { env?: Partial<RuntimeEnv> } })?.runtime?.env;

  return {
    SUPABASE_URL: runtimeEnv?.SUPABASE_URL || import.meta.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: runtimeEnv?.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY:
      runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
    RESEND_API_KEY: runtimeEnv?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || '',
    ASAAS_API_KEY: runtimeEnv?.ASAAS_API_KEY || import.meta.env.ASAAS_API_KEY || '',
  };
}
