import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/recuperar-senha/?erro=indisponivel');

  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  if (!email) {
    return redirect('/membros/recuperar-senha/?erro=email-obrigatorio');
  }

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/membros/login/`,
  });

  return redirect('/membros/recuperar-senha/?msg=email-enviado');
};
