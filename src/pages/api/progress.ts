import type { APIRoute } from 'astro';
import { getSession, markLessonComplete } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Indisponível' }), { status: 503 });
  }

  const session = await getSession(supabase, cookies);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
  }

  const body = await request.json();
  const { lessonSlug } = body;

  if (!lessonSlug || typeof lessonSlug !== 'string') {
    return new Response(JSON.stringify({ error: 'lessonSlug obrigatório' }), { status: 400 });
  }

  const success = await markLessonComplete(supabase, session.user.id, lessonSlug);

  if (!success) {
    return new Response(JSON.stringify({ error: 'Falha ao salvar progresso' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
