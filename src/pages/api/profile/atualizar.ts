import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');

  const session = await getSession(supabase, cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim();
  const whatsapp = formData.get('whatsapp')?.toString().trim() || null;

  if (!name || name.length < 2) {
    return redirect('/membros/minha-conta/?erro=nome-invalido');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name, whatsapp })
    .eq('id', session.user.id);

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    return redirect('/membros/minha-conta/?erro=falha-atualizacao');
  }

  return redirect('/membros/minha-conta/?msg=salvo');
};
