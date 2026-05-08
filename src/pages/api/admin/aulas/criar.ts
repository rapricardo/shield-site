import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../lib/auth';
import { createAdminClient } from '../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');
  const session = await getSession(supabase, cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(supabase, session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const form = await request.formData();
  const productSlug = form.get('product_slug')?.toString().trim();
  const slug = form.get('slug')?.toString().trim();
  const title = form.get('title')?.toString().trim();
  const description = form.get('description')?.toString();
  const type = form.get('type')?.toString().trim();
  const contentRef = form.get('content_ref')?.toString();
  const summaryMd = form.get('summary_md')?.toString();
  const orderIndexRaw = form.get('order_index')?.toString();
  const category = form.get('category')?.toString() || 'geral';
  const isFree = form.get('is_free') === 'on';

  if (!productSlug || !slug || !title || !type) {
    return redirect('/admin/aulas/nova/?erro=campos-obrigatorios');
  }

  const orderIndex = orderIndexRaw ? parseInt(orderIndexRaw, 10) : 0;

  const admin = createAdminClient({ SUPABASE_URL: locals.env?.SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY });
  const { error } = await admin.from('lessons').insert({
    product_slug: productSlug,
    slug,
    title,
    description: description || null,
    type,
    content_ref: contentRef || null,
    summary_md: summaryMd || null,
    order_index: Number.isNaN(orderIndex) ? 0 : orderIndex,
    category,
    is_free: isFree,
  });

  if (error) {
    console.error('[admin/aulas/criar]', error);
    return redirect(`/admin/aulas/nova/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/aulas/?msg=criada');
};
