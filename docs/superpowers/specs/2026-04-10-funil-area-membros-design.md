# Funil de Vídeos + Área de Membros — Máquina de Vídeos com IA

**Data:** 2026-04-10
**Produto:** Máquina de Produção de Vídeos com IA (infoproduto, atualmente no Hotmart)
**Objetivo:** Criar funil de educação com 4 portas de entrada + área de membros própria para substituir o Hotmart

---

## 1. Visão Geral

Monolito no tocha-site existente. Astro hybrid rendering — páginas públicas estáticas, área de membros com SSR. Supabase para auth/banco, Stripe para pagamento, Cloudflare Pages para deploy.

### Fluxo completo do lead

```
Landing page por persona (4)
    → Página de captura (pré-cadastro: nome, email, WhatsApp)
        → Módulo 1: A Oportunidade (vídeo público)
            → Módulo 2: Demonstração (vídeo público)
                → Módulo 3: Como Vender (vídeo público)
                    → Página de oferta (CTA duplo: comprar OU cadastro grátis)
                        → Stripe Checkout (compra)
                        → Área de membros gratuita (cadastro)
```

---

## 2. Funil — 4 Landing Pages por Persona

Cada página foca em uma dor específica e leva à página de captura.

| Rota | Persona | Dor principal |
|------|---------|---------------|
| `/video-ia/criadores/` | Criador de conteúdo solo | Gasta horas editando, não escala |
| `/video-ia/agencias/` | Agência de marketing | Terceiriza vídeo, perde margem |
| `/video-ia/freelancers/` | Freelancer/empreendedor | Quer negócio sem aluguel e sem equipe fixa |
| `/video-ia/social-media/` | Social media manager | Demanda de reels/shorts explodiu, não dá conta |

### Estrutura de cada landing page

1. **Hero** — dor específica da persona + promessa
2. **Problema** — cenário atual detalhado (identificação)
3. **Solução** — como a Máquina de Vídeos resolve essa dor
4. **Prova** — 1-2 resultados/números relevantes
5. **CTA** — "Veja como funciona" → `/video-ia/cadastro/`

---

## 3. Funil — Página de Captura

**Rota:** `/video-ia/cadastro/`

Formulário leve com:
- Nome
- Email
- WhatsApp
- 26 campos ocultos (padrão GTM do projeto)

Após submit:
- `dataLayer.push` com evento `form_submit_lead`
- POST para Apolo CRM (via proxy worker existente)
- Redireciona para `/video-ia/oportunidade/`

---

## 4. Funil — 3 Páginas de Vídeo (públicas)

Conteúdo baseado nos roteiros existentes em `docs/roteiros-videos-ia/`.

| Rota | Módulo | Conteúdo | Origem |
|------|--------|----------|--------|
| `/video-ia/oportunidade/` | 1 | A oportunidade: ROI, mercado, pra quem é | Roteiro Módulo 1 |
| `/video-ia/demonstracao/` | 2 | Demo ao vivo do pipeline completo | Roteiro Módulo 2 |
| `/video-ia/como-vender/` | 3 | Aquisição de clientes com Apolo | Roteiro Módulo 3 |

Cada página tem:
- Vídeo embed (YouTube não-listado ou Bunny Stream)
- Resumo em texto abaixo do vídeo
- CTA no final → próxima página do funil
- Última página (como-vender) → `/video-ia/oferta/`

---

## 5. Funil — Página de Oferta

**Rota:** `/video-ia/oferta/`

Pitch final com dois CTAs:
- **"Quero a Máquina"** → Stripe Checkout (compra direta)
- **"Quero ver mais conteúdo grátis"** → `/membros/cadastro/` (cadastro na área de membros)

Conteúdo da página:
- Recapitulação da proposta de valor
- O que está incluso (66 arquivos, 8 skills, estrutura de pastas)
- Preço: 12x R$92,98
- Garantia de 7 dias

---

## 6. Área de Membros — Rotas e Acesso

### Rotas públicas (sem auth)

```
/membros/login/              → Login (email + senha)
/membros/cadastro/           → Cadastro (nome, email, WhatsApp, senha)
/membros/recuperar-senha/    → Reset de senha via Supabase
```

### Rotas protegidas — conteúdo gratuito (auth required)

```
/membros/                        → Dashboard
/membros/aulas/oportunidade/     → Módulo 1 (vídeo + resumo)
/membros/aulas/demonstracao/     → Módulo 2 (vídeo + resumo)
/membros/aulas/como-vender/      → Módulo 3 (vídeo + resumo)
```

### Rotas protegidas — conteúdo pago (auth + paid=true)

```
/membros/maquina/introducao/     → Setup da máquina (vídeo + texto)
/membros/maquina/skills/         → Explicação das 8 skills do Claude
/membros/maquina/workflow/       → Fluxo completo de produção
/membros/maquina/download/       → Download do ZIP com 66 arquivos
```

---

## 7. Área de Membros — Dashboard

Tela após login com:
- Saudação com nome do aluno
- Seção "Conteúdo Gratuito" — cards das 3 aulas com status (assistida/não assistida/bloqueada)
  - Liberação sequencial: assiste 1 → desbloqueia 2 → assiste 2 → desbloqueia 3
- Seção "Máquina de Vídeos com IA" — visível mas bloqueada se `paid=false`
  - CTA "Desbloquear acesso completo" → Stripe Checkout
  - Se `paid=true` → cards das aulas pagas com progresso

---

## 8. Stack Técnica

### Mudanças no Astro

- `output: 'static'` → `output: 'hybrid'`
- Adicionar adapter `@astrojs/cloudflare`
- Páginas públicas: `prerender = true` (padrão)
- Páginas `/membros/*`: `prerender = false` (SSR)

### Supabase

| Tabela | Campos |
|--------|--------|
| `profiles` | `id`, `email`, `name`, `whatsapp`, `paid`, `created_at` |
| `lesson_progress` | `id`, `user_id`, `lesson_slug`, `completed_at` |
| `payments` | `id`, `user_id`, `stripe_session_id`, `amount`, `status`, `created_at` |

- Row Level Security (RLS) ativo — cada usuário acessa apenas seus dados
- Supabase Auth com email + senha
- Sessão via cookie gerenciado pelo Supabase client (server-side)

### Stripe

- Stripe Checkout (hosted) — redirect, não embedded
- Suporte a Pix, cartão e boleto (Stripe Brasil)
- Price configurado no dashboard: 12x R$92,98
- Webhook: `checkout.session.completed`

### Webhook Worker

Cloudflare Worker dedicado (ex: `stripe-webhook.rapricardo.workers.dev`):

1. Recebe POST do Stripe
2. Valida assinatura (`stripe-signature` header)
3. Extrai `customer_email` do evento
4. UPDATE no Supabase: `profiles.paid = true` onde `email = customer_email`
5. Retorna 200

Stripe reenvia automaticamente em caso de falha (até 3 dias).

### Hospedagem de vídeos

YouTube não-listado ou Bunny Stream (decisão posterior, não impacta arquitetura).

---

## 9. Middleware Astro

Arquivo: `src/middleware.ts`

Lógica:

1. Rota é `/membros/login`, `/membros/cadastro` ou `/membros/recuperar-senha`? → Passa direto
2. Rota começa com `/membros/`? → Verifica cookie de sessão Supabase
   - Sem sessão → Redireciona para `/membros/login/`
   - Com sessão + rota `/membros/maquina/*` + `paid=false` → Redireciona para `/membros/` com mensagem
   - Com sessão + acesso permitido → Passa

---

## 10. Estrutura de Arquivos (novas adições)

```
src/
├── pages/
│   ├── video-ia/
│   │   ├── criadores.astro
│   │   ├── agencias.astro
│   │   ├── freelancers.astro
│   │   ├── social-media.astro
│   │   ├── cadastro.astro
│   │   ├── oportunidade.astro
│   │   ├── demonstracao.astro
│   │   ├── como-vender.astro
│   │   └── oferta.astro
│   ├── membros/
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── cadastro.astro
│   │   ├── recuperar-senha.astro
│   │   ├── aulas/
│   │   │   ├── oportunidade.astro
│   │   │   ├── demonstracao.astro
│   │   │   └── como-vender.astro
│   │   └── maquina/
│   │       ├── introducao.astro
│   │       ├── skills.astro
│   │       ├── workflow.astro
│   │       └── download.astro
├── middleware.ts
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── components/
│   ├── membros/
│   │   ├── Dashboard.tsx
│   │   ├── LoginForm.tsx
│   │   ├── CadastroForm.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── LessonCard.tsx
│   └── funil/
│       ├── PersonaHero.tsx
│       └── CapturaForm.tsx
```

---

## 11. Tracking e GTM

### Formulários com 26 campos ocultos

| Formulário | Rota | Campos ocultos | dataLayer push |
|-----------|------|----------------|----------------|
| Pré-cadastro funil | `/video-ia/cadastro/` | ✅ | `form_submit_lead` |
| Cadastro membros | `/membros/cadastro/` | ✅ | `form_submit_lead` |
| Login | `/membros/login/` | ❌ | ❌ |

### Eventos GTM adicionais

```javascript
dataLayer.push({ event: 'video_view', video_module: 'oportunidade' })
dataLayer.push({ event: 'lesson_complete', lesson_slug: 'demonstracao' })
dataLayer.push({ event: 'begin_checkout', value: 927.80, currency: 'BRL' })
dataLayer.push({ event: 'purchase', value: 927.80, currency: 'BRL' })
```

### Fluxo de atribuição

`tracking.js` captura UTMs na landing page → persiste em `sessionStorage` (`__wl_tracking`) → incluído nos formulários de pré-cadastro e cadastro → dados salvos no Supabase + Apolo CRM → atribuição completa até o evento `purchase`.

---

## 12. Fora do escopo (MVP)

- Módulo 4 (custos/Claude Max) — pode virar conteúdo bônus depois
- Comunidade/fórum entre alunos
- Certificado de conclusão
- Gamificação
- Emails automáticos de onboarding (pode ser adicionado via Supabase Edge Functions depois)
- Login social (Google, GitHub) — apenas email + senha no MVP
