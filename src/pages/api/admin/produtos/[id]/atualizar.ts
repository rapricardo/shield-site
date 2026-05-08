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
  if (!id) return redirect('/admin/produtos/?erro=id-ausente');

  const form = await request.formData();
  const slug = form.get('slug')?.toString().trim();
  const name = form.get('name')?.toString().trim();
  const type = form.get('type')?.toString().trim();
  const category = form.get('category')?.toString().trim();
  const priceCentsRaw = form.get('price_cents')?.toString();
  const maxInstallmentsRaw = form.get('max_installments')?.toString();
  const downloadPath = form.get('download_path')?.toString().trim();
  const shortDescription = form.get('short_description')?.toString();
  const longDescription = form.get('long_description')?.toString();
  const includesRaw = form.get('includes_products')?.toString() ?? '';
  const active = form.get('active') === 'on';

  if (!slug || !name || !type || !category || !priceCentsRaw) {
    return redirect(`/admin/produtos/${id}/?erro=campos-obrigatorios`);
  }

  const priceCents = parseInt(priceCentsRaw, 10);
  if (Number.isNaN(priceCents) || priceCents < 0) {
    return redirect(`/admin/produtos/${id}/?erro=preco-invalido`);
  }

  const maxInstallments = maxInstallmentsRaw ? parseInt(maxInstallmentsRaw, 10) : 1;

  const includesProducts = includesRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const admin = createAdminClient({ SUPABASE_URL: locals.env?.SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY });
  const { error } = await admin
    .from('products')
    .update({
      slug,
      name,
      type,
      category,
      price_cents: priceCents,
      max_installments: Number.isNaN(maxInstallments) ? 1 : maxInstallments,
      download_path: downloadPath || null,
      short_description: shortDescription || null,
      long_description: longDescription || null,
      includes_products: includesProducts,
      active,
    })
    .eq('id', id);

  if (error) {
    console.error('[admin/produtos/atualizar]', error);
    return redirect(`/admin/produtos/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/admin/produtos/${id}/?msg=salvo`);
};
