import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect, params }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/turmas/?erro=id-ausente');

  const admin = createAdminClient();
  const { error } = await admin.from('cohorts').update({ active: false }).eq('id', id);

  if (error) {
    console.error('[admin/turmas/deletar]', error);
    return redirect(`/admin/turmas/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/turmas/?msg=deletada');
};
