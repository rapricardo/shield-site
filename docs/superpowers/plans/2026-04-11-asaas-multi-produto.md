# Migração Stripe → Asaas + Multi-Produto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir Stripe pelo Asaas como gateway de pagamento e refatorar controle de acesso de `profiles.paid` para sistema multi-produto com tabelas `products` + `user_access`.

**Architecture:** API endpoint cria cobrança no Asaas com `externalReference` contendo `user_id|product_slug`. Webhook worker valida token e insere em `user_access`. Middleware consulta `user_access` em vez de `profiles.paid`.

**Tech Stack:** Astro 5, Supabase, Asaas REST API, Cloudflare Workers

**Spec:** `docs/superpowers/specs/2026-04-11-asaas-multi-produto-design.md`

---

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── auth.ts                    ← MODIFICAR: adicionar getUserAccess, hasAccess
│   └── asaas.ts                   ← CRIAR: cliente Asaas (criar customer, criar cobrança)
├── pages/
│   ├── api/
│   │   └── checkout.ts            ← REESCREVER: Stripe → Asaas
│   └── membros/
│       └── index.astro            ← MODIFICAR: passar accessSlugs em vez de paid
├── middleware.ts                   ← MODIFICAR: usar getUserAccess
├── components/
│   └── membros/
│       └── Dashboard.tsx           ← MODIFICAR: accessSlugs em vez de paid
├── env.d.ts                        ← MODIFICAR: trocar env vars

workers/
└── payment-webhook/                ← RENOMEAR de stripe-webhook + REESCREVER
    ├── src/index.ts
    ├── wrangler.toml
    └── package.json

supabase/
└── migrations/
    └── XXXXXXX_asaas_multi_produto.sql  ← CRIAR: products, user_access, alter payments
```

---

## Task 1: Criar migration Supabase (products + user_access + alter payments)

**Files:**
- Create: `supabase/migrations/<timestamp>_asaas_multi_produto.sql`

- [ ] **Step 1: Criar arquivo de migration**

```bash
cd /Users/tocha/Dev/sites/tocha-site
supabase migration new asaas_multi_produto
```

- [ ] **Step 2: Escrever o SQL da migration**

Conteúdo do arquivo criado:

```sql
-- 1. Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  max_installments INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa lê produtos ativos"
  ON public.products FOR SELECT
  USING (active = true);

-- Seed: produto atual
INSERT INTO public.products (slug, name, price_cents, max_installments)
VALUES ('maquina-videos', 'Máquina de Produção de Vídeos com IA', 92780, 12);

-- 2. Tabela de acessos por produto
CREATE TABLE public.user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  payment_id UUID REFERENCES public.payments(id),
  UNIQUE(user_id, product_slug)
);

ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprios acessos"
  ON public.user_access FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Alterar tabela payments para Asaas
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS product_slug TEXT NOT NULL DEFAULT 'maquina-videos';

-- Remover constraint do stripe_session_id (se existir)
ALTER TABLE public.payments
  ALTER COLUMN stripe_session_id DROP NOT NULL;

-- 4. Adicionar asaas_customer_id ao profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- 5. Migrar usuários com paid=true para user_access
INSERT INTO public.user_access (user_id, product_slug)
SELECT id, 'maquina-videos' FROM public.profiles WHERE paid = true
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Aplicar migration no banco remoto**

```bash
cd /Users/tocha/Dev/sites/tocha-site
supabase db push
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: criar tabelas products + user_access e adaptar payments para Asaas"
```

---

## Task 2: Criar lib/asaas.ts (cliente Asaas)

**Files:**
- Create: `src/lib/asaas.ts`

- [ ] **Step 1: Criar src/lib/asaas.ts**

```typescript
const ASAAS_BASE_URL = import.meta.env.ASAAS_API_KEY?.startsWith('$aact_')
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = import.meta.env.ASAAS_API_KEY;

if (!ASAAS_API_KEY) {
  throw new Error('ASAAS_API_KEY é obrigatória');
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Asaas API error (${res.status}): ${error}`);
  }

  return res.json();
}

export async function findOrCreateCustomer(email: string, name: string): Promise<string> {
  // Buscar por email
  const search = await asaasFetch(`/customers?email=${encodeURIComponent(email)}`);

  if (search.data && search.data.length > 0) {
    return search.data[0].id;
  }

  // Criar novo
  const customer = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });

  return customer.id;
}

interface CreatePaymentParams {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
  installmentCount?: number;
  installmentValue?: number;
  successUrl: string;
}

export async function createPayment(params: CreatePaymentParams): Promise<string> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const body: Record<string, unknown> = {
    customer: params.customerId,
    billingType: 'UNDEFINED',
    value: params.value,
    dueDate: dueDateStr,
    description: params.description,
    externalReference: params.externalReference,
    callback: {
      successUrl: params.successUrl,
      autoRedirect: true,
    },
  };

  if (params.installmentCount && params.installmentCount > 1) {
    body.installmentCount = params.installmentCount;
    body.installmentValue = params.installmentValue;
  }

  const payment = await asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payment.invoiceUrl;
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/asaas.ts
git commit -m "feat: criar cliente Asaas (findOrCreateCustomer + createPayment)"
```

---

## Task 3: Atualizar auth.ts (getUserAccess + hasAccess)

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Adicionar funções ao final de src/lib/auth.ts**

Adicionar após a função `markLessonComplete`:

```typescript
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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: adicionar getUserAccess e hasAccess ao auth.ts"
```

---

## Task 4: Atualizar middleware para usar user_access

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Reescrever src/middleware.ts**

```typescript
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
```

- [ ] **Step 2: Atualizar App.Locals em src/env.d.ts**

Adicionar `accessSlugs` ao tipo Locals:

```typescript
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
    accessSlugs?: string[];
  }
}
```

Também trocar as env vars do Stripe pelo Asaas:

```typescript
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly ASAAS_API_KEY: string;
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/env.d.ts
git commit -m "feat: middleware usa user_access por produto em vez de profiles.paid"
```

---

## Task 5: Reescrever endpoint de checkout para Asaas

**Files:**
- Modify: `src/pages/api/checkout.ts`

- [ ] **Step 1: Reescrever src/pages/api/checkout.ts**

```typescript
import type { APIRoute } from 'astro';
import { getSession, getUserProfile } from '../../lib/auth';
import { findOrCreateCustomer, createPayment } from '../../lib/asaas';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) {
    return redirect('/membros/login/');
  }

  const formData = await request.formData();
  const productSlug = formData.get('productSlug')?.toString() || 'maquina-videos';

  // Buscar produto
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', productSlug)
    .eq('active', true)
    .single();

  if (productError || !product) {
    return redirect('/membros/?erro=produto-nao-encontrado');
  }

  // Buscar perfil para nome
  const profile = await getUserProfile(session.user.id);
  const customerName = profile?.name || session.user.email || 'Cliente';
  const customerEmail = session.user.email!;

  // Criar ou buscar customer no Asaas
  let customerId = profile?.asaas_customer_id;

  if (!customerId) {
    customerId = await findOrCreateCustomer(customerEmail, customerName);

    // Salvar asaas_customer_id no profile
    await supabase
      .from('profiles')
      .update({ asaas_customer_id: customerId })
      .eq('id', session.user.id);
  }

  const origin = new URL(request.url).origin;
  const externalReference = `${session.user.id}|${productSlug}`;

  const valueInReais = product.price_cents / 100;
  const installmentValue = product.max_installments > 1
    ? Math.round((valueInReais / product.max_installments) * 100) / 100
    : undefined;

  const invoiceUrl = await createPayment({
    customerId,
    value: valueInReais,
    description: product.name,
    externalReference,
    installmentCount: product.max_installments > 1 ? product.max_installments : undefined,
    installmentValue,
    successUrl: `${origin}/membros/?compra=sucesso`,
  });

  return redirect(invoiceUrl);
};
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/checkout.ts
git commit -m "feat: checkout via Asaas com suporte a multi-produto"
```

---

## Task 6: Atualizar Dashboard e página de membros para multi-produto

**Files:**
- Modify: `src/components/membros/Dashboard.tsx`
- Modify: `src/pages/membros/index.astro`
- Modify: `src/pages/video-ia/oferta.astro`

- [ ] **Step 1: Atualizar interface do Dashboard.tsx**

Trocar a prop `paid: boolean` por `accessSlugs: string[]` no Dashboard:

Na interface `DashboardProps` (linha 5):
```typescript
interface DashboardProps {
  name: string;
  accessSlugs: string[];
  completedSlugs: string[];
  mensagem?: string | null;
}
```

Na função do componente (linha 111), trocar `paid` por lógica de acesso:
```typescript
const Dashboard = ({ name, accessSlugs, completedSlugs, mensagem }: DashboardProps) => {
  const hasMaquinaAccess = accessSlugs.includes('maquina-videos');
  const freeLessons = buildLessons(FREE_LESSONS, completedSlugs, false);
  const paidLessons = buildLessons(PAID_LESSONS, completedSlugs, !hasMaquinaAccess);
```

Na linha 126, trocar a verificação de `paid`:
```typescript
        <p className="text-gray-500 text-sm font-mono">
          {hasMaquinaAccess ? 'ACESSO COMPLETO' : 'ACESSO GRATUITO'}
        </p>
```

No CTA de checkout (linha 150), trocar `{!paid &&` por `{!hasMaquinaAccess &&` e adicionar hidden field:
```typescript
      {!hasMaquinaAccess && (
        <div className="bg-[#111] border border-yellow-500/30 p-8 mb-10 text-center">
          <h3 className="font-industrial text-white uppercase text-xl mb-2">
            Desbloqueie o conteudo completo
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Acesse todas as aulas, templates e recursos exclusivos.
          </p>
          <form method="POST" action="/api/checkout">
            <input type="hidden" name="productSlug" value="maquina-videos" />
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 uppercase tracking-widest transition-all inline-flex items-center gap-2 group"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              [ Adquirir Acesso Completo — 12x R$ 92,98 ]
            </button>
          </form>
        </div>
      )}
```

- [ ] **Step 2: Atualizar src/pages/membros/index.astro**

Substituir o frontmatter e props do Dashboard:

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import Dashboard from '../../components/membros/Dashboard';
import { getUserProfile, getLessonProgress, getUserAccess } from '../../lib/auth';

const session = Astro.locals.session!;
const profile = await getUserProfile(session.user.id);
const progress = await getLessonProgress(session.user.id);
const completedSlugs = progress.map((p) => p.lesson_slug);
const accessSlugs = await getUserAccess(session.user.id);

const acesso = Astro.url.searchParams.get('acesso');
const compra = Astro.url.searchParams.get('compra');
const mensagem = acesso === 'bloqueado' ? 'bloqueado' : compra === 'sucesso' ? 'sucesso' : null;
---

<Layout title="Área de Membros — Máquina de Vídeos com IA" description="Seu painel de aprendizado">
  <section class="py-20 px-6 min-h-screen">
    <Dashboard
      name={profile?.name || ''}
      accessSlugs={accessSlugs}
      completedSlugs={completedSlugs}
      mensagem={mensagem}
      client:load
    />

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

- [ ] **Step 3: Atualizar form na oferta.astro**

No arquivo `src/pages/video-ia/oferta.astro`, adicionar o hidden field `productSlug` ao form de checkout. Buscar o form (que faz POST para `/api/checkout`) e adicionar:

```html
<form method="POST" action="/api/checkout">
  <input type="hidden" name="productSlug" value="maquina-videos" />
  <!-- botão existente permanece -->
</form>
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/membros/Dashboard.tsx src/pages/membros/index.astro src/pages/video-ia/oferta.astro
git commit -m "feat: Dashboard e oferta usam accessSlugs + productSlug para multi-produto"
```

---

## Task 7: Reescrever webhook worker para Asaas

**Files:**
- Modify: `workers/stripe-webhook/` → renomear para `workers/payment-webhook/`
- Rewrite: `workers/payment-webhook/src/index.ts`
- Modify: `workers/payment-webhook/wrangler.toml`

- [ ] **Step 1: Renomear diretório**

```bash
cd /Users/tocha/Dev/sites/tocha-site
mv workers/stripe-webhook workers/payment-webhook
```

- [ ] **Step 2: Atualizar workers/payment-webhook/wrangler.toml**

```toml
name = "payment-webhook-tocha"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = ""
# Secrets (configurar via wrangler secret put):
# SUPABASE_SERVICE_ROLE_KEY
# ASAAS_WEBHOOK_TOKEN
```

- [ ] **Step 3: Reescrever workers/payment-webhook/src/index.ts**

```typescript
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ASAAS_WEBHOOK_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validar token do Asaas
    const token = request.headers.get('asaas-access-token');
    if (!token || token !== env.ASAAS_WEBHOOK_TOKEN) {
      return new Response('Invalid token', { status: 401 });
    }

    const body = await request.text();
    let event: { event: string; payment: Record<string, unknown> };

    try {
      event = JSON.parse(body);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Processar apenas pagamentos confirmados
    if (event.event !== 'PAYMENT_CONFIRMED' && event.event !== 'PAYMENT_RECEIVED') {
      return new Response('Ignored event', { status: 200 });
    }

    const payment = event.payment;
    const externalReference = payment.externalReference as string;

    if (!externalReference || !externalReference.includes('|')) {
      return new Response('Missing or invalid externalReference', { status: 400 });
    }

    const [userId, productSlug] = externalReference.split('|');

    if (!userId || !productSlug) {
      return new Response('Invalid externalReference format', { status: 400 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Registrar pagamento
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        asaas_payment_id: payment.id as string,
        product_slug: productSlug,
        amount: Math.round((payment.value as number) * 100),
        status: 'completed',
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
      // Se for duplicata, ignora (idempotência)
      if (paymentError.code === '23505') {
        return new Response('Already processed', { status: 200 });
      }
      return new Response('Payment insert failed', { status: 500 });
    }

    // Liberar acesso
    const { error: accessError } = await supabase
      .from('user_access')
      .upsert(
        {
          user_id: userId,
          product_slug: productSlug,
          payment_id: paymentRecord.id,
        },
        { onConflict: 'user_id,product_slug' }
      );

    if (accessError) {
      console.error('Erro ao liberar acesso:', accessError);
      return new Response('Access grant failed', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  },
};
```

- [ ] **Step 4: Verificar tipos do worker**

```bash
cd /Users/tocha/Dev/sites/tocha-site/workers/payment-webhook
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
cd /Users/tocha/Dev/sites/tocha-site
git add workers/
git commit -m "feat: renomear e reescrever webhook worker para Asaas + multi-produto"
```

---

## Task 8: Remover Stripe e atualizar configs

**Files:**
- Modify: `package.json` (remover stripe)
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remover pacote stripe**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npm uninstall stripe
```

- [ ] **Step 2: Atualizar .env.example**

```
# Supabase
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Asaas
ASAAS_API_KEY=$aact_...
```

- [ ] **Step 3: Atualizar seção de env vars no CLAUDE.md**

Na seção "Variáveis de ambiente (Cloudflare Pages)", substituir:

```markdown
### Variáveis de ambiente (Cloudflare Pages)

```
SUPABASE_URL
SUPABASE_ANON_KEY
ASAAS_API_KEY
```

### Variáveis de ambiente (Worker payment-webhook)

```
SUPABASE_URL (var)
SUPABASE_SERVICE_ROLE_KEY (secret)
ASAAS_WEBHOOK_TOKEN (secret)
```
```

- [ ] **Step 4: Verificar build**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example CLAUDE.md
git commit -m "feat: remover Stripe, atualizar configs para Asaas"
```

---

## Task 9: Atualizar .env local e testar

**Files:**
- Modify: `.env` (local, não commitado)

- [ ] **Step 1: Atualizar .env**

Remover variáveis do Stripe e adicionar do Asaas:

```
# Supabase
SUPABASE_URL=<manter>
SUPABASE_ANON_KEY=<manter>

# Asaas
ASAAS_API_KEY=$aact_<sua_api_key_sandbox>
```

- [ ] **Step 2: Reiniciar dev server**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npm run dev
```

- [ ] **Step 3: Testar fluxo**

1. Acessar `http://localhost:4322/membros/` (logado)
2. Clicar "Adquirir Acesso Completo"
3. Deve redirecionar para página de pagamento do Asaas (sandbox)
4. Verificar no Supabase se `user_access` foi populado após pagamento

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "fix: ajustes finais da migração Stripe → Asaas"
```
