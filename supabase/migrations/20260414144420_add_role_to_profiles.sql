-- Role do usuário para controle de admin
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Valores permitidos: 'user' | 'admin'

-- Policy: apenas service_role ou o próprio usuário leem seu role
-- (não precisa nova policy, a existente "Usuário lê próprio perfil" já cobre)
