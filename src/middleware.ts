import { defineMiddleware } from 'astro:middleware';
import { getSession, getUserAccess, hasAccess, getUserProfile } from './lib/auth';

const PUBLIC_MEMBER_ROUTES = [
  '/membros/login',
  '/membros/cadastro',
  '/membros/recuperar-senha',
];

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

  // Verificar se a rota requer acesso a um produto
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
