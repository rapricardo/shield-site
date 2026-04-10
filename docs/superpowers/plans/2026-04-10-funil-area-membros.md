# Funil de Vídeos + Área de Membros — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar funil de educação (4 landing pages + 3 páginas de vídeo + oferta) e área de membros com auth/pagamento ao tocha-site existente.

**Architecture:** Monolito Astro com hybrid rendering — páginas públicas pré-renderizadas (estáticas), área de membros com SSR via Cloudflare adapter. Supabase para auth + banco. Stripe Checkout hosted para pagamento. Webhook via Cloudflare Worker.

**Tech Stack:** Astro 5, React 19, Tailwind 4, Supabase (Auth + PostgreSQL), Stripe, Cloudflare Pages/Workers

**Spec:** `docs/superpowers/specs/2026-04-10-funil-area-membros-design.md`

---

## Estrutura de Arquivos (visão geral das adições)

```
src/
├── middleware.ts                          ← CRIAR: proteção de rotas /membros/
├── lib/
│   ├── supabase.ts                       ← CRIAR: cliente Supabase server-side
│   └── auth.ts                           ← CRIAR: helpers de sessão
├── pages/
│   ├── video-ia/
│   │   ├── index.astro                   ← EXISTENTE (manter)
│   │   ├── criadores.astro               ← CRIAR: landing persona
│   │   ├── agencias.astro                ← CRIAR: landing persona
│   │   ├── freelancers.astro             ← CRIAR: landing persona
│   │   ├── social-media.astro            ← CRIAR: landing persona
│   │   ├── cadastro.astro                ← CRIAR: pré-cadastro funil
│   │   ├── oportunidade.astro            ← CRIAR: módulo 1 público
│   │   ├── demonstracao.astro            ← CRIAR: módulo 2 público
│   │   ├── como-vender.astro             ← CRIAR: módulo 3 público
│   │   └── oferta.astro                  ← CRIAR: página de oferta
│   ├── membros/
│   │   ├── index.astro                   ← CRIAR: dashboard (SSR)
│   │   ├── login.astro                   ← CRIAR: login (SSR)
│   │   ├── cadastro.astro                ← CRIAR: cadastro (SSR)
│   │   ├── recuperar-senha.astro         ← CRIAR: reset senha (SSR)
│   │   ├── aulas/
│   │   │   ├── oportunidade.astro        ← CRIAR: módulo 1 logado
│   │   │   ├── demonstracao.astro        ← CRIAR: módulo 2 logado
│   │   │   └── como-vender.astro         ← CRIAR: módulo 3 logado
│   │   └── maquina/
│   │       ├── introducao.astro          ← CRIAR: módulo 5 pago
│   │       ├── skills.astro              ← CRIAR: skills pago
│   │       ├── workflow.astro            ← CRIAR: workflow pago
│   │       └── download.astro            ← CRIAR: download pago
│   └── api/
│       ├── auth/
│       │   ├── login.ts                  ← CRIAR: endpoint login
│       │   ├── cadastro.ts               ← CRIAR: endpoint cadastro
│       │   ├── logout.ts                 ← CRIAR: endpoint logout
│       │   └── recuperar-senha.ts        ← CRIAR: endpoint reset
│       ├── checkout.ts                   ← CRIAR: criar Stripe session
│       └── progress.ts                   ← CRIAR: marcar aula completa
├── components/
│   ├── membros/
│   │   ├── LoginForm.tsx                 ← CRIAR: form de login
│   │   ├── CadastroForm.tsx              ← CRIAR: form de cadastro
│   │   ├── RecuperarSenhaForm.tsx        ← CRIAR: form reset senha
│   │   ├── Dashboard.tsx                 ← CRIAR: dashboard com progresso
│   │   ├── VideoPlayer.tsx               ← CRIAR: player com tracking
│   │   └── LessonCard.tsx                ← CRIAR: card de aula
│   └── funil/
│       ├── PersonaHero.astro             ← CRIAR: hero reutilizável
│       ├── PersonaProblema.astro         ← CRIAR: seção problema
│       ├── PersonaSolucao.astro          ← CRIAR: seção solução
│       ├── CapturaForm.tsx               ← CRIAR: form pré-cadastro
│       └── VideoPage.astro               ← CRIAR: layout página de vídeo
```

---

## Task 1: Instalar dependências e configurar hybrid rendering

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `tsconfig.json`

- [ ] **Step 1: Instalar dependências**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npm install @astrojs/cloudflare @supabase/supabase-js stripe
```

Pacotes:
- `@astrojs/cloudflare` — adapter para SSR no Cloudflare Pages
- `@supabase/supabase-js` — cliente Supabase (auth + banco)
- `stripe` — SDK do Stripe para criar checkout sessions server-side

- [ ] **Step 2: Atualizar astro.config.mjs para hybrid rendering**

Arquivo atual:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Substituir por:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Mudanças:
- `output: 'static'` → `output: 'hybrid'` (páginas são estáticas por padrão, SSR é opt-in)
- `adapter: cloudflare()` — necessário para rotas SSR no Cloudflare Pages

- [ ] **Step 3: Adicionar paths ao tsconfig.json**

Arquivo atual:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

Substituir por:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@lib/*": ["src/lib/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

- [ ] **Step 4: Verificar build**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx astro check
npx tsc --noEmit
```

Expected: sem erros. Páginas existentes continuam estáticas por padrão.

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add package.json package-lock.json astro.config.mjs tsconfig.json
git commit -m "feat: configurar hybrid rendering com adapter Cloudflare + Supabase + Stripe"
```

---

## Task 2: Criar cliente Supabase e helpers de auth

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/auth.ts`
- Create: `src/env.d.ts` (se não existir, ou modificar)

**Pré-requisito:** Ter um projeto Supabase criado com as tabelas (ver Task 3). Para desenvolvimento, usar as env vars do projeto Supabase. Adicionar ao `.env`:
```
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJ...sua_anon_key
```

- [ ] **Step 1: Criar src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Criar src/lib/auth.ts**

```typescript
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

  // Atualizar cookies se o token foi renovado
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
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  };

  cookies.set(SESSION_COOKIE, accessToken, options);
  cookies.set(REFRESH_COOKIE, refreshToken, options);
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, whatsapp, paid, created_at')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
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
```

- [ ] **Step 3: Atualizar src/env.d.ts para tipar as env vars**

Verificar se `src/env.d.ts` existe. Se não, criar:

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_PRICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/lib/supabase.ts src/lib/auth.ts src/env.d.ts
git commit -m "feat: criar cliente Supabase e helpers de autenticação"
```

---

## Task 3: Criar tabelas no Supabase

**Files:** Nenhum arquivo local — execução via Supabase dashboard ou CLI.

**Nota:** Esta task é executada no painel do Supabase (SQL Editor) ou via `supabase migration`. Documentada aqui para referência.

- [ ] **Step 1: Criar tabela profiles**

```sql
-- Tabela de perfis (extende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: usuário só lê/atualiza seu próprio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

- [ ] **Step 2: Criar tabela lesson_progress**

```sql
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprio progresso"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere próprio progresso"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 3: Criar tabela payments**

```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- em centavos
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprios pagamentos"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);
```

- [ ] **Step 4: Criar trigger para auto-criar profile no signup**

```sql
-- Quando um usuário se cadastra via Supabase Auth,
-- cria automaticamente um registro em profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 5: Criar policy INSERT para webhook do Stripe (service role)**

```sql
-- O webhook do Stripe usa a service_role key para inserir pagamentos
-- e atualizar profiles.paid. Não precisa de policy adicional porque
-- service_role bypassa RLS. Apenas documentando aqui.

-- Policy para o webhook inserir pagamentos
CREATE POLICY "Service role insere pagamentos"
  ON public.payments FOR INSERT
  WITH CHECK (true);
```

**Nota:** O webhook worker usará a `SUPABASE_SERVICE_ROLE_KEY` que ignora RLS.

---

## Task 4: Criar middleware de autenticação

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Criar src/middleware.ts**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { getSession, getUserProfile } from './lib/auth';

// Rotas de membros que NÃO precisam de auth
const PUBLIC_MEMBER_ROUTES = [
  '/membros/login',
  '/membros/cadastro',
  '/membros/recuperar-senha',
];

// Rotas que exigem pagamento
const PAID_ROUTES_PREFIX = '/membros/maquina';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Ignorar rotas que não são de membros
  if (!pathname.startsWith('/membros')) {
    return next();
  }

  // Rotas públicas de membros (login, cadastro, reset)
  const isPublicMemberRoute = PUBLIC_MEMBER_ROUTES.some(
    (route) => pathname === route || pathname === route + '/'
  );
  if (isPublicMemberRoute) {
    return next();
  }

  // Verificar sessão
  const session = await getSession(context.cookies);
  if (!session) {
    return context.redirect('/membros/login/');
  }

  // Disponibilizar sessão para as páginas
  context.locals.session = session;

  // Rotas pagas: verificar se pagou
  if (pathname.startsWith(PAID_ROUTES_PREFIX)) {
    const profile = await getUserProfile(session.user.id);
    if (!profile?.paid) {
      return context.redirect('/membros/?acesso=bloqueado');
    }
    context.locals.profile = profile;
  }

  return next();
});
```

- [ ] **Step 2: Tipar context.locals**

Adicionar ao `src/env.d.ts`:

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_PRICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    session?: import('@supabase/supabase-js').Session;
    profile?: {
      id: string;
      email: string;
      name: string;
      whatsapp: string | null;
      paid: boolean;
      created_at: string;
    };
  }
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/middleware.ts src/env.d.ts
git commit -m "feat: criar middleware de autenticação para área de membros"
```

---

## Task 5: Criar endpoints de API (auth + checkout + progress)

**Files:**
- Create: `src/pages/api/auth/login.ts`
- Create: `src/pages/api/auth/cadastro.ts`
- Create: `src/pages/api/auth/logout.ts`
- Create: `src/pages/api/auth/recuperar-senha.ts`
- Create: `src/pages/api/checkout.ts`
- Create: `src/pages/api/progress.ts`

Todos os endpoints são SSR (`export const prerender = false`).

- [ ] **Step 1: Criar src/pages/api/auth/login.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';
import { setSessionCookies } from '@lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return redirect('/membros/login/?erro=campos-obrigatorios');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return redirect('/membros/login/?erro=credenciais-invalidas');
  }

  setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);
  return redirect('/membros/');
};
```

- [ ] **Step 2: Criar src/pages/api/auth/cadastro.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';
import { setSessionCookies } from '@lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const whatsapp = formData.get('whatsapp')?.toString();
  const password = formData.get('password')?.toString();

  if (!name || !email || !password) {
    return redirect('/membros/cadastro/?erro=campos-obrigatorios');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, whatsapp: whatsapp || '' },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return redirect('/membros/cadastro/?erro=email-existente');
    }
    return redirect('/membros/cadastro/?erro=falha-cadastro');
  }

  if (data.session) {
    setSessionCookies(cookies, data.session.access_token, data.session.refresh_token);
    return redirect('/membros/');
  }

  // Se email confirmation está ativo no Supabase
  return redirect('/membros/login/?msg=confirme-email');
};
```

- [ ] **Step 3: Criar src/pages/api/auth/logout.ts**

```typescript
import type { APIRoute } from 'astro';
import { clearSessionCookies } from '@lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearSessionCookies(cookies);
  return redirect('/membros/login/');
};
```

- [ ] **Step 4: Criar src/pages/api/auth/recuperar-senha.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  if (!email) {
    return redirect('/membros/recuperar-senha/?erro=email-obrigatorio');
  }

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/membros/login/`,
  });

  // Sempre redireciona com sucesso (não revela se email existe)
  return redirect('/membros/recuperar-senha/?msg=email-enviado');
};
```

- [ ] **Step 5: Criar src/pages/api/checkout.ts**

```typescript
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getSession } from '@lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.user.email,
    line_items: [
      {
        price: import.meta.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${origin}/membros/?compra=sucesso`,
    cancel_url: `${origin}/video-ia/oferta/`,
    metadata: {
      supabase_user_id: session.user.id,
    },
  });

  if (!checkoutSession.url) {
    return redirect('/membros/?erro=checkout');
  }

  return redirect(checkoutSession.url);
};
```

- [ ] **Step 6: Criar src/pages/api/progress.ts**

```typescript
import type { APIRoute } from 'astro';
import { getSession } from '@lib/auth';
import { markLessonComplete } from '@lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSession(cookies);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
  }

  const body = await request.json();
  const { lessonSlug } = body;

  if (!lessonSlug || typeof lessonSlug !== 'string') {
    return new Response(JSON.stringify({ error: 'lessonSlug obrigatório' }), { status: 400 });
  }

  const success = await markLessonComplete(session.user.id, lessonSlug);

  if (!success) {
    return new Response(JSON.stringify({ error: 'Falha ao salvar progresso' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
```

- [ ] **Step 7: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/api/
git commit -m "feat: criar endpoints de auth, checkout Stripe e progresso de aulas"
```

---

## Task 6: Criar componentes da área de membros

**Files:**
- Create: `src/components/membros/LoginForm.tsx`
- Create: `src/components/membros/CadastroForm.tsx`
- Create: `src/components/membros/RecuperarSenhaForm.tsx`
- Create: `src/components/membros/LessonCard.tsx`
- Create: `src/components/membros/Dashboard.tsx`
- Create: `src/components/membros/VideoPlayer.tsx`

**Contexto de design:** Seguir o padrão visual do site — fundo `#0a0a0a`, cards com `bg-[#111]`, bordas `border-gray-800`, acento `yellow-500`, tipografia `font-industrial` para headings, `font-mono` para labels. Sem border-radius (estética industrial). Referência: `ContactForm.tsx` existente.

- [ ] **Step 1: Criar src/components/membros/LoginForm.tsx**

```tsx
import { useState } from 'react';
import { Send, Lock } from 'lucide-react';

interface Props {
  erro?: string | null;
  msg?: string | null;
}

export default function LoginForm({ erro, msg }: Props) {
  const [loading, setLoading] = useState(false);

  const mensagensErro: Record<string, string> = {
    'campos-obrigatorios': 'Preencha email e senha.',
    'credenciais-invalidas': 'Email ou senha incorretos.',
  };

  const mensagensInfo: Record<string, string> = {
    'confirme-email': 'Verifique seu email para confirmar o cadastro.',
  };

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Acessar Área de Membros
        </h1>
        <p className="text-gray-500 text-sm">
          Entre com seu email e senha
        </p>
      </div>

      {erro && (
        <p className="text-red-500 text-sm text-center mb-4">
          {mensagensErro[erro] || 'Erro ao fazer login.'}
        </p>
      )}

      {msg && (
        <p className="text-green-500 text-sm text-center mb-4">
          {mensagensInfo[msg] || msg}
        </p>
      )}

      <form method="POST" action="/api/auth/login" className="space-y-6" onSubmit={() => setLoading(true)}>
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Senha
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : '[ Entrar ]'}
          {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="flex items-center justify-between text-xs text-gray-600 mt-4">
          <a href="/membros/recuperar-senha/" className="hover:text-yellow-500 transition-colors">
            Esqueci minha senha
          </a>
          <a href="/membros/cadastro/" className="hover:text-yellow-500 transition-colors">
            Criar conta
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-2">
          <Lock className="w-3 h-3" />
          <span>Conexão segura</span>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Criar src/components/membros/CadastroForm.tsx**

```tsx
import { useState, useEffect } from 'react';
import { Send, Lock } from 'lucide-react';

declare global {
  interface Window {
    __wlTracking?: Record<string, string>;
    dataLayer?: Record<string, unknown>[];
  }
}

const HIDDEN_FIELDS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
  "fbclid", "fbc", "fbp",
  "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
  "landing_page", "referrer", "user_agent", "first_visit",
  "session_id", "session_attributes_encoded", "originPage", "ref"
] as const;

interface Props {
  erro?: string | null;
}

export default function CadastroForm({ erro }: Props) {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<Record<string, string>>({});

  useEffect(() => {
    setTracking(window.__wlTracking || {});
  }, []);

  const mensagensErro: Record<string, string> = {
    'campos-obrigatorios': 'Preencha todos os campos obrigatórios.',
    'email-existente': 'Este email já está cadastrado. Faça login.',
    'falha-cadastro': 'Erro ao criar conta. Tente novamente.',
  };

  const handleSubmit = () => {
    setLoading(true);

    // dataLayer push para GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submit_lead',
      ...Object.fromEntries(
        HIDDEN_FIELDS.map((f) => [f, tracking[f] || null])
      ),
    });
  };

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Criar Conta
        </h1>
        <p className="text-gray-500 text-sm">
          Acesse conteúdo exclusivo sobre produção de vídeo com IA
        </p>
      </div>

      {erro && (
        <p className="text-red-500 text-sm text-center mb-4">
          {mensagensErro[erro] || 'Erro ao cadastrar.'}
        </p>
      )}

      <form
        method="POST"
        action="/api/auth/cadastro"
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Campos ocultos GTM */}
        {HIDDEN_FIELDS.map((field) => (
          <input
            key={field}
            type="hidden"
            name={field}
            id={`h_${field}`}
            value={tracking[field] || ''}
          />
        ))}

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Nome
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsapp"
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Senha
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta...' : '[ Criar Conta ]'}
          {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="text-center text-xs text-gray-600 mt-4">
          Já tem conta?{' '}
          <a href="/membros/login/" className="text-yellow-500 hover:text-yellow-400 transition-colors">
            Fazer login
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-2">
          <Lock className="w-3 h-3" />
          <span>Seus dados estão protegidos. Sem spam.</span>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Criar src/components/membros/RecuperarSenhaForm.tsx**

```tsx
import { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  erro?: string | null;
  msg?: string | null;
}

export default function RecuperarSenhaForm({ erro, msg }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Recuperar Senha
        </h1>
        <p className="text-gray-500 text-sm">
          Enviaremos um link para redefinir sua senha
        </p>
      </div>

      {erro && (
        <p className="text-red-500 text-sm text-center mb-4">
          Preencha seu email.
        </p>
      )}

      {msg === 'email-enviado' ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-bold font-industrial text-white uppercase mb-4">
            Email enviado.
          </h3>
          <p className="text-gray-400 mb-6">
            Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <a
            href="/membros/login/"
            className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
          >
            Voltar para login
          </a>
        </div>
      ) : (
        <form
          method="POST"
          action="/api/auth/recuperar-senha"
          className="space-y-6"
          onSubmit={() => setLoading(true)}
        >
          <div>
            <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : '[ Enviar Link ]'}
            {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center text-xs text-gray-600 mt-4">
            <a href="/membros/login/" className="hover:text-yellow-500 transition-colors">
              Voltar para login
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Criar src/components/membros/LessonCard.tsx**

```tsx
import { CheckCircle, Lock, Play } from 'lucide-react';

export interface LessonInfo {
  slug: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  locked: boolean;
  paid: boolean;
}

export default function LessonCard({ lesson }: { lesson: LessonInfo }) {
  if (lesson.locked) {
    return (
      <div className="bg-[#111] border border-gray-800 p-6 opacity-50">
        <div className="flex items-start gap-4">
          <Lock className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-white font-bold font-industrial uppercase text-sm">
              {lesson.title}
            </h3>
            <p className="text-gray-600 text-xs mt-1">{lesson.description}</p>
            {lesson.paid && (
              <span className="inline-block text-xs font-mono text-yellow-500/50 mt-2 border border-yellow-500/20 px-2 py-0.5">
                CONTEUDO PAGO
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={lesson.href}
      className="block bg-[#111] border border-gray-800 p-6 hover:border-yellow-500/50 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {lesson.completed ? (
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
        ) : (
          <Play className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
        )}
        <div>
          <h3 className="text-white font-bold font-industrial uppercase text-sm group-hover:text-yellow-500 transition-colors">
            {lesson.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1">{lesson.description}</p>
          {lesson.completed && (
            <span className="inline-block text-xs font-mono text-green-500/70 mt-2">
              CONCLUIDO
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 5: Criar src/components/membros/Dashboard.tsx**

```tsx
import LessonCard from './LessonCard';
import type { LessonInfo } from './LessonCard';

interface Props {
  name: string;
  paid: boolean;
  completedSlugs: string[];
  mensagem?: string | null;
}

const FREE_LESSONS: Omit<LessonInfo, 'completed' | 'locked'>[] = [
  {
    slug: 'oportunidade',
    title: 'Módulo 1 — A Oportunidade',
    description: 'Como IA muda a produção de vídeo e o ROI do negócio',
    href: '/membros/aulas/oportunidade/',
    paid: false,
  },
  {
    slug: 'demonstracao',
    title: 'Módulo 2 — Demonstração',
    description: 'Pipeline completo ao vivo: da ideia à timeline',
    href: '/membros/aulas/demonstracao/',
    paid: false,
  },
  {
    slug: 'como-vender',
    title: 'Módulo 3 — Como Vender',
    description: 'Aquisição de clientes com o Apolo',
    href: '/membros/aulas/como-vender/',
    paid: false,
  },
];

const PAID_LESSONS: Omit<LessonInfo, 'completed' | 'locked'>[] = [
  {
    slug: 'introducao',
    title: 'A Máquina — Introdução',
    description: 'Setup completo do sistema de produção',
    href: '/membros/maquina/introducao/',
    paid: true,
  },
  {
    slug: 'skills',
    title: 'A Máquina — Skills',
    description: 'As 8 skills especializadas do Claude',
    href: '/membros/maquina/skills/',
    paid: true,
  },
  {
    slug: 'workflow',
    title: 'A Máquina — Workflow',
    description: 'Fluxo completo de produção passo a passo',
    href: '/membros/maquina/workflow/',
    paid: true,
  },
  {
    slug: 'download',
    title: 'A Máquina — Download',
    description: 'Download do pacote com 66 arquivos',
    href: '/membros/maquina/download/',
    paid: true,
  },
];

export default function Dashboard({ name, paid, completedSlugs, mensagem }: Props) {
  function buildLessons(
    lessons: Omit<LessonInfo, 'completed' | 'locked'>[],
    requirePayment: boolean
  ): LessonInfo[] {
    return lessons.map((lesson, index) => {
      const completed = completedSlugs.includes(lesson.slug);

      let locked = false;
      if (requirePayment && !paid) {
        locked = true;
      } else if (index > 0) {
        // Liberação sequencial: precisa completar a anterior
        const prevSlug = lessons[index - 1].slug;
        locked = !completedSlugs.includes(prevSlug);
      }

      return { ...lesson, completed, locked };
    });
  }

  const freeLessons = buildLessons(FREE_LESSONS, false);
  const paidLessons = buildLessons(PAID_LESSONS, true);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Saudação */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold font-industrial text-white uppercase mb-2">
          Olá, {name || 'Aluno'}
        </h1>
        <p className="text-gray-500 text-sm font-mono">
          Seu painel de aprendizado
        </p>
      </div>

      {/* Mensagens */}
      {mensagem === 'bloqueado' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm p-4 mb-8">
          Esse conteúdo requer acesso pago. Desbloqueie abaixo.
        </div>
      )}
      {mensagem === 'sucesso' && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-sm p-4 mb-8">
          Compra confirmada! Seu acesso completo está liberado.
        </div>
      )}

      {/* Conteúdo Gratuito */}
      <section className="mb-12">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
          Conteúdo Gratuito
        </h2>
        <div className="space-y-3">
          {freeLessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>

      {/* Conteúdo Pago */}
      <section>
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
          Máquina de Vídeos com IA
        </h2>

        {!paid && (
          <form method="POST" action="/api/checkout" className="mb-6">
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              [ Desbloquear Acesso Completo — 12x R$ 92,98 ]
            </button>
          </form>
        )}

        <div className="space-y-3">
          {paidLessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Criar src/components/membros/VideoPlayer.tsx**

```tsx
import { useState } from 'react';

interface Props {
  videoId: string;
  lessonSlug: string;
  isLoggedIn: boolean;
}

export default function VideoPlayer({ videoId, lessonSlug, isLoggedIn }: Props) {
  const [marked, setMarked] = useState(false);

  const handleMarkComplete = async () => {
    if (!isLoggedIn || marked) return;

    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonSlug }),
    });

    if (res.ok) {
      setMarked(true);

      // GTM event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lesson_complete', lesson_slug: lessonSlug });
    }
  };

  return (
    <div>
      {/* Video embed */}
      <div className="relative w-full aspect-video bg-black border border-gray-800 mb-6">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Botão marcar como concluída */}
      {isLoggedIn && (
        <button
          onClick={handleMarkComplete}
          disabled={marked}
          className={`text-sm font-mono uppercase tracking-wider px-4 py-2 transition-colors ${
            marked
              ? 'text-green-500 border border-green-500/30 bg-green-500/10'
              : 'text-gray-400 border border-gray-700 hover:border-yellow-500 hover:text-yellow-500'
          }`}
        >
          {marked ? 'Aula concluída' : 'Marcar como concluída'}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/components/membros/
git commit -m "feat: criar componentes React da área de membros"
```

---

## Task 7: Criar páginas de auth (login, cadastro, recuperar senha)

**Files:**
- Create: `src/pages/membros/login.astro`
- Create: `src/pages/membros/cadastro.astro`
- Create: `src/pages/membros/recuperar-senha.astro`

Todas com `export const prerender = false` (SSR).

- [ ] **Step 1: Criar src/pages/membros/login.astro**

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import LoginForm from '../../components/membros/LoginForm';

const erro = Astro.url.searchParams.get('erro');
const msg = Astro.url.searchParams.get('msg');
---

<Layout title="Login — Área de Membros" description="Acesse a área de membros da Máquina de Vídeos com IA">
  <section class="min-h-screen flex items-center justify-center py-20 px-6">
    <LoginForm erro={erro} msg={msg} client:load />
  </section>
</Layout>
```

- [ ] **Step 2: Criar src/pages/membros/cadastro.astro**

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import CadastroForm from '../../components/membros/CadastroForm';

const erro = Astro.url.searchParams.get('erro');
---

<Layout title="Criar Conta — Área de Membros" description="Crie sua conta para acessar conteúdo exclusivo sobre produção de vídeo com IA">
  <section class="min-h-screen flex items-center justify-center py-20 px-6">
    <CadastroForm erro={erro} client:load />
  </section>
</Layout>
```

- [ ] **Step 3: Criar src/pages/membros/recuperar-senha.astro**

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import RecuperarSenhaForm from '../../components/membros/RecuperarSenhaForm';

const erro = Astro.url.searchParams.get('erro');
const msg = Astro.url.searchParams.get('msg');
---

<Layout title="Recuperar Senha — Área de Membros" description="Recupere sua senha da área de membros">
  <section class="min-h-screen flex items-center justify-center py-20 px-6">
    <RecuperarSenhaForm erro={erro} msg={msg} client:load />
  </section>
</Layout>
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/membros/login.astro src/pages/membros/cadastro.astro src/pages/membros/recuperar-senha.astro
git commit -m "feat: criar páginas de login, cadastro e recuperação de senha"
```

---

## Task 8: Criar dashboard da área de membros

**Files:**
- Create: `src/pages/membros/index.astro`

- [ ] **Step 1: Criar src/pages/membros/index.astro**

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import Dashboard from '../../components/membros/Dashboard';
import { getUserProfile, getLessonProgress } from '../../lib/auth';

const session = Astro.locals.session!;
const profile = Astro.locals.profile || await getUserProfile(session.user.id);
const progress = await getLessonProgress(session.user.id);
const completedSlugs = progress.map((p) => p.lesson_slug);

// Mensagens via query params
const acesso = Astro.url.searchParams.get('acesso');
const compra = Astro.url.searchParams.get('compra');
const mensagem = acesso === 'bloqueado' ? 'bloqueado' : compra === 'sucesso' ? 'sucesso' : null;
---

<Layout title="Área de Membros — Máquina de Vídeos com IA" description="Seu painel de aprendizado">
  <section class="py-20 px-6 min-h-screen">
    <Dashboard
      name={profile?.name || ''}
      paid={profile?.paid || false}
      completedSlugs={completedSlugs}
      mensagem={mensagem}
      client:load
    />

    <!-- Logout -->
    <div class="max-w-2xl mx-auto mt-12 text-center">
      <form method="POST" action="/api/auth/logout">
        <button
          type="submit"
          class="text-xs font-mono text-gray-600 hover:text-red-500 uppercase tracking-wider transition-colors"
        >
          Sair da conta
        </button>
      </form>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/membros/index.astro
git commit -m "feat: criar dashboard da área de membros com progresso de aulas"
```

---

## Task 9: Criar páginas de aulas (área de membros — conteúdo gratuito)

**Files:**
- Create: `src/pages/membros/aulas/oportunidade.astro`
- Create: `src/pages/membros/aulas/demonstracao.astro`
- Create: `src/pages/membros/aulas/como-vender.astro`

Cada página tem o mesmo layout: vídeo embed + resumo em texto + botão de progresso. Diferem no conteúdo (videoId, título, resumo).

**Nota:** Os `videoId` do YouTube são placeholder — substituir pelos IDs reais dos vídeos gravados. Usar `VIDEO_ID_AQUI` como marcador.

- [ ] **Step 1: Criar src/pages/membros/aulas/oportunidade.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';

const session = Astro.locals.session!;
---

<Layout title="Módulo 1 — A Oportunidade" description="Como IA muda a produção de vídeo e o ROI do negócio">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <!-- Navegação -->
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        Módulo 1 — A Oportunidade
      </h1>
      <p class="text-gray-500 text-sm mb-8 font-mono">CONTEUDO GRATUITO</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="oportunidade"
        isLoggedIn={true}
        client:load
      />

      <!-- Resumo -->
      <div class="mt-12 space-y-6 text-gray-400 leading-relaxed">
        <p>
          A produção de vídeo tradicional força uma escolha entre custo alto (equipe + equipamento),
          tempo alto (fazer sozinho) ou imprevisibilidade (freelancers). A IA elimina esse trilema.
        </p>
        <p>
          Com o pipeline certo, você produz vídeos profissionais por ~R$100/minuto e vende
          a R$300-400/minuto. Margem de 67-75% sem aluguel, sem equipe fixa, sem estoque.
        </p>
        <p>
          Comparação: investimentos tradicionais rendem ~12% ao ano. Um projeto de vídeo com IA
          pode render 300% em um dia de trabalho.
        </p>
      </div>

      <!-- CTA próxima aula -->
      <div class="mt-12 border-t border-gray-800 pt-8">
        <a
          href="/membros/aulas/demonstracao/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Demonstração &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Criar src/pages/membros/aulas/demonstracao.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';

const session = Astro.locals.session!;
---

<Layout title="Módulo 2 — Demonstração" description="Pipeline completo ao vivo: da ideia à timeline">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        Módulo 2 — Demonstração
      </h1>
      <p class="text-gray-500 text-sm mb-8 font-mono">CONTEUDO GRATUITO</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="demonstracao"
        isLoggedIn={true}
        client:load
      />

      <div class="mt-12 space-y-6 text-gray-400 leading-relaxed">
        <p>
          Demonstração ao vivo e sem cortes do pipeline completo. Claude configura o projeto,
          escreve o roteiro, gera a narração com timestamps, monta o storyboard visual,
          gera imagens com referência encadeada, cria clips de vídeo, efeitos sonoros
          e exporta a timeline para DaVinci/Premiere.
        </p>
        <p>
          Você não precisa programar, desenhar ou editar até o editor abrir.
          Todo o processo é orquestrado por IA dentro de uma tarde.
        </p>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8">
        <a
          href="/membros/aulas/como-vender/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Como Vender &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Criar src/pages/membros/aulas/como-vender.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';

const session = Astro.locals.session!;
---

<Layout title="Módulo 3 — Como Vender" description="Aquisição de clientes com o Apolo">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        Módulo 3 — Como Vender
      </h1>
      <p class="text-gray-500 text-sm mb-8 font-mono">CONTEUDO GRATUITO</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="como-vender"
        isLoggedIn={true}
        client:load
      />

      <div class="mt-12 space-y-6 text-gray-400 leading-relaxed">
        <p>
          Estratégia de aquisição de clientes usando o Apolo: busca ativa de negócios locais
          por nicho/cidade, filtro por WhatsApp, e abordagem com vídeo demo personalizado.
        </p>
        <p>
          Monitoramento passivo de grupos de WhatsApp para palavras-chave de intenção.
          Combine volume (busca ativa), consistência (automação) e alta intenção (grupos).
        </p>
      </div>

      <!-- CTA para oferta -->
      <div class="mt-12 border-t border-gray-800 pt-8 text-center">
        <p class="text-gray-500 text-sm mb-6">
          Pronto para montar sua máquina de produção?
        </p>
        <a
          href="/video-ia/oferta/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Ver Oferta Completa &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/membros/aulas/
git commit -m "feat: criar páginas de aulas gratuitas na área de membros"
```

---

## Task 10: Criar páginas de conteúdo pago (área de membros)

**Files:**
- Create: `src/pages/membros/maquina/introducao.astro`
- Create: `src/pages/membros/maquina/skills.astro`
- Create: `src/pages/membros/maquina/workflow.astro`
- Create: `src/pages/membros/maquina/download.astro`

Todas protegidas pelo middleware (auth + `paid=true`).

**Nota:** O conteúdo detalhado dessas páginas vem do Módulo 5 dos roteiros. Os textos abaixo são baseados no roteiro — ajustar conforme necessário.

- [ ] **Step 1: Criar src/pages/membros/maquina/introducao.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';
---

<Layout title="A Máquina — Introdução" description="Setup completo do sistema de produção de vídeos com IA">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <div class="inline-block text-xs font-mono text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 mb-4">
        CONTEUDO PAGO
      </div>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        A Máquina — Introdução
      </h1>
      <p class="text-gray-500 text-sm mb-8">Setup completo do sistema de produção</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="introducao"
        isLoggedIn={true}
        client:load
      />

      <div class="mt-12 space-y-6 text-gray-400 leading-relaxed">
        <p>
          O pacote contém 66 arquivos prontos para uso: 8 skills especializadas do Claude,
          scripts Python utilitários, estrutura de pastas padronizada para clientes/projetos,
          e o arquivo CLAUDE.md que transforma o Claude genérico em um especialista de produção de vídeo.
        </p>
        <p>
          Nesta aula você vai extrair o ZIP, configurar o .env, rodar o comando de preparação
          de ambiente e ter o sistema pronto para produzir.
        </p>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8">
        <a
          href="/membros/maquina/skills/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Skills &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Criar src/pages/membros/maquina/skills.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';
---

<Layout title="A Máquina — Skills" description="As 8 skills especializadas do Claude">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <div class="inline-block text-xs font-mono text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 mb-4">
        CONTEUDO PAGO
      </div>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        A Máquina — Skills
      </h1>
      <p class="text-gray-500 text-sm mb-8">As 8 skills especializadas do Claude</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="skills"
        isLoggedIn={true}
        client:load
      />

      <div class="mt-12 space-y-4 text-gray-400 leading-relaxed">
        <p>Detalhamento de cada skill incluída no pacote:</p>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">01</span>
            <span>Roteirização — estrutura narrativa e método de 5 linhas</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">02</span>
            <span>Transcrição — timestamps e segmentação de narração</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">03</span>
            <span>Storyboard — visualização de cenas em JSON</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">04</span>
            <span>Geração de imagens — referência encadeada para consistência</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">05</span>
            <span>Geração de vídeo — clips animados a partir das imagens</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">06</span>
            <span>Efeitos sonoros — SFX automáticos por cena</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">07</span>
            <span>Narração — voice-over com ElevenLabs</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-yellow-500 font-mono text-xs mt-0.5">08</span>
            <span>Composição — export FCPXML para DaVinci/Premiere/Final Cut</span>
          </li>
        </ul>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8">
        <a
          href="/membros/maquina/workflow/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Workflow &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Criar src/pages/membros/maquina/workflow.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import VideoPlayer from '../../../components/membros/VideoPlayer';
---

<Layout title="A Máquina — Workflow" description="Fluxo completo de produção passo a passo">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <div class="inline-block text-xs font-mono text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 mb-4">
        CONTEUDO PAGO
      </div>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        A Máquina — Workflow Completo
      </h1>
      <p class="text-gray-500 text-sm mb-8">Fluxo de produção do início ao fim</p>

      <VideoPlayer
        videoId="VIDEO_ID_AQUI"
        lessonSlug="workflow"
        isLoggedIn={true}
        client:load
      />

      <div class="mt-12 space-y-6 text-gray-400 leading-relaxed">
        <p>
          Passo a passo completo de como executar um projeto de vídeo usando a máquina.
          Do briefing do cliente até a entrega do arquivo final.
        </p>
        <p>
          Inclui: setup do projeto, configuração de branding, execução das skills em sequência,
          revisão de qualidade e exportação.
        </p>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8">
        <a
          href="/membros/maquina/download/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Download &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Criar src/pages/membros/maquina/download.astro**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
---

<Layout title="A Máquina — Download" description="Download do pacote com 66 arquivos">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider transition-colors mb-8 inline-block">
        &larr; Voltar ao painel
      </a>

      <div class="inline-block text-xs font-mono text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 mb-4">
        CONTEUDO PAGO
      </div>

      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        Download da Máquina
      </h1>
      <p class="text-gray-500 text-sm mb-12">Seu pacote completo com 66 arquivos</p>

      <!-- Card de download -->
      <div class="bg-[#111] border border-gray-800 p-8 md:p-12">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 border border-yellow-500/30 bg-yellow-500/10 mb-6">
            <svg class="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 class="text-xl font-bold font-industrial text-white uppercase mb-2">
            Máquina de Produção de Vídeos com IA
          </h2>
          <p class="text-gray-500 text-sm mb-8">
            ZIP com 66 arquivos — 8 skills, scripts Python, estrutura de pastas, CLAUDE.md
          </p>

          <!-- NOTA: Substituir href pelo link real do arquivo hospedado (R2, S3, etc.) -->
          <a
            href="URL_DO_DOWNLOAD_AQUI"
            download
            class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
            style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
          >
            Baixar Pacote Completo
          </a>
        </div>
      </div>

      <!-- Instruções rápidas -->
      <div class="mt-12 space-y-4 text-gray-400 text-sm leading-relaxed">
        <h3 class="text-white font-bold font-industrial uppercase text-sm">Primeiros passos:</h3>
        <ol class="list-decimal list-inside space-y-2">
          <li>Extraia o ZIP em uma pasta de trabalho</li>
          <li>Configure o arquivo <code class="text-yellow-500 font-mono">.env</code> com suas API keys</li>
          <li>Execute o comando de preparação de ambiente</li>
          <li>Abra o Claude e comece a produzir</li>
        </ol>
        <p class="text-gray-600 text-xs mt-6">
          Consulte a aula de Introdução e o README incluído no pacote para detalhes completos.
        </p>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/membros/maquina/
git commit -m "feat: criar páginas de conteúdo pago (introdução, skills, workflow, download)"
```

---

## Task 11: Criar componentes e páginas do funil

**Files:**
- Create: `src/components/funil/PersonaHero.astro`
- Create: `src/components/funil/CapturaForm.tsx`
- Create: `src/components/funil/VideoPage.astro`
- Create: `src/pages/video-ia/cadastro.astro`
- Create: `src/pages/video-ia/oportunidade.astro`
- Create: `src/pages/video-ia/demonstracao.astro`
- Create: `src/pages/video-ia/como-vender.astro`
- Create: `src/pages/video-ia/oferta.astro`

Todas são páginas estáticas (prerender por padrão no modo hybrid).

- [ ] **Step 1: Criar src/components/funil/PersonaHero.astro**

Componente reutilizável para os heros das 4 landing pages.

```astro
---
interface Props {
  badge: string;
  titulo: string;
  destaque: string;
  descricao: string;
  ctaTexto?: string;
  ctaHref?: string;
}

const {
  badge,
  titulo,
  destaque,
  descricao,
  ctaTexto = 'Veja como funciona',
  ctaHref = '/video-ia/cadastro/',
} = Astro.props;
---

<section class="relative min-h-[80vh] flex items-center pt-20 pb-20 px-6 border-b border-gray-800 bg-grid-pattern overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]"></div>
  <div class="max-w-5xl mx-auto w-full relative z-10 text-center">
    <div class="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8 animate-fade-in-up">
      {badge}
    </div>

    <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold font-industrial text-white uppercase tracking-tight leading-[1.1] mb-8 animate-fade-in-up">
      {titulo}<br>
      <span class="text-yellow-500">{destaque}</span>
    </h1>

    <div class="max-w-2xl mx-auto mb-12 animate-fade-in-up">
      <p class="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
        {descricao}
      </p>
    </div>

    <a
      href={ctaHref}
      class="group relative inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm md:text-base transition-all animate-fade-in-up"
      style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
    >
      {ctaTexto}
      <svg class="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    </a>
  </div>
</section>
```

- [ ] **Step 2: Criar src/components/funil/CapturaForm.tsx**

Form de pré-cadastro do funil com campos ocultos GTM + push para Apolo CRM.

```tsx
import { useState, useEffect } from 'react';
import { Send, Lock } from 'lucide-react';

declare global {
  interface Window {
    __wlTracking?: Record<string, string>;
    dataLayer?: Record<string, unknown>[];
  }
}

const HIDDEN_FIELDS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
  "fbclid", "fbc", "fbp",
  "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
  "landing_page", "referrer", "user_agent", "first_visit",
  "session_id", "session_attributes_encoded", "originPage", "ref"
] as const;

const WEBHOOK_URL = "https://apolo-lead-proxy.rapricardo.workers.dev";

export default function CapturaForm() {
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    setTracking(window.__wlTracking || {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // GTM push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submit_lead',
      lead_name: formData.name || null,
      lead_email: formData.email || null,
      lead_whatsapp: formData.whatsapp || null,
      ...Object.fromEntries(
        HIDDEN_FIELDS.map((f) => [f, tracking[f] || null])
      ),
    });

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...tracking,
          source: 'funil_video_ia',
        }),
      });
      setStatus('success');
      // Redirecionar após sucesso
      window.location.href = '/video-ia/oportunidade/';
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-lg mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Acesse o Conteúdo Gratuito
        </h2>
        <p className="text-gray-500 text-sm">
          3 vídeos mostrando como produzir vídeos profissionais com IA
        </p>
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm text-center mb-4">Erro ao enviar. Tente novamente.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {HIDDEN_FIELDS.map((field) => (
          <input
            key={field}
            type="hidden"
            name={field}
            id={`h_${field}`}
            value={tracking[field] || ''}
          />
        ))}

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Nome</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Enviando...' : '[ Assistir Agora ]'}
          {status !== 'sending' && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
          <Lock className="w-3 h-3" />
          <span>Seus dados estão protegidos. Sem spam.</span>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Criar src/pages/video-ia/cadastro.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import CapturaForm from '../../components/funil/CapturaForm';
---

<Layout title="Vídeos Profissionais com IA — Conteúdo Gratuito" description="Cadastre-se para assistir 3 vídeos sobre produção de vídeo profissional com IA">
  <section class="min-h-screen flex items-center justify-center py-20 px-6 bg-grid-pattern relative">
    <div class="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]"></div>
    <div class="relative z-10">
      <CapturaForm client:load />
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Criar src/pages/video-ia/oportunidade.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="A Oportunidade — Vídeos com IA" description="Como IA muda a produção de vídeo e o ROI do negócio">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
        Módulo 1 de 3
      </div>

      <h1 class="text-3xl md:text-5xl font-bold font-industrial text-white uppercase tracking-tight leading-[1.1] mb-8">
        A Oportunidade
      </h1>

      <!-- Video embed -->
      <div class="relative w-full aspect-video bg-black border border-gray-800 mb-8">
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID_AQUI?rel=0"
          title="Módulo 1 — A Oportunidade"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="absolute inset-0 w-full h-full"
        ></iframe>
      </div>

      <!-- GTM video_view event -->
      <script is:inline>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'video_view', video_module: 'oportunidade' });
      </script>

      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>
          A produção de vídeo tradicional força uma escolha entre custo alto, tempo alto
          ou imprevisibilidade. A IA elimina esse trilema.
        </p>
        <p>
          Com o pipeline certo, você produz vídeos profissionais por ~R$100/minuto e vende
          a R$300-400/minuto. Margem de 67-75% sem aluguel, sem equipe fixa, sem estoque.
        </p>
      </div>

      <!-- CTA próximo -->
      <div class="mt-12 border-t border-gray-800 pt-8 flex items-center justify-between">
        <span class="text-xs font-mono text-gray-600">1 / 3</span>
        <a
          href="/video-ia/demonstracao/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Demonstração &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 5: Criar src/pages/video-ia/demonstracao.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Demonstração — Vídeos com IA" description="Pipeline completo ao vivo: da ideia à timeline">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
        Módulo 2 de 3
      </div>

      <h1 class="text-3xl md:text-5xl font-bold font-industrial text-white uppercase tracking-tight leading-[1.1] mb-8">
        Demonstração ao Vivo
      </h1>

      <div class="relative w-full aspect-video bg-black border border-gray-800 mb-8">
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID_AQUI?rel=0"
          title="Módulo 2 — Demonstração"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="absolute inset-0 w-full h-full"
        ></iframe>
      </div>

      <script is:inline>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'video_view', video_module: 'demonstracao' });
      </script>

      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>
          Demonstração ao vivo e sem cortes do pipeline completo. O Claude configura o projeto,
          escreve o roteiro, gera narração com timestamps, monta storyboard, gera imagens,
          cria clips, efeitos sonoros e exporta timeline para DaVinci/Premiere.
        </p>
        <p>
          Tudo em uma tarde. Sem programar, sem desenhar, sem editar até o editor abrir.
        </p>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8 flex items-center justify-between">
        <a href="/video-ia/oportunidade/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 transition-colors">
          &larr; Anterior
        </a>
        <span class="text-xs font-mono text-gray-600">2 / 3</span>
        <a
          href="/video-ia/como-vender/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
        >
          Próximo: Como Vender &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 6: Criar src/pages/video-ia/como-vender.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Como Vender — Vídeos com IA" description="Aquisição de clientes com o Apolo">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
        Módulo 3 de 3
      </div>

      <h1 class="text-3xl md:text-5xl font-bold font-industrial text-white uppercase tracking-tight leading-[1.1] mb-8">
        Como Vender
      </h1>

      <div class="relative w-full aspect-video bg-black border border-gray-800 mb-8">
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID_AQUI?rel=0"
          title="Módulo 3 — Como Vender"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="absolute inset-0 w-full h-full"
        ></iframe>
      </div>

      <script is:inline>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'video_view', video_module: 'como-vender' });
      </script>

      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>
          Estratégia de aquisição usando o Apolo: busca ativa de negócios locais, filtro por WhatsApp,
          abordagem com vídeo demo personalizado. Monitoramento passivo de grupos para intenção de compra.
        </p>
      </div>

      <div class="mt-12 border-t border-gray-800 pt-8 flex items-center justify-between">
        <a href="/video-ia/demonstracao/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 transition-colors">
          &larr; Anterior
        </a>
        <span class="text-xs font-mono text-gray-600">3 / 3</span>
        <a
          href="/video-ia/oferta/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Ver Oferta Completa &rarr;
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 7: Criar src/pages/video-ia/oferta.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Máquina de Produção de Vídeos com IA — Oferta" description="Pipeline completo de produção de vídeo com IA. Do roteiro à edição final.">
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
          Oferta Especial
        </div>
        <h1 class="text-4xl md:text-6xl font-bold font-industrial text-white uppercase tracking-tight leading-[1.1] mb-6">
          A Máquina de Produção<br>
          <span class="text-yellow-500">de Vídeos com IA</span>
        </h1>
        <p class="text-lg text-gray-400 font-light max-w-2xl mx-auto">
          66 arquivos prontos. 8 skills especializadas. Um sistema que transforma
          o Claude em um estúdio de produção completo.
        </p>
      </div>

      <!-- O que está incluso -->
      <div class="bg-[#111] border border-gray-800 p-8 md:p-12 mb-12">
        <h2 class="text-xl font-bold font-industrial text-white uppercase mb-8 border-b border-gray-800 pb-4">
          O que está incluso
        </h2>
        <ul class="space-y-4">
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>3 pipelines completos (vídeo longo, curto e institucional)</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>8 skills especializadas do Claude (roteiro, storyboard, imagens, vídeo, SFX, narração, composição, transcrição)</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Sistema de branding automático (paleta, fontes, logos por projeto)</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Setup automático de ambiente com um comando</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Estrutura de pastas padronizada por cliente/projeto</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Compatível com DaVinci Resolve, Premiere e Final Cut</span>
          </li>
          <li class="flex items-start gap-3 text-gray-400">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Acesso à área de membros com atualizações futuras</span>
          </li>
        </ul>
      </div>

      <!-- Preço + CTAs -->
      <div class="text-center mb-12">
        <p class="text-gray-500 text-sm font-mono uppercase tracking-widest mb-2">
          Investimento
        </p>
        <p class="text-5xl font-bold font-industrial text-white mb-2">
          12x <span class="text-yellow-500">R$ 92,98</span>
        </p>
        <p class="text-gray-600 text-xs font-mono mb-8">
          ou R$ 927,80 à vista
        </p>

        <!-- CTA Comprar -->
        <form method="POST" action="/api/checkout" class="mb-4">
          <button
            type="submit"
            class="w-full max-w-md mx-auto block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-5 text-base transition-all"
            style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
          >
            [ Quero a Máquina ]
          </button>
        </form>

        <!-- GTM begin_checkout -->
        <script is:inline>
          document.querySelector('form[action="/api/checkout"]')?.addEventListener('submit', function() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'begin_checkout', value: 927.80, currency: 'BRL' });
          });
        </script>

        <!-- CTA Grátis -->
        <a
          href="/membros/cadastro/"
          class="inline-block text-sm text-gray-500 hover:text-yellow-500 transition-colors mt-4"
        >
          Prefiro ver mais conteúdo gratuito primeiro &rarr;
        </a>
      </div>

      <!-- Garantia -->
      <div class="border border-gray-800 p-6 text-center">
        <p class="text-white font-bold font-industrial uppercase text-sm mb-2">
          Garantia de 7 dias
        </p>
        <p class="text-gray-500 text-sm">
          Se não gostar, devolvemos 100% do valor. Sem perguntas.
        </p>
      </div>

    </div>
  </section>
</Layout>
```

- [ ] **Step 8: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 9: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/components/funil/ src/pages/video-ia/cadastro.astro src/pages/video-ia/oportunidade.astro src/pages/video-ia/demonstracao.astro src/pages/video-ia/como-vender.astro src/pages/video-ia/oferta.astro
git commit -m "feat: criar páginas do funil (captura, vídeos, oferta) e componentes reutilizáveis"
```

---

## Task 12: Criar 4 landing pages por persona

**Files:**
- Create: `src/pages/video-ia/criadores.astro`
- Create: `src/pages/video-ia/agencias.astro`
- Create: `src/pages/video-ia/freelancers.astro`
- Create: `src/pages/video-ia/social-media.astro`

**Nota sobre copy:** Os textos abaixo são baseados nos roteiros e no posicionamento do produto. Revisar e ajustar conforme necessário — o CLAUDE.md pede que copy seja aprovada antes de publicar.

- [ ] **Step 1: Criar src/pages/video-ia/criadores.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PersonaHero from '../../components/funil/PersonaHero.astro';
---

<Layout title="Vídeos com IA para Criadores de Conteúdo" description="Pare de perder horas editando. Produza vídeos profissionais com IA em uma tarde.">
  <PersonaHero
    badge="Para Criadores de Conteúdo"
    titulo="Você cria o conteúdo."
    destaque="A IA produz o vídeo."
    descricao="Pare de perder horas editando. Um pipeline de IA produz vídeos profissionais do roteiro à timeline pronta — em uma tarde. Você foca na mensagem, a máquina faz o resto."
  />

  <!-- Problema -->
  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">O problema que você conhece</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Você tem ideias de conteúdo sobrando. O que falta é tempo para transformar cada uma em vídeo.</p>
        <p>Editar leva horas. Contratar editor é caro e lento. Ferramentas "fáceis" entregam resultado genérico.</p>
        <p>Resultado: você publica menos do que deveria, perde alcance e fica preso no ciclo de criar-editar-publicar.</p>
      </div>
    </div>
  </section>

  <!-- Solução -->
  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">A solução</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Um pipeline completo de IA que pega sua ideia e entrega uma timeline montada: roteiro, narração, imagens, clips, efeitos sonoros e composição.</p>
        <p>Você abre o editor com tudo pronto. Só ajusta e publica.</p>
        <p>Custo de produção: ~R$100 por minuto de vídeo. Tempo: uma tarde.</p>
      </div>

      <div class="mt-8 text-center">
        <a
          href="/video-ia/cadastro/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Veja como funciona
          <svg class="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Criar src/pages/video-ia/agencias.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PersonaHero from '../../components/funil/PersonaHero.astro';
---

<Layout title="Produção de Vídeo com IA para Agências" description="Pare de terceirizar vídeo e perder margem. Produza internamente com IA.">
  <PersonaHero
    badge="Para Agências de Marketing"
    titulo="Sua agência terceiriza vídeo."
    destaque="E perde margem em cada projeto."
    descricao="Com um pipeline de IA, sua agência produz vídeos profissionais internamente. Custo de R$100/minuto, venda a R$300-400/minuto. Margem de 67-75% sem contratar equipe."
  />

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">O problema que você conhece</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Seus clientes pedem vídeo. Você terceiriza porque não tem equipe de produção.</p>
        <p>O freelancer cobra caro, atrasa e o resultado nem sempre agrada o cliente. A margem que sobra não justifica o trabalho de gerenciar.</p>
        <p>Você perde receita recorrente porque não consegue oferecer vídeo como serviço escalável.</p>
      </div>
    </div>
  </section>

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">A solução</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Internalize a produção de vídeo com IA. Um operador da sua equipe roda o pipeline e entrega vídeo profissional em uma tarde.</p>
        <p>Custo real: ~R$100/minuto. Para clientes institucionais, o mesmo vídeo pode gerar R$10-20k de receita.</p>
        <p>Sem equipe nova. Sem equipamento. Sem estúdio.</p>
      </div>

      <div class="mt-8 text-center">
        <a
          href="/video-ia/cadastro/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Veja como funciona
          <svg class="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Criar src/pages/video-ia/freelancers.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PersonaHero from '../../components/funil/PersonaHero.astro';
---

<Layout title="Negócio de Vídeo com IA — Sem Aluguel, Sem Equipe" description="Monte um negócio de produção de vídeo sem aluguel, sem equipe fixa, sem estoque.">
  <PersonaHero
    badge="Para Empreendedores"
    titulo="Um negócio sem aluguel."
    destaque="Sem equipe fixa. Sem estoque."
    descricao="Produza vídeos profissionais com IA e venda como serviço. Investimento inicial próximo de zero, margem de 67-75% por projeto, operação 100% remota."
  />

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">O problema que você conhece</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Você quer empreender mas todo negócio parece exigir investimento alto, equipe e estrutura fixa.</p>
        <p>Freelancing tradicional troca tempo por dinheiro — você é o gargalo e não escala.</p>
        <p>Modelos de negócio online prometem liberdade mas exigem audiência ou capital para começar.</p>
      </div>
    </div>
  </section>

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">A solução</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Produção de vídeo com IA é um negócio de alta margem sem infraestrutura física. Seu "escritório" é um laptop e uma assinatura de IA.</p>
        <p>Custo por projeto: ~R$100/minuto. Preço de venda: R$300-400/minuto. Margem de 67-75% no primeiro dia.</p>
        <p>Investimentos tradicionais rendem ~12% ao ano. Um projeto de vídeo com IA pode render 300% em um dia.</p>
      </div>

      <div class="mt-8 text-center">
        <a
          href="/video-ia/cadastro/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Veja como funciona
          <svg class="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Criar src/pages/video-ia/social-media.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PersonaHero from '../../components/funil/PersonaHero.astro';
---

<Layout title="Vídeos com IA para Social Media" description="Demanda de reels explodiu e você não escala? Produza com IA.">
  <PersonaHero
    badge="Para Social Media Managers"
    titulo="A demanda de reels explodiu."
    destaque="Você não escala."
    descricao="Seus clientes querem mais vídeos, mais rápido, mais barato. Com IA, você produz vídeos profissionais em uma tarde — sem equipe de edição, sem freelancer, sem atraso."
  />

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">O problema que você conhece</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Cada cliente quer 4-8 reels por semana. Você gerencia 5-10 clientes. A conta não fecha.</p>
        <p>Editar consome seu tempo. Delegar para freelancer come sua margem. Ferramentas automáticas entregam resultado genérico.</p>
        <p>Você está preso entre qualidade e volume — e seus clientes querem os dois.</p>
      </div>
    </div>
  </section>

  <section class="py-20 px-6 border-b border-gray-800">
    <div class="max-w-3xl mx-auto space-y-8">
      <h2 class="text-2xl font-bold font-industrial text-white uppercase">A solução</h2>
      <div class="space-y-6 text-gray-400 leading-relaxed">
        <p>Um pipeline de IA que produz o vídeo inteiro: roteiro, imagens, clips, efeitos e timeline montada. Você só revisa e publica.</p>
        <p>Em vez de 4 horas por vídeo, você produz em 1 hora. 4x mais output com o mesmo tempo.</p>
        <p>Margem que sobra pode virar um novo serviço premium para seus clientes.</p>
      </div>

      <div class="mt-8 text-center">
        <a
          href="/video-ia/cadastro/"
          class="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest px-8 py-4 text-sm transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);"
        >
          Veja como funciona
          <svg class="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add src/pages/video-ia/criadores.astro src/pages/video-ia/agencias.astro src/pages/video-ia/freelancers.astro src/pages/video-ia/social-media.astro
git commit -m "feat: criar 4 landing pages por persona (criadores, agências, freelancers, social media)"
```

---

## Task 13: Criar Stripe Webhook Worker

**Files:**
- Este é um Cloudflare Worker **separado** do tocha-site. Criar em um novo diretório ou no mesmo repo sob `workers/stripe-webhook/`.

- [ ] **Step 1: Scaffold do worker**

```bash
cd /Users/tocha/Dev/sites/tocha-site
mkdir -p workers/stripe-webhook
```

- [ ] **Step 2: Criar workers/stripe-webhook/wrangler.toml**

```toml
name = "stripe-webhook-tocha"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = ""
# Secrets (configurar via wrangler secret put):
# SUPABASE_SERVICE_ROLE_KEY
# STRIPE_WEBHOOK_SECRET
```

- [ ] **Step 3: Criar workers/stripe-webhook/package.json**

```json
{
  "name": "stripe-webhook-tocha",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240925.0",
    "wrangler": "^3.80.0",
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 4: Criar workers/stripe-webhook/src/index.ts**

```typescript
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
  const v1Sig = parts.find((p) => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !v1Sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSig === v1Sig;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await request.text();

    const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.type !== 'checkout.session.completed') {
      return new Response('Ignored event type', { status: 200 });
    }

    const session = event.data.object;
    const customerEmail = session.customer_email || session.customer_details?.email;
    const supabaseUserId = session.metadata?.supabase_user_id;

    if (!customerEmail && !supabaseUserId) {
      return new Response('No customer identifier', { status: 400 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Atualizar paid=true
    let updateQuery = supabase.from('profiles').update({ paid: true });

    if (supabaseUserId) {
      updateQuery = updateQuery.eq('id', supabaseUserId);
    } else {
      updateQuery = updateQuery.eq('email', customerEmail);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error('Erro ao atualizar profile:', updateError);
      return new Response('Update failed', { status: 500 });
    }

    // Registrar pagamento
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: supabaseUserId || null,
      stripe_session_id: session.id,
      amount: session.amount_total || 0,
      status: 'completed',
    });

    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
      // Não retorna erro — o paid já foi atualizado
    }

    return new Response('OK', { status: 200 });
  },
};
```

- [ ] **Step 5: Criar workers/stripe-webhook/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Instalar dependências do worker**

```bash
cd /Users/tocha/Dev/sites/tocha-site/workers/stripe-webhook
npm install
```

- [ ] **Step 7: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site/workers/stripe-webhook
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add workers/stripe-webhook/
git commit -m "feat: criar Cloudflare Worker para webhook do Stripe"
```

---

## Task 14: Atualizar CLAUDE.md e configurações finais

**Files:**
- Modify: `CLAUDE.md`
- Create: `.env.example`

- [ ] **Step 1: Atualizar CLAUDE.md**

Adicionar ao CLAUDE.md existente as novas informações sobre o modo hybrid e as novas rotas. Modificar a linha `output: 'static'` para `output: 'hybrid'` e adicionar seção sobre área de membros.

Adicionar ao final do CLAUDE.md:

```markdown

## Área de Membros

- **Auth:** Supabase Auth (email + senha)
- **Banco:** Supabase PostgreSQL (profiles, lesson_progress, payments)
- **Pagamento:** Stripe Checkout hosted
- **Webhook:** Cloudflare Worker em `workers/stripe-webhook/`
- **Middleware:** `src/middleware.ts` protege rotas `/membros/*`
- **SSR:** Apenas rotas `/membros/*` e `/api/*` usam SSR (prerender = false)

### Variáveis de ambiente (Cloudflare Pages)

```
SUPABASE_URL
SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID
```

### Variáveis de ambiente (Worker stripe-webhook)

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY (secret)
STRIPE_WEBHOOK_SECRET (secret)
```
```

- [ ] **Step 2: Criar .env.example**

```
# Supabase
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
```

- [ ] **Step 3: Adicionar .env ao .gitignore**

Verificar se `.env` já está no `.gitignore`. Se não estiver, adicionar:

```bash
cd /Users/tocha/Dev/sites/tocha-site
echo ".env" >> .gitignore
```

- [ ] **Step 4: Build final**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx astro check
npx tsc --noEmit
npm run build
```

Expected: build completa sem erros. Páginas estáticas renderizadas + rotas SSR compiladas para Cloudflare Functions.

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add CLAUDE.md .env.example .gitignore
git commit -m "docs: atualizar CLAUDE.md com info da área de membros + .env.example"
```

---

## Checklist de Placeholders para substituir antes do deploy

Estes marcadores precisam ser substituídos por valores reais:

| Marcador | Onde | O que colocar |
|----------|------|---------------|
| `VIDEO_ID_AQUI` | Todas as páginas de vídeo (6 ocorrências) | ID do YouTube para cada vídeo gravado |
| `URL_DO_DOWNLOAD_AQUI` | `membros/maquina/download.astro` | URL do ZIP hospedado (R2, S3, etc.) |
| `SUPABASE_URL` | `.env` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | `.env` | Anon key do Supabase |
| `STRIPE_SECRET_KEY` | `.env` | Secret key do Stripe |
| `STRIPE_PUBLISHABLE_KEY` | `.env` | Publishable key do Stripe |
| `STRIPE_PRICE_ID` | `.env` | ID do Price criado no Stripe (12x R$92,98) |
