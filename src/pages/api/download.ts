import type { APIRoute } from 'astro';
import { createAdminClient } from '../../lib/supabase-admin';
import { getSession, getUserAccess, hasAccess } from '../../lib/auth';

export const prerender = false;

const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hora

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');

  const session = await getSession(supabase, cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const formData = await request.formData();
  const productSlug = formData.get('productSlug')?.toString();

  if (!productSlug) {
    return redirect('/membros/?erro=produto-invalido');
  }

  // Verificar se o usuário tem acesso ao produto
  const accessList = await getUserAccess(supabase, session.user.id);
  if (!hasAccess(accessList, productSlug)) {
    return redirect('/membros/?acesso=bloqueado');
  }

  // Cliente com service_role pra gerar signed URL protegida
  const supabaseAdmin = createAdminClient({
    SUPABASE_URL: locals.env?.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY,
  });

  // Buscar download_path do produto
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('download_path, name')
    .eq('slug', productSlug)
    .eq('active', true)
    .single();

  if (productError || !product?.download_path) {
    return redirect('/membros/?erro=produto-nao-encontrado');
  }

  // Gerar signed URL
  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from('produtos')
    .createSignedUrl(product.download_path, SIGNED_URL_EXPIRES_IN, {
      download: product.download_path.split('/').pop() || true,
    });

  if (signedError || !signed?.signedUrl) {
    console.error('Erro ao gerar signed URL:', signedError);
    return redirect('/membros/?erro=download-falhou');
  }

  return redirect(signed.signedUrl);
};
