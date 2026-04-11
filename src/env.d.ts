/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly ASAAS_API_KEY: string;
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
      created_at: string;
    };
    accessSlugs?: string[];
  }
}
