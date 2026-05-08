import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../lib/auth';
import { createAdminClient } from '../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const supabase = locals.supabase;
  if (!supabase) return redirect('/membros/login/?erro=indisponivel');
  const session = await getSession(supabase, cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(supabase, session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const form = await request.formData();
  const slug = form.get('slug')?.toString().trim();
  const title = form.get('title')?.toString().trim();
  const description = form.get('description')?.toString();
  const startsAtRaw = form.get('starts_at')?.toString().trim();
  const durationRaw = form.get('duration_minutes')?.toString();
  const meetUrl = form.get('meet_url')?.toString().trim();
  const recordingYoutubeId = form.get('recording_youtube_id')?.toString().trim();
  const category = form.get('category')?.toString() || 'geral';
  const visibility = form.get('visibility')?.toString() || 'members';

  if (!slug || !title || !startsAtRaw) {
    return redirect('/admin/lives/nova/?erro=campos-obrigatorios');
  }

  const startsAtIso = new Date(startsAtRaw).toISOString();
  if (Number.isNaN(new Date(startsAtRaw).getTime())) {
    return redirect('/admin/lives/nova/?erro=data-invalida');
  }

  const duration = durationRaw ? parseInt(durationRaw, 10) : 60;

  const admin = createAdminClient({ SUPABASE_URL: locals.env?.SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY: locals.env?.SUPABASE_SERVICE_ROLE_KEY });
  const { error } = await admin.from('events').insert({
    slug,
    title,
    description: description || null,
    starts_at: startsAtIso,
    duration_minutes: Number.isNaN(duration) ? 60 : duration,
    meet_url: meetUrl || null,
    recording_youtube_id: recordingYoutubeId || null,
    category,
    visibility,
  });

  if (error) {
    console.error('[admin/lives/criar]', error);
    return redirect(`/admin/lives/nova/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/lives/?msg=criada');
};
