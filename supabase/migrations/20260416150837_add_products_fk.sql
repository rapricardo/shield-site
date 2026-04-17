-- Adiciona FK product_slug -> products.slug em user_access e payments
-- Necessário para PostgREST conseguir resolver joins implícitos como products(name)
-- Exposto via API REST: GET user_access?select=product_slug,products(name)

-- 1) Garante UNIQUE em products.slug (já existe via UNIQUE constraint, mas confirma)
-- (skip — products.slug já é UNIQUE NOT NULL pela migration original)

-- 2) FK em user_access.product_slug
ALTER TABLE public.user_access
  ADD CONSTRAINT user_access_product_slug_fkey
  FOREIGN KEY (product_slug)
  REFERENCES public.products(slug)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 3) FK em payments.product_slug
ALTER TABLE public.payments
  ADD CONSTRAINT payments_product_slug_fkey
  FOREIGN KEY (product_slug)
  REFERENCES public.products(slug)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 4) Notifica PostgREST a recarregar o schema cache
NOTIFY pgrst, 'reload schema';
