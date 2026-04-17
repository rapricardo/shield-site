# Melhorias da Área do Aluno — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar a área de membros em um hub produto-cêntrico, com liberação sequencial de aulas, progresso visível e "continuar de onde parou".

**Architecture:** `/membros/` vira hub (grade de cards de produto). Cada produto tem sua página em `/membros/p/{slug}/`. Middleware valida acesso por produto + sequência de aulas. Nenhuma migration nova — o schema atual já suporta.

**Tech Stack:** Astro 5 (SSR), Supabase, Tailwind 4, React 19 (ilhas interativas)

**Spec:** `docs/superpowers/specs/2026-04-16-melhorias-area-aluno-design.md`

---

## Estrutura de Arquivos

```
src/
├── lib/
│   └── progress.ts                          ← CRIAR: helpers de progresso e próxima aula
├── middleware.ts                            ← MODIFICAR: bloqueio sequencial + acesso por produto
├── pages/
│   └── membros/
│       ├── index.astro                      ← REESCREVER: SSR do hub
│       ├── minha-conta.astro                ← MODIFICAR: exibir role
│       └── p/
│           └── [productSlug].astro          ← CRIAR: página do produto
├── components/
│   └── membros/
│       ├── Dashboard.tsx                    ← REESCREVER: hub com cards + continue
│       ├── LessonCard.tsx                   ← MODIFICAR: estado bloqueada-sequencial
│       ├── ProductHubCard.tsx               ← CRIAR: card do produto no hub
│       ├── ContinueCard.tsx                 ← CRIAR: card "continuar de onde parou"
│       ├── FreeStarterCard.tsx              ← CRIAR: card quando aluno sem acesso
│       └── ProductLessonList.tsx            ← CRIAR: lista de aulas da página do produto
```

---

## Task 1: Criar helpers de progresso em `src/lib/progress.ts`

**Files:**
- Create: `src/lib/progress.ts`

Centraliza a lógica de:
- Calcular progresso por produto (X de Y concluídas, %)
- Descobrir próxima aula disponível em um produto
- Decidir se uma aula está desbloqueada pela regra sequencial
- Descobrir "produto mais recente" (heurística do hub)

- [ ] **Step 1: Criar arquivo com tipos e funções**

```typescript
import { supabase } from './supabase';

export interface ProductProgress {
  productSlug: string;
  productName: string;
  total: number;
  completed: number;
  percent: number;  // 0-100, inteiro
}

export interface NextLesson {
  slug: string;
  title: string;
  orderIndex: number;
}

/**
 * Retorna progresso do aluno em cada produto que ele tem acesso.
 * Inclui "preview" (product_slug do funil free) se aluno não tem acesso nenhum.
 */
export async function getProductProgressList(userId: string): Promise<ProductProgress[]> {
  // 1) Produtos do aluno
  const { data: access } = await supabase
    .from('user_access')
    .select('product_slug, products(name)')
    .eq('user_id', userId);

  const productSlugs = (access || []).map((a: any) => a.product_slug);
  if (productSlugs.length === 0) return [];

  // 2) Total de aulas por produto
  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug, product_slug, title, order_index')
    .in('product_slug', productSlugs)
    .order('order_index', { ascending: true });

  // 3) Aulas concluídas do aluno
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId);

  const completedSet = new Set((progress || []).map((p) => p.lesson_slug));

  // 4) Agregação por produto
  const byProduct = new Map<string, { name: string; total: number; completed: number }>();
  for (const a of access as any[]) {
    byProduct.set(a.product_slug, { name: a.products?.name || a.product_slug, total: 0, completed: 0 });
  }
  for (const l of lessons || []) {
    const p = byProduct.get(l.product_slug);
    if (!p) continue;
    p.total += 1;
    if (completedSet.has(l.slug)) p.completed += 1;
  }

  return Array.from(byProduct.entries()).map(([slug, v]) => ({
    productSlug: slug,
    productName: v.name,
    total: v.total,
    completed: v.completed,
    percent: v.total === 0 ? 0 : Math.round((v.completed / v.total) * 100),
  }));
}

/**
 * Próxima aula não concluída de um produto (menor order_index sem lesson_progress).
 */
export async function getNextLesson(userId: string, productSlug: string): Promise<NextLesson | null> {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug, title, order_index')
    .eq('product_slug', productSlug)
    .order('order_index', { ascending: true });

  if (!lessons || lessons.length === 0) return null;

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId);

  const completedSet = new Set((progress || []).map((p) => p.lesson_slug));

  for (const l of lessons) {
    if (!completedSet.has(l.slug)) {
      return { slug: l.slug, title: l.title, orderIndex: l.order_index };
    }
  }
  return null; // tudo concluído
}

/**
 * Produto "mais recente" do aluno pela heurística:
 * 1) produto com lesson_progress mais recente (o que ele está assistindo)
 * 2) senão, produto com user_access.granted_at mais recente
 * 3) senão, null
 */
export async function getMostRecentProduct(userId: string): Promise<string | null> {
  // 1) Último progresso
  const { data: lastProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastProgress) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('product_slug')
      .eq('slug', lastProgress.lesson_slug)
      .maybeSingle();
    if (lesson?.product_slug) return lesson.product_slug;
  }

  // 2) Último acesso granted
  const { data: lastAccess } = await supabase
    .from('user_access')
    .select('product_slug')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return lastAccess?.product_slug || null;
}

/**
 * Verifica se uma aula está desbloqueada para o aluno.
 * Regra:
 *  - Aula `is_free = true` é livre do requisito de user_access
 *  - Se aluno concluiu essa aula antes, fica desbloqueada (retroativo)
 *  - Primeira aula (order_index = menor do produto) está desbloqueada se tem acesso
 *  - Demais aulas: exige lesson_progress da aula anterior (maior order_index menor que a atual)
 */
export async function isLessonUnlocked(
  userId: string,
  lessonSlug: string
): Promise<{ unlocked: boolean; reason: 'completed' | 'first' | 'sequential' | 'blocked' | 'missing_access' | 'not_found'; fallbackLessonSlug?: string }> {
  const { data: lesson } = await supabase
    .from('lessons')
    .select('slug, product_slug, order_index, is_free')
    .eq('slug', lessonSlug)
    .maybeSingle();

  if (!lesson) return { unlocked: false, reason: 'not_found' };

  // Checar acesso (exceto is_free)
  if (!lesson.is_free && lesson.product_slug) {
    const { data: access } = await supabase
      .from('user_access')
      .select('product_slug')
      .eq('user_id', userId)
      .eq('product_slug', lesson.product_slug)
      .maybeSingle();
    if (!access) return { unlocked: false, reason: 'missing_access' };
  }

  // Checar se já concluiu (retroativo libera)
  const { data: ownProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId)
    .eq('lesson_slug', lessonSlug)
    .maybeSingle();
  if (ownProgress) return { unlocked: true, reason: 'completed' };

  // Buscar aulas do mesmo produto
  const { data: siblings } = await supabase
    .from('lessons')
    .select('slug, order_index')
    .eq('product_slug', lesson.product_slug!)
    .order('order_index', { ascending: true });

  if (!siblings || siblings.length === 0) return { unlocked: false, reason: 'blocked' };

  // Primeira aula do produto — desbloqueada
  if (siblings[0].slug === lessonSlug) return { unlocked: true, reason: 'first' };

  // Buscar aula imediatamente anterior (maior order_index < atual)
  const prev = siblings
    .filter((s) => s.order_index < lesson.order_index)
    .sort((a, b) => b.order_index - a.order_index)[0];

  if (!prev) return { unlocked: true, reason: 'first' };

  const { data: prevProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userId)
    .eq('lesson_slug', prev.slug)
    .maybeSingle();

  if (prevProgress) return { unlocked: true, reason: 'sequential' };

  // Bloqueada — retorna prev como fallback (próxima disponível para redirect)
  return { unlocked: false, reason: 'blocked', fallbackLessonSlug: prev.slug };
}
```

- [ ] **Step 2: Validar com typecheck**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

Expected: sem erros.

---

## Task 2: Atualizar middleware para bloqueio sequencial e acesso por produto

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Adicionar helpers nos imports**

```typescript
import { isLessonUnlocked, getNextLesson } from './lib/progress';
```

- [ ] **Step 2: Adicionar bloco de validação para `/membros/aulas/[slug]`**

Inserir após o bloco que já carrega `session` (antes do `return next()`):

```typescript
// Validação sequencial para rotas de aula
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
      return context.redirect(`/membros/aulas/${check.fallbackLessonSlug}/?redirected=sequencial`);
    }
    return context.redirect('/membros/');
  }
}
```

- [ ] **Step 3: Adicionar bloco de validação para `/membros/p/[productSlug]`**

```typescript
const produtoMatch = pathname.match(/^\/membros\/p\/([^\/]+)\/?$/);
if (produtoMatch) {
  const productSlug = produtoMatch[1];
  const accessList = await getUserAccess(session.user.id);
  if (!hasAccess(accessList, productSlug)) {
    return context.redirect('/membros/?acesso=bloqueado');
  }
  context.locals.accessSlugs = accessList;
}
```

- [ ] **Step 4: Remover o `ROUTE_PRODUCT_MAP` antigo (fica obsoleto com a rota nova)**

Manter temporariamente para back-compat se precisar, mas documentar como deprecated.

- [ ] **Step 5: Typecheck**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

---

## Task 3: Criar componente `ProductHubCard`

**Files:**
- Create: `src/components/membros/ProductHubCard.tsx`

- [ ] **Step 1: Implementar card com nome, progresso e barra**

```tsx
interface ProductHubCardProps {
  productSlug: string;
  productName: string;
  completed: number;
  total: number;
  percent: number;
}

export default function ProductHubCard(props: ProductHubCardProps) {
  const { productSlug, productName, completed, total, percent } = props;
  return (
    <a
      href={`/membros/p/${productSlug}/`}
      className="block bg-[#111] border border-gray-800 hover:border-yellow-500 p-6 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-industrial text-white uppercase text-base">{productName}</h3>
        <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
          {completed}/{total} · {percent}%
        </span>
      </div>
      <div className="h-1 bg-gray-800 w-full">
        <div
          className="h-full bg-yellow-500 transition-all"
          style={{ width: `${percent}%` }}
          aria-label={`Progresso: ${percent} por cento`}
        />
      </div>
    </a>
  );
}
```

---

## Task 4: Criar componente `ContinueCard`

**Files:**
- Create: `src/components/membros/ContinueCard.tsx`

- [ ] **Step 1: Card destacado no topo**

```tsx
interface ContinueCardProps {
  productSlug: string;
  productName: string;
  nextLessonSlug: string;
  nextLessonTitle: string;
  completed: number;
  total: number;
  percent: number;
}

export default function ContinueCard(props: ContinueCardProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-[#111] border border-yellow-500/30 p-6">
      <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-2">
        Continuar de onde parou
      </p>
      <h3 className="font-industrial text-white uppercase text-lg mb-1">
        {props.productName}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Próxima aula: <span className="text-white">{props.nextLessonTitle}</span>
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-mono text-gray-500 mb-1">
            {props.completed} de {props.total} aulas · {props.percent}%
          </div>
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-yellow-500" style={{ width: `${props.percent}%` }} />
          </div>
        </div>
        <a
          href={`/membros/aulas/${props.nextLessonSlug}/`}
          className="bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400"
        >
          ▶ Continuar
        </a>
      </div>
    </div>
  );
}
```

---

## Task 5: Criar componente `FreeStarterCard`

**Files:**
- Create: `src/components/membros/FreeStarterCard.tsx`

- [ ] **Step 1: Card "comece grátis" para aluno sem acesso nenhum**

```tsx
interface FreeStarterCardProps {
  firstFreeLessonSlug: string;
  firstFreeLessonTitle: string;
  firstFreeLessonDesc: string;
}

export default function FreeStarterCard(props: FreeStarterCardProps) {
  return (
    <div className="bg-[#111] border border-gray-800 p-6 mb-8">
      <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-2">
        Comece gratuito
      </p>
      <h3 className="font-industrial text-white uppercase text-lg mb-1">
        {props.firstFreeLessonTitle}
      </h3>
      <p className="text-gray-400 text-sm mb-4">{props.firstFreeLessonDesc}</p>
      <a
        href={`/membros/aulas/${props.firstFreeLessonSlug}/`}
        className="inline-block bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400"
      >
        ▶ Assistir grátis
      </a>
    </div>
  );
}
```

---

## Task 6: Reescrever `Dashboard.tsx` como hub

**Files:**
- Modify: `src/components/membros/Dashboard.tsx`

- [ ] **Step 1: Trocar props e layout**

Remover a lógica antiga de lista-de-aulas-por-categoria. O dashboard agora é só:
1. Header com saudação + badge admin (se aplicável)
2. Continue card (se tem progresso)
3. Lista de produtos (ProductHubCard) OU FreeStarterCard se `products.length === 0`
4. Cohort card (se aplicável) — preservar o que já existe
5. Footer: Lives · Minha Conta · Admin (se isAdmin) · Sair

**Props novas:**
```tsx
interface DashboardProps {
  name: string;
  isAdmin: boolean;
  products: ProductProgress[];
  continueFrom: {
    productSlug: string;
    productName: string;
    nextLessonSlug: string;
    nextLessonTitle: string;
    completed: number;
    total: number;
    percent: number;
  } | null;
  freeStarter: {
    slug: string;
    title: string;
    description: string;
  } | null;  // preenchido apenas quando products.length === 0
  cohorts: Cohort[];
  mensagem: 'bloqueado' | 'sucesso' | 'senha-atualizada' | null;
}
```

- [ ] **Step 2: Adicionar link "Admin" no footer quando `isAdmin`**

```tsx
{isAdmin && (
  <a href="/admin/" className="text-xs font-mono text-gray-500 hover:text-yellow-500 uppercase tracking-wider">
    Admin
  </a>
)}
```

---

## Task 7: Criar página `/membros/p/[productSlug].astro`

**Files:**
- Create: `src/pages/membros/p/[productSlug].astro`

- [ ] **Step 1: Página SSR carrega produto + aulas + progresso**

```astro
---
export const prerender = false;

import Layout from '../../../layouts/Layout.astro';
import ProductLessonList from '../../../components/membros/ProductLessonList';
import { supabase } from '../../../lib/supabase';
import { getNextLesson, getProductProgressList } from '../../../lib/progress';

const session = Astro.locals.session!;
const { productSlug } = Astro.params;

// Produto
const { data: product } = await supabase
  .from('products')
  .select('slug, name, long_description')
  .eq('slug', productSlug)
  .eq('active', true)
  .maybeSingle();

if (!product) return Astro.redirect('/membros/?erro=produto-nao-encontrado');

// Aulas do produto
const { data: lessons } = await supabase
  .from('lessons')
  .select('slug, title, description, order_index, is_free')
  .eq('product_slug', productSlug)
  .order('order_index', { ascending: true });

// Progresso do aluno
const { data: progress } = await supabase
  .from('lesson_progress')
  .select('lesson_slug')
  .eq('user_id', session.user.id);

const completedSet = new Set((progress || []).map((p) => p.lesson_slug));

// Próxima aula
const next = await getNextLesson(session.user.id, productSlug!);

// Progresso agregado
const allProgress = await getProductProgressList(session.user.id);
const thisProgress = allProgress.find((p) => p.productSlug === productSlug);
---

<Layout title={`${product.name} — Área de Membros`}>
  <section class="py-20 px-6 min-h-screen">
    <div class="max-w-3xl mx-auto">
      <a href="/membros/" class="text-xs font-mono text-gray-600 hover:text-yellow-500 uppercase tracking-wider mb-8 inline-block">
        ← Voltar ao painel
      </a>
      <h1 class="text-3xl font-bold font-industrial text-white uppercase mb-2">
        {product.name}
      </h1>
      {thisProgress && (
        <p class="text-gray-500 text-sm font-mono mb-8">
          {thisProgress.completed} de {thisProgress.total} aulas concluídas · {thisProgress.percent}%
        </p>
      )}

      <ProductLessonList
        lessons={(lessons || []).map((l) => ({
          slug: l.slug,
          title: l.title,
          description: l.description || '',
          orderIndex: l.order_index,
          isFree: l.is_free,
          completed: completedSet.has(l.slug),
        }))}
        nextLessonSlug={next?.slug || null}
        client:load
      />
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Criar `ProductLessonList.tsx`**

Reutiliza o `LessonCard` existente ajustado (Task 9). Recebe a lista, destaca `nextLessonSlug` no topo como "Próxima aula", depois lista todas.

---

## Task 8: Reescrever `/membros/index.astro` (SSR do hub)

**Files:**
- Modify: `src/pages/membros/index.astro`

- [ ] **Step 1: Consolidar dados com helpers novos**

```astro
---
export const prerender = false;

import Layout from '../../layouts/Layout.astro';
import Dashboard from '../../components/membros/Dashboard';
import { getUserProfile } from '../../lib/auth';
import { getEnrolledCohorts } from '../../lib/cohorts';
import { getProductProgressList, getMostRecentProduct, getNextLesson } from '../../lib/progress';
import { supabase } from '../../lib/supabase';

const session = Astro.locals.session!;
const profile = await getUserProfile(session.user.id);
const products = await getProductProgressList(session.user.id);
const cohorts = await getEnrolledCohorts(session.user.id);

// Continue from
let continueFrom = null;
if (products.length > 0) {
  const recentSlug = await getMostRecentProduct(session.user.id);
  if (recentSlug) {
    const next = await getNextLesson(session.user.id, recentSlug);
    const prod = products.find((p) => p.productSlug === recentSlug);
    if (next && prod) {
      continueFrom = {
        productSlug: recentSlug,
        productName: prod.productName,
        nextLessonSlug: next.slug,
        nextLessonTitle: next.title,
        completed: prod.completed,
        total: prod.total,
        percent: prod.percent,
      };
    }
  }
}

// Free starter (quando não tem nenhum produto)
let freeStarter = null;
if (products.length === 0) {
  const { data: firstFree } = await supabase
    .from('lessons')
    .select('slug, title, description')
    .eq('is_free', true)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (firstFree) {
    freeStarter = {
      slug: firstFree.slug,
      title: firstFree.title,
      description: firstFree.description || '',
    };
  }
}

const isAdmin = profile?.role === 'admin';
const acesso = Astro.url.searchParams.get('acesso');
const compra = Astro.url.searchParams.get('compra');
const msgParam = Astro.url.searchParams.get('msg');
const mensagem = acesso === 'bloqueado' ? 'bloqueado'
  : compra === 'sucesso' ? 'sucesso'
  : msgParam === 'senha-atualizada' ? 'senha-atualizada'
  : null;
---

<Layout title="Área de Membros — Ricardo Tocha">
  <section class="py-20 px-6 min-h-screen">
    <Dashboard
      name={profile?.name || ''}
      isAdmin={isAdmin}
      products={products}
      continueFrom={continueFrom}
      freeStarter={freeStarter}
      cohorts={cohorts}
      mensagem={mensagem}
      client:load
    />
  </section>
</Layout>
```

---

## Task 9: Adicionar estado "bloqueada-sequencial" em `LessonCard.tsx`

**Files:**
- Modify: `src/components/membros/LessonCard.tsx`

- [ ] **Step 1: Adicionar prop `sequentialLocked`**

Quando `sequentialLocked = true`, mostra o mesmo visual de "locked" mas com mensagem clara:
"Complete a aula anterior para desbloquear"

```tsx
if (sequentialLocked) {
  return (
    <div className="bg-[#111] border border-gray-800 p-6 opacity-50 relative">
      <div className="flex items-start gap-4">
        <Lock className="w-5 h-5 text-gray-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-industrial text-white uppercase text-sm mb-1">{title}</h3>
          <p className="text-gray-600 text-xs font-mono uppercase">
            Complete a aula anterior para desbloquear
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 10: `/membros/minha-conta` exibe role

**Files:**
- Modify: `src/pages/membros/minha-conta.astro`

- [ ] **Step 1: Passar `role` para o formulário**

```astro
<MinhaContaForm
  name={profile.name || ''}
  email={profile.email}
  whatsapp={profile.whatsapp}
  createdAt={profile.created_at}
  role={profile.role}          {/* ← adicionar */}
  erro={erro}
  msg={msg}
  client:load
/>
```

- [ ] **Step 2: Exibir badge em `MinhaContaForm.tsx`**

Perto do título "Dados da Conta", adicionar:

```tsx
{role === 'admin' && (
  <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 ml-2">
    ADMIN
  </span>
)}
```

---

## Task 11: Testes E2E manuais

- [ ] **Step 1: Aluno SEM acesso vê FreeStarterCard + CTA compra**

Criar `test@tocha.dev`. Logar → `/membros/` deve mostrar:
- Card "Comece grátis" com Módulo 1 no topo
- Nenhum produto listado
- CTA de compra

- [ ] **Step 2: Aluno COM acesso vê hub + continue**

Logar com `aluno@tocha.dev`. `/membros/` deve mostrar:
- ContinueCard no topo com "Próxima aula: Módulo 1 — A Oportunidade"
- 1 card "Máquina de Produção de Vídeos" com 0/7 · 0%
- Sem FreeStarterCard

- [ ] **Step 3: Navegação sequencial funciona**

Marcar Módulo 1 como concluído. Voltar ao hub. ContinueCard deve apontar pra Módulo 2.
Tentar abrir `/membros/aulas/como-vender/` direto → middleware redireciona pra `demonstracao/?redirected=sequencial`.

- [ ] **Step 4: Admin tem link Admin no hub**

Logar como `admin@tocha.dev`. Hub deve mostrar link "Admin" no footer.

- [ ] **Step 5: Minha Conta mostra badge ADMIN**

Logar como admin. `/membros/minha-conta/` deve mostrar badge amarelo ADMIN ao lado do título.

- [ ] **Step 6: Retroatividade**

Antes do deploy em prod, para cada usuário real: se alguém tem aulas concluídas fora de ordem, validar que elas aparecem desbloqueadas (regra "completou antes, fica livre").

---

## Task 12: Verificação final

- [ ] **Step 1: Typecheck limpo**

```bash
cd /Users/tocha/Dev/sites/tocha-site
npx tsc --noEmit
```

- [ ] **Step 2: Build limpo**

```bash
npm run build
```

- [ ] **Step 3: Commit por task**

Convencionado: 1 commit por Task concluída.

```
feat: helpers de progresso de aula (fase 4.1)
feat: middleware com bloqueio sequencial e acesso por produto (fase 4.2)
feat: componentes do hub (ProductHubCard, ContinueCard, FreeStarterCard) (fase 4.3)
feat: Dashboard reescrito como hub produto-cêntrico (fase 4.4)
feat: página /membros/p/[slug] com trilha sequencial (fase 4.5)
feat: estado bloqueada-sequencial em LessonCard (fase 4.6)
feat: Minha Conta exibe badge de role (fase 4.7)
```

---

## Rollback plan

Se descobrir problema grave em produção:
1. Reverter commits da fase 4.x — o schema não mudou, nenhuma migration nova
2. Dashboard antigo + middleware antigo voltam a funcionar imediatamente

## Notas de migração de dados

**Nenhuma.** Nem mesmo seed: aulas já têm `order_index`, `product_slug` e `is_free` atribuídos via migrations 20260414144417 e 20260414144617.
