-- Seed de usuários de teste para ambiente LOCAL
-- NÃO rodar em produção
-- Senhas: Tocha2026!

-- Limpa qualquer execução anterior dos mesmos emails
DELETE FROM auth.users WHERE email IN ('admin@tocha.dev','aluno@tocha.dev');

-- 1) Admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, recovery_sent_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tocha.dev',
  crypt('Tocha2026!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Tocha","whatsapp":"11999999999"}',
  now(), now(), '', '', '', ''
);

-- 2) Aluno teste
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, recovery_sent_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'aluno@tocha.dev',
  crypt('Tocha2026!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Aluno Teste","whatsapp":"11988887777"}',
  now(), now(), '', '', '', ''
);

-- 3) Promove admin para role admin (trigger handle_new_user já criou os profiles)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@tocha.dev';

-- 4) Dá acesso ao produto principal para o aluno
INSERT INTO public.user_access (user_id, product_slug)
SELECT id, 'maquina-videos'
FROM public.profiles
WHERE email = 'aluno@tocha.dev'
ON CONFLICT (user_id, product_slug) DO NOTHING;

-- 5) Confirma resultado
SELECT p.email, p.name, p.role,
       array_agg(ua.product_slug) FILTER (WHERE ua.product_slug IS NOT NULL) AS acessos
FROM public.profiles p
LEFT JOIN public.user_access ua ON ua.user_id = p.id
WHERE p.email IN ('admin@tocha.dev','aluno@tocha.dev')
GROUP BY p.email, p.name, p.role
ORDER BY p.email;
