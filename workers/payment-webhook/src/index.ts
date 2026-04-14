import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ASAAS_WEBHOOK_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validar token do Asaas
    const token = request.headers.get('asaas-access-token');
    if (!token || token !== env.ASAAS_WEBHOOK_TOKEN) {
      return new Response('Invalid token', { status: 401 });
    }

    const body = await request.text();
    let event: { event: string; payment: Record<string, unknown> };

    try {
      event = JSON.parse(body);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Processar apenas pagamentos confirmados
    if (event.event !== 'PAYMENT_CONFIRMED' && event.event !== 'PAYMENT_RECEIVED') {
      return new Response('Ignored event', { status: 200 });
    }

    const payment = event.payment;
    const externalReference = payment.externalReference as string;

    if (!externalReference || !externalReference.includes('|')) {
      return new Response('Missing or invalid externalReference', { status: 400 });
    }

    const [userId, productSlug] = externalReference.split('|');

    if (!userId || !productSlug) {
      return new Response('Invalid externalReference format', { status: 400 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Buscar produto para saber o tipo e descobrir includes_products/cohort
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('type, includes_products')
      .eq('slug', productSlug)
      .single();

    if (productError || !product) {
      console.error('Produto não encontrado:', productSlug, productError);
      return new Response('Product not found', { status: 500 });
    }

    // Registrar pagamento
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        asaas_payment_id: payment.id as string,
        product_slug: productSlug,
        amount: Math.round((payment.value as number) * 100),
        status: 'completed',
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
      // Se for duplicata, ignora (idempotência)
      if (paymentError.code === '23505') {
        return new Response('Already processed', { status: 200 });
      }
      return new Response('Payment insert failed', { status: 500 });
    }

    // Se for mentoria, achar turma ativa mais próxima
    let cohortId: string | null = null;
    if (product.type === 'mentoring') {
      const today = new Date().toISOString().split('T')[0];
      const { data: cohort } = await supabase
        .from('cohorts')
        .select('id')
        .eq('product_slug', productSlug)
        .eq('active', true)
        .gte('starts_at', today)
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cohort) {
        cohortId = cohort.id as string;
      } else {
        console.warn(`Nenhuma turma ativa futura para ${productSlug} — aluno ficará sem cohort até ser designado manualmente.`);
      }
    }

    // Liberar acesso ao produto principal (com cohort se aplicável)
    const { error: accessError } = await supabase
      .from('user_access')
      .upsert(
        {
          user_id: userId,
          product_slug: productSlug,
          payment_id: paymentRecord.id,
          cohort_id: cohortId,
        },
        { onConflict: 'user_id,product_slug' }
      );

    if (accessError) {
      console.error('Erro ao liberar acesso principal:', accessError);
      return new Response('Access grant failed', { status: 500 });
    }

    // Liberar acessos incluídos (bundle) — ex: mentoria inclui Máquina de Vídeos
    const includedProducts = (product.includes_products as string[] | null) || [];
    if (includedProducts.length > 0) {
      const bundleRows = includedProducts.map((slug) => ({
        user_id: userId,
        product_slug: slug,
        payment_id: paymentRecord.id,
      }));

      const { error: bundleError } = await supabase
        .from('user_access')
        .upsert(bundleRows, { onConflict: 'user_id,product_slug' });

      if (bundleError) {
        console.error('Erro ao liberar produtos inclusos:', bundleError);
        // Não falha a request — o acesso principal já foi liberado
      }
    }

    return new Response('OK', { status: 200 });
  },
};
