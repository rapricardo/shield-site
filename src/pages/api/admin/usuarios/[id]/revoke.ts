import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect, params }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');
  const session = await getSession(supabase, cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(supabase, session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/usuarios/?erro=id-ausente');

  const form = await request.formData();
  const productSlug = form.get('product_slug')?.toString().trim();

  if (!productSlug) {
    return redirect(`/admin/usuarios/${id}/?erro=produto-obrigatorio`);
  }

  const admin = createAdminClient({ SUPABASE_URL: locals.env?.SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY });
  const { error } = await admin
    .from('user_access')
    .delete()
    .eq('user_id', id)
    .eq('product_slug', productSlug);

  if (error) {
    console.error('[admin/usuarios/revoke]', error);
    return redirect(`/admin/usuarios/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/admin/usuarios/${id}/?msg=acesso-revogado`);
};
