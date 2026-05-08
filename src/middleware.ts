import { defineMiddleware } from 'astro:middleware';
import { getRuntimeEnv } from './lib/runtime-env';
import { createSupabase } from './lib/supabase';
import { getSession, getUserAccess, hasAccess, getUserProfile } from './lib/auth';
import { isLessonUnlocked } from './lib/progress';

const PUBLIC_MEMBER_ROUTES = [
  '/membros/login',
  '/membros/cadastro',
  '/membros/recuperar-senha',
];

// Legado — mantido enquanto houver links antigos apontando para /membros/maquina
const ROUTE_PRODUCT_MAP: Record<string, string> = {
  '/membros/maquina': 'maquina-videos',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Popula env + supabase em locals pra TODA request — endpoints e páginas usam daqui
  const env = getRuntimeEnv(context.locals);
  context.locals.env = env;

  // Cria supabase só se as credenciais existem (rotas estáticas não precisam)
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    context.locals.supabase = createSupabase(env);
  }

  // Helper local pra acessar supabase com erro descritivo
  const requireSupabase = () => {
    if (!context.locals.supabase) {
      throw new Error('Supabase indisponível: SUPABASE_URL ou SUPABASE_ANON_KEY ausentes');
    }
    return context.locals.supabase;
  };

  // Gate de admin: /admin/* exige role=admin
  if (pathname.startsWith('/admin')) {
    const supabase = requireSupabase();
    const session = await getSession(supabase, context.cookies);
    if (!session) {
      return context.redirect('/membros/login/');
    }

    const profile = await getUserProfile(supabase, session.user.id);
    if (!profile || profile.role !== 'admin') {
      return context.redirect('/membros/?acesso=negado');
    }

    context.locals.session = session;
    context.locals.profile = profile;
    return next();
  }

  if (!pathname.startsWith('/membros')) {
    return next();
  }

  const isPublicMemberRoute = PUBLIC_MEMBER_ROUTES.some(
    (route) => pathname === route || pathname === route + '/'
  );
  if (isPublicMemberRoute) {
    return next();
  }

  const supabase = requireSupabase();
  const session = await getSession(supabase, context.cookies);
  if (!session) {
    return context.redirect('/membros/login/');
  }

  context.locals.session = session;

  // Nova rota: /membros/p/[productSlug] — exige user_access
  const produtoMatch = pathname.match(/^\/membros\/p\/([^\/]+)\/?$/);
  if (produtoMatch) {
    const productSlug = produtoMatch[1];
    const accessList = await getUserAccess(supabase, session.user.id);
    if (!hasAccess(accessList, productSlug)) {
      return context.redirect('/membros/?acesso=bloqueado');
    }
    context.locals.accessSlugs = accessList;
    return next();
  }

  // Rotas de aula — bloqueio sequencial + acesso ao produto
  const aulaMatch = pathname.match(/^\/membros\/aulas\/([^\/]+)\/?$/);
  if (aulaMatch) {
    const lessonSlug = aulaMatch[1];
    const check = await isLessonUnlocked(supabase, session.user.id, lessonSlug);
    if (!check.unlocked) {
      if (check.reason === 'missing_access') {
        return context.redirect('/membros/?acesso=bloqueado');
      }
      if (check.reason === 'not_found') {
        return new Response('Lesson not found', { status: 404 });
      }
      if (check.fallbackLessonSlug) {
        return context.redirect(
          `/membros/aulas/${check.fallbackLessonSlug}/?redirected=sequencial`
        );
      }
      return context.redirect('/membros/');
    }
    return next();
  }

  // Legado — rotas /membros/maquina/*
  const requiredProduct = Object.entries(ROUTE_PRODUCT_MAP).find(
    ([prefix]) => pathname.startsWith(prefix)
  );

  if (requiredProduct) {
    const [, productSlug] = requiredProduct;
    const accessList = await getUserAccess(supabase, session.user.id);

    if (!hasAccess(accessList, productSlug)) {
      return context.redirect('/membros/?acesso=bloqueado');
    }

    context.locals.accessSlugs = accessList;
  }

  return next();
});
