/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly ASAAS_API_KEY: string;
  readonly RESEND_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    session?: import('@supabase/supabase-js').Session;
    profile?: {
      id: string;
      email: string;
      name: string;
      whatsapp: string | null;
      paid: boolean;
      asaas_customer_id?: string | null;
      role: string;
      created_at: string;
    };
    accessSlugs?: string[];
  }
}
