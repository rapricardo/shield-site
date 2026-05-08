import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../lib/auth';
import { createAsaasClient, findOrCreateCustomer, createPayment } from '../../lib/asaas';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');

  const session = await getSession(supabase, cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const formData = await request.formData();
  const productSlug = formData.get('productSlug')?.toString() || 'maquina-videos';

  // Buscar produto
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', productSlug)
    .eq('active', true)
    .single();

  if (productError || !product) {
    return redirect('/membros/?erro=produto-nao-encontrado');
  }

  // Buscar perfil para nome
  const profile = await getUserProfile(supabase, session.user.id);
  const customerName = profile?.name || session.user.email || 'Cliente';
  const customerEmail = session.user.email!;

  // Cliente Asaas a partir do env de runtime
  const asaas = createAsaasClient(locals.env?.ASAAS_API_KEY);

  // Criar ou buscar customer no Asaas
  let customerId = profile?.asaas_customer_id;

  if (!customerId) {
    customerId = await findOrCreateCustomer(asaas, customerEmail, customerName);

    // Salvar asaas_customer_id no profile
    await supabase
      .from('profiles')
      .update({ asaas_customer_id: customerId })
      .eq('id', session.user.id);
  }

  const origin = new URL(request.url).origin;
  const externalReference = `${session.user.id}|${productSlug}`;

  const valueInReais = product.price_cents / 100;
  const installmentValue =
    product.max_installments > 1
      ? Math.round((valueInReais / product.max_installments) * 100) / 100
      : undefined;

  const invoiceUrl = await createPayment(asaas, {
    customerId,
    value: valueInReais,
    description: product.name,
    externalReference,
    installmentCount: product.max_installments > 1 ? product.max_installments : undefined,
    installmentValue,
    successUrl: `${origin}/membros/?compra=sucesso`,
  });

  return redirect(invoiceUrl);
};
