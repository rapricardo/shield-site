# Melhorias da Área do Aluno — Design Spec

**Data:** 2026-04-16
**Status:** Especificação aprovada

## 1. Visão geral

Reorganização da área de membros para um modelo **produto-cêntrico** com trilha pedagógica sequencial e progresso visível. O dashboard atual (lista plana de aulas) vira um **hub** com cards de produtos, e cada produto vira uma página com suas próprias aulas em trilha.

## 2. Decisões de produto (alinhadas com Ricardo Tocha)

| Decisão | Escolha |
|---|---|
| Navegação por produto | Hub com cards → página do produto |
| Escopo da liberação sequencial | Todos os módulos do produto (pagos e gratuitos) |
| Bloqueio de URL direta de aula bloqueada | Middleware redireciona pra próxima disponível |
| Integração de lives no produto | Separado (mantém `/membros/lives/`) |
| "Continuar de onde parou" | Card de destaque no topo do hub |
| Comportamento quando aluno não tem nenhum acesso | Card "Comece grátis" (Módulo 1) + CTA de compra |
| Certificado de conclusão | Fora deste plano |
| Comentários por aula | Fora deste plano |
| Busca/filtro de aulas | Fora deste plano |
| Notificação in-app de lives | Fora deste plano |

## 3. Arquitetura de rotas

### Novas rotas
```
/membros/                             ← Hub (grade de cards de produto + "continuar de onde parou")
/membros/p/[productSlug]/             ← Página do produto (aulas em trilha sequencial)
```

### Rotas mantidas (com ajustes)
```
/membros/aulas/[lessonSlug]           ← Mantém; middleware agora valida sequencial
/membros/lives                        ← Sem mudança
/membros/lives/[id]                   ← Sem mudança
/membros/minha-conta                  ← Passa a exibir role
/admin/*                              ← Sem mudança (link visível no hub quando isAdmin)
```

## 4. Modelo de dados

**Nenhuma migration necessária.** O schema atual já suporta tudo:

- `lessons.order_index` + índice `idx_lessons_product_order (product_slug, order_index)` — usado para determinar sequência
- `lessons.product_slug` FK para `products.slug` — aulas já são vinculadas a produto
- `lesson_progress (user_id, lesson_slug)` UNIQUE — fonte de verdade de aulas concluídas
- `user_access (user_id, product_slug)` UNIQUE — fonte de verdade de acesso por produto

### Regra de liberação sequencial

Uma aula `L` (em um produto P, com `order_index = N`) está **desbloqueada** para o aluno `U` se pelo menos uma condição for verdadeira:

1. `U` tem `user_access` para `P` E `N = 0` (primeira aula está sempre desbloqueada)
2. Existe `lesson_progress(U, L.slug)` — o aluno JÁ concluiu essa aula antes (compatibilidade retroativa; quem estava avançado não regride)
3. Existe `lesson_progress(U, L_anterior.slug)` onde `L_anterior` é a aula do mesmo produto com `order_index = N - k` (menor order_index disponível com k >= 1)

Aulas com `is_free = true` seguem a mesma regra, mas não exigem `user_access`.

### "Próxima aula" de um produto

Primeira aula (menor `order_index`) do produto que **não** tem `lesson_progress` para o aluno. Se todas foram concluídas, retorna `null` (produto finalizado).

### "Produto mais recente" (heurística de continuar)

1. Buscar `max(completed_at)` de `lesson_progress` do aluno, joined com `lessons.product_slug`
2. Se existe: esse é o produto mais recente
3. Se não existe (aluno comprou mas não assistiu nada): pega `max(granted_at)` de `user_access`
4. Se nem isso: `null` (hub não mostra card de "continuar")

## 5. Layout do Hub (`/membros/`)

```
┌──────────────────────────────────────────────────┐
│  Bem-vindo, Aluno Teste                  [ADMIN] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ▶ CONTINUAR DE ONDE PAROU                       │
│  ┌──────────────────────────────────────────┐    │
│  │ Máquina de Vídeos com IA                 │    │
│  │ Próxima aula: Módulo 2 — Demonstração    │    │
│  │ 2 de 7 aulas concluídas  [▓▓░░░░░] 28%   │    │
│  │                         [▶ CONTINUAR]    │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ▶ MEUS PRODUTOS                                 │
│  ┌──────────────────────────────────────────┐    │
│  │ Máquina de Vídeos com IA      [2/7 • 28%]│    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Lives · Minha Conta · Admin · Sair              │
└──────────────────────────────────────────────────┘
```

### Estado "aluno sem acesso"
```
┌──────────────────────────────────────────────────┐
│  Bem-vindo, Aluno Teste                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ▶ COMECE GRATUITO                               │
│  ┌──────────────────────────────────────────┐    │
│  │ Módulo 1 — A Oportunidade                │    │
│  │ Como IA muda a produção de vídeo         │    │
│  │ [▶ ASSISTIR GRATUITO]                    │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ▶ DESBLOQUEIE O CONTEÚDO COMPLETO               │
│  [CTA grande: Adquirir acesso — 12x R$92,98]     │
│                                                  │
│  Minha Conta · Sair                              │
└──────────────────────────────────────────────────┘
```

## 6. Layout da página de produto (`/membros/p/{slug}/`)

```
┌──────────────────────────────────────────────────┐
│  ← Voltar ao painel                              │
│                                                  │
│  MÁQUINA DE VÍDEOS COM IA                        │
│  2 de 7 aulas concluídas  [▓▓░░░░░] 28%          │
│                                                  │
│  ▶ PRÓXIMA AULA                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ Módulo 2 — Demonstração      [▶ ASSISTIR]│    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ▶ TODAS AS AULAS                                │
│  [✓] Módulo 1 — A Oportunidade          [concluído]
│  [▶] Módulo 2 — Demonstração            [disponível]
│  [🔒] Módulo 3 — Como Vender            [bloqueada]
│  [🔒] A Máquina — Introdução            [bloqueada]
│  [🔒] A Máquina — Skills                [bloqueada]
│  ...                                             │
└──────────────────────────────────────────────────┘
```

## 7. Middleware

### Mudanças em `src/middleware.ts`

Nova checagem para rotas `/membros/aulas/[slug]`:

1. Buscar `lesson` pelo slug → pegar `product_slug` e `order_index`
2. Se `lesson` não existe → 404
3. Se lesson não é gratuita E aluno não tem `user_access` pro `product_slug` → redireciona pra `/membros/?acesso=bloqueado`
4. Se lesson não é a primeira (`order_index > 0`) E aluno não concluiu a anterior → redireciona pra próxima aula disponível com query param `?redirected=sequencial`

Nova checagem para rotas `/membros/p/[slug]`:

1. Se produto não existe → 404
2. Se aluno não tem `user_access` E produto não é "comece grátis" → redireciona pra `/membros/?acesso=bloqueado`

## 8. Estrutura de arquivos

### Novos arquivos
```
src/lib/
  ├── progress.ts             ← getNextLesson, getProductProgress, getMostRecentProduct
src/pages/membros/
  ├── p/
  │   └── [productSlug].astro ← Página do produto
src/components/membros/
  ├── ProductHubCard.tsx      ← Card do produto (nome, progresso, barra)
  ├── ContinueCard.tsx        ← Card destacado "Continuar de onde parou"
  ├── FreeStarterCard.tsx     ← Card quando aluno não tem nada
  └── ProductLessonList.tsx   ← Lista de aulas com estado sequencial
```

### Arquivos alterados
```
src/middleware.ts                            ← Bloqueio sequencial + acesso por produto
src/components/membros/Dashboard.tsx         ← Reescrito como hub
src/components/membros/LessonCard.tsx        ← Estado "bloqueada-sequencial"
src/pages/membros/index.astro                ← SSR do hub
src/pages/membros/minha-conta.astro          ← Exibe role
```

## 9. Fora de escopo (explicitamente)

- Certificado de conclusão (entra em plano futuro)
- Comentários/dúvidas por aula (responde via WhatsApp/email)
- Busca/filtro de aulas
- Notificação in-app de nova live (cron de email já resolve)
- Player avançado (retomar timestamp, velocidade) — YouTube embed mantido
- Lives dentro da página do produto
- Multi-cohort: card de cohort permanece como hoje no dashboard quando `enrolledCohorts.length > 0`
