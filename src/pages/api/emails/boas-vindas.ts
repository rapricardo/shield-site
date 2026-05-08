import type { APIRoute } from 'astro';
import { sendEmail } from '../../../lib/resend';
import { welcomeEmailHtml } from '../../../lib/email-templates';
import { getSession } from '../../../lib/auth';

export const prerender = false;

// Chamado pelo próprio cadastro após signup — pode ser chamado com session fresh
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, error: 'indisponivel' }), { status: 503 });
  }

  const session = await getSession(supabase, cookies);
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: 'not_authenticated' }), { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile) {
    return new Response(JSON.stringify({ ok: false, error: 'no_profile' }), { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const html = welcomeEmailHtml({
    name: profile.name || 'membro',
    loginUrl: `${origin}/membros/`,
  });

  const result = await sendEmail(locals.env?.RESEND_API_KEY, {
    to: profile.email,
    subject: 'Bem-vindo à área de membros',
    html,
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500 });
};
