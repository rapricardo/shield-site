import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { setSessionCookies } from '../../../lib/auth';
import { sendEmail } from '../../../lib/resend';
import { welcomeEmailHtml } from '../../../lib/email-templates';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const whatsapp = formData.get('whatsapp')?.toString();
  const password = formData.get('password')?.toString();

  if (!name || !email || !password) {
    return redirect('/membros/cadastro/?erro=campos-obrigatorios');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, whatsapp: whatsapp || '' },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return redirect('/membros/cadastro/?erro=email-existente');
    }
    return redirect('/membros/cadastro/?erro=falha-cadastro');
  }

  if (data.session) {
    setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);

    // Envia email de boas-vindas (não bloqueia cadastro se falhar)
    try {
      const origin = new URL(request.url).origin;
      const html = welcomeEmailHtml({ name, loginUrl: `${origin}/membros/` });
      await sendEmail({
        to: email,
        subject: 'Bem-vindo à área de membros',
        html,
      });
    } catch (err) {
      console.error('Erro ao enviar email de boas-vindas:', err);
    }

    return redirect('/membros/');
  }

  return redirect('/membros/login/?msg=confirme-email');
};
