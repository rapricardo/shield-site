import { defineMiddleware } from 'astro:middleware';
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

  // Gate de admin: /admin/* exige role=admin
  if (pathname.startsWith('/admin')) {
    const session = await getSession(context.cookies);
    if (!session) {
      return context.redirect('/membros/login/');
    }

    const profile = await getUserProfile(session.user.id);
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

  const session = await getSession(context.cookies);
  if (!session) {
    return context.redirect('/membros/login/');
  }

  context.locals.session = session;

  // Nova rota: /membros/p/[productSlug] — exige user_access
  const produtoMatch = pathname.match(/^\/membros\/p\/([^\/]+)\/?$/);
  if (produtoMatch) {
    const productSlug = produtoMatch[1];
    const accessList = await getUserAccess(session.user.id);
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
    const check = await isLessonUnlocked(session.user.id, lessonSlug);
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
    const accessList = await getUserAccess(session.user.id);

    if (!hasAccess(accessList, productSlug)) {
      return context.redirect('/membros/?acesso=bloqueado');
    }

    context.locals.accessSlugs = accessList;
  }

  return next();
});
