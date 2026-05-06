# Sitemap — Ricardo Tocha

## Páginas

### / (Home) — Hub institucional e diagnóstico
Página principal com seções:

1. **Hero** — tese principal e CTA de diagnóstico
2. **Diagnóstico** — problemas de visibilidade, talento e margem
3. **Infraestrutura** — arsenal de produtos/soluções conectadas
4. **Cases** — provas de conceito e unit economics
5. **Autoridade** — sobre Ricardo Tocha
6. **Formulário** — aplicação para auditoria/intervenção
7. **Footer** — links para soluções e copyright

## Componentes

| Componente | Tipo | Interatividade |
|-----------|------|---------------|
| Layout.astro | layout | Não |
| TrackingHiddenFields.astro | form helper | Não |
| ContactForm.tsx | form | Sim — `client:load` |
| FAQ.tsx | section | Sim — `client:visible` |

## Areas

- **Public site:** home e paginas de servico.
- **Funnels:** `/video-ia/*`.
- **Members:** `/membros/*`.
- **Admin:** `/admin/*`.
- **Platform:** Supabase, Asaas, Workers, tracking e emails.
