import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');

  const session = await getSession(supabase, cookies);
  if (!session) {
    return redirect('/membros/login/?erro=sessao-expirada');
  }

  const formData = await request.formData();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!password || password.length < 6) {
    return redirect('/membros/redefinir-senha/?erro=senha-curta');
  }

  if (password !== confirmPassword) {
    return redirect('/membros/redefinir-senha/?erro=senhas-diferentes');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Erro ao atualizar senha:', error);
    return redirect('/membros/redefinir-senha/?erro=falha-atualizacao');
  }

  return redirect('/membros/?msg=senha-atualizada');
};
