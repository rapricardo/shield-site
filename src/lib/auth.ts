import type { AstroCookies } from 'astro';
import { supabase } from './supabase';

const SESSION_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

export async function getSession(cookies: AstroCookies) {
  const accessToken = cookies.get(SESSION_COOKIE)?.value;
  const refreshToken = cookies.get(REFRESH_COOKIE)?.value;

  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) return null;

  if (data.session.access_token !== accessToken) {
    setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);
  }

  return data.session;
}

export function setSessionCookies(
  cookies: AstroCookies,
  accessToken: string,
  refreshToken: string
) {
  const options = {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  };

  cookies.set(SESSION_COOKIE, accessToken, options);
  cookies.set(REFRESH_COOKIE, refreshToken, options);
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  whatsapp: string | null;
  paid: boolean;
  asaas_customer_id: string | null;
  created_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, whatsapp, paid, asaas_customer_id, created_at')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as unknown as UserProfile;
}

export async function getLessonProgress(userId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_slug, completed_at')
    .eq('user_id', userId);

  if (error) return [];
  return data;
}

export async function markLessonComplete(userId: string, lessonSlug: string) {
  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      { user_id: userId, lesson_slug: lessonSlug, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_slug' }
    );

  return !error;
}

export async function getUserAccess(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_access')
    .select('product_slug')
    .eq('user_id', userId);

  if (error) return [];
  return data.map((r) => r.product_slug);
}

export function hasAccess(accessList: string[], productSlug: string): boolean {
  return accessList.includes(productSlug);
}
