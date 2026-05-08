import type { APIRoute } from 'astro';
import { setSessionCookies } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=falha-login');

  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return redirect('/membros/login/?erro=campos-obrigatorios');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return redirect('/membros/login/?erro=credenciais-invalidas');
  }

  setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);
  return redirect('/membros/');
};
