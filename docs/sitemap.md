# Sitemap — Agency Shield AI

## Páginas

### / (Home) — Landing Page
Página única (one-page) com seções:

1. **Hero** — headline principal, CTA
2. **PainCycle** — O Ciclo da Morte da Agência (3 steps)
3. **Solution** — O que entregamos (4 deliverables)
4. **BusinessModel** — Como funciona a parceria (2 colunas)
5. **Authority** — Sobre o fundador
6. **FAQ** — Perguntas frequentes (accordion, React)
7. **ContactForm** — Formulário de aplicação (React)
8. **Footer** — Copyright (no Layout)

## Componentes

| Componente | Tipo | Interatividade |
|-----------|------|---------------|
| Hero.astro | section | Não (scroll to CTA) |
| PainCycle.astro | section | Não |
| Solution.astro | section | Não |
| BusinessModel.astro | section | Não |
| Authority.astro | section | Não |
| FAQ.tsx | section | Sim (accordion) — `client:visible` |
| ContactForm.tsx | section | Sim (form) — `client:load` |
| Layout.astro | layout | Não |
