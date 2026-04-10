import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
  const v1Sig = parts.find((p) => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !v1Sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSig === v1Sig;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await request.text();

    const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.type !== 'checkout.session.completed') {
      return new Response('Ignored event type', { status: 200 });
    }

    const session = event.data.object;
    const customerEmail = session.customer_email || session.customer_details?.email;
    const supabaseUserId = session.metadata?.supabase_user_id;

    if (!customerEmail && !supabaseUserId) {
      return new Response('No customer identifier', { status: 400 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Atualizar paid=true
    let updateQuery = supabase.from('profiles').update({ paid: true });

    if (supabaseUserId) {
      updateQuery = updateQuery.eq('id', supabaseUserId);
    } else {
      updateQuery = updateQuery.eq('email', customerEmail);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error('Erro ao atualizar profile:', updateError);
      return new Response('Update failed', { status: 500 });
    }

    // Registrar pagamento
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: supabaseUserId || null,
      stripe_session_id: session.id,
      amount: session.amount_total || 0,
      status: 'completed',
    });

    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
    }

    return new Response('OK', { status: 200 });
  },
};
