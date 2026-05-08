import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, locals, redirect, params }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');
  const session = await getSession(supabase, cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(supabase, session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/turmas/?erro=id-ausente');

  const admin = createAdminClient({ SUPABASE_URL: locals.env?.SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY });
  const { error } = await admin.from('cohorts').update({ active: false }).eq('id', id);

  if (error) {
    console.error('[admin/turmas/deletar]', error);
    return redirect(`/admin/turmas/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/turmas/?msg=deletada');
};
