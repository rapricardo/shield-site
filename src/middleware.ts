import { defineMiddleware } from 'astro:middleware';
import { getSession, getUserProfile, getUserAccess, hasAccess } from './lib/auth';

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
