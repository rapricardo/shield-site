import type { APIRoute } from 'astro';
import { setSessionCookies } from '../../lib/auth';

export const prerender = false;

const REDIRECT_BY_TYPE: Record<string, string> = {
  signup: '/membros/',
  invite: '/membros/',
  magiclink: '/membros/',
  email_change: '/membros/',
  recovery: '/membros/redefinir-senha/',
};

export const GET: APIRoute = async ({ url, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (!tokenHash || !type) {
    return redirect('/membros/login/?erro=link-invalido');
  }

  // Tipagem: Supabase aceita esses types em verifyOtp
  const validTypes = ['signup', 'invite', 'magiclink', 'email_change', 'recovery'] as const;
  if (!validTypes.includes(type as typeof validTypes[number])) {
    return redirect('/membros/login/?erro=tipo-invalido');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as typeof validTypes[number],
  });

  if (error || !data.session) {
    console.error('Erro ao verificar OTP:', error);
    return redirect('/membros/login/?erro=link-expirado');
  }

  setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);

  const destination = REDIRECT_BY_TYPE[type] || '/membros/';
  return redirect(destination);
};
