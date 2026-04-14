import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../../../../lib/auth';
import { createAdminClient } from '../../../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, params }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/membros/login/');
  const profile = await getUserProfile(session.user.id);
  if (profile?.role !== 'admin') return redirect('/membros/?acesso=negado');

  const { id } = params;
  if (!id) return redirect('/admin/turmas/?erro=id-ausente');

  const form = await request.formData();
  const productSlug = form.get('product_slug')?.toString().trim();
  const name = form.get('name')?.toString().trim();
  const startsAt = form.get('starts_at')?.toString();
  const endsAt = form.get('ends_at')?.toString();
  const maxStudentsRaw = form.get('max_students')?.toString();
  const meetUrl = form.get('meet_url')?.toString();
  const notes = form.get('notes')?.toString();
  const active = form.get('active') === 'on';

  if (!productSlug || !name || !startsAt || !endsAt) {
    return redirect(`/admin/turmas/${id}/?erro=campos-obrigatorios`);
  }

  const maxStudents = maxStudentsRaw ? parseInt(maxStudentsRaw, 10) : 20;

  const admin = createAdminClient();
  const { error } = await admin
    .from('cohorts')
    .update({
      product_slug: productSlug,
      name,
      starts_at: startsAt,
      ends_at: endsAt,
      max_students: Number.isNaN(maxStudents) ? 20 : maxStudents,
      meet_url: meetUrl || null,
      notes: notes || null,
      active,
    })
    .eq('id', id);

  if (error) {
    console.error('[admin/turmas/atualizar]', error);
    return redirect(`/admin/turmas/${id}/?erro=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/admin/turmas/${id}/?msg=salvo`);
};
