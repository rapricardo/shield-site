import type { APIRoute } from 'astro';
import { sendEmail } from '../../../lib/resend';
import { newRecordingHtml } from '../../../lib/email-templates';
import { getSession, getUserProfile } from '../../../lib/auth';
import { createAdminClient } from '../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const formData = await request.formData();
  const eventId = formData.get('eventId')?.toString();
  if (!eventId) return redirect('/admin/lives/?erro=evento-invalido');

  const admin = createAdminClient();

  const { data: event } = await admin
    .from('events')
    .select('slug, title, recording_youtube_id')
    .eq('id', eventId)
    .maybeSingle();

  if (!event || !event.recording_youtube_id) {
    return redirect(`/admin/lives/${eventId}?erro=sem-gravacao`);
  }

  // Busca todos os membros
  const { data: members } = await admin
    .from('profiles')
    .select('email, name')
    .order('created_at', { ascending: true });

  if (!members) {
    return redirect(`/admin/lives/${eventId}?erro=sem-membros`);
  }

  const origin = new URL(request.url).origin;
  const recordingUrl = `${origin}/membros/lives/${event.slug}/`;

  // Dispara envios em paralelo — não trava em falhas individuais
  await Promise.allSettled(
    members.map((m) =>
      sendEmail({
        to: m.email,
        subject: `Nova gravação: ${event.title}`,
        html: newRecordingHtml({
          eventTitle: event.title,
          recordingUrl,
          memberName: m.name || 'membro',
        }),
      })
    )
  );

  return redirect(`/admin/lives/${eventId}?msg=emails-enviados`);
};
