# Agency Shield AI — Site Project

## Project Info

- **Client:** Ricardo Tocha
- **Domain:** ricardotocha.com.br
- **Repo:** rapricardo/shield-site
- **CF Pages:** shield-site.pages.dev
- **Linear Project:** Thanos
- **Status:** development

## Stack

- **Framework:** Astro 5.x (static output, no SSR)
- **CSS:** Tailwind 4 via `@tailwindcss/vite` — DO NOT install `@astrojs/tailwind`
- **TypeScript:** strict mode (`astro/tsconfigs/strict`)
- **Images:** `src/assets/` for optimized images, `public/` only for favicon/robots/OG
- **Hosting:** Cloudflare Pages (auto-deploy from git)

## Project Structure

```
src/
├── pages/           ← File-based routing. One .astro file = one route.
├── components/
│   ├── common/      ← Header.astro, Footer.astro, Nav.astro, CTA.astro
│   └── sections/    ← Hero.astro, PainCycle.astro, Solution.astro, etc.
├── layouts/
│   └── Layout.astro ← HTML shell, <head>, global styles, <slot />
├── styles/
│   └── global.css   ← Tailwind import + @theme (brand fonts)
└── assets/          ← Images (processed by Sharp at build time)

docs/
├── brand.md         ← Brand guidelines, colors, typography, tone
├── sitemap.md       ← Site map with page hierarchy
├── research.md      ← Competitive research findings
└── copy/            ← Source of truth for page copy
    └── home.md

public/              ← Static passthrough (favicon.svg, robots.txt, og.png)
```

## Conventions — FOLLOW STRICTLY

### Files & naming
- Components: PascalCase (`HeroSection.astro`, `ContactForm.astro`)
- Pages: kebab-case (`about.astro`, `our-services.astro`)
- One component per file

### Styling
- Tailwind utility classes ONLY — no inline `style=""`, no custom CSS files
- Brand tokens defined in `src/styles/global.css` via `@theme {}`
- In scoped `<style>` blocks, use `@reference "../styles/global.css"` before `@apply`
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)

### Content
- Page copy source of truth: `docs/copy/[page].md`
- NEVER invent or modify copy without explicit approval
- If copy file doesn't exist for a page, ask before writing content

### Images
- ALWAYS place in `src/assets/` (gets Sharp optimization)
- Use Astro `<Image />` component (auto WebP, srcset, CLS prevention)
- `public/` only for: favicon, robots.txt, og:image, files needing fixed URLs
- Alt text is MANDATORY on every image

### Layouts
- Every page MUST use `Layout.astro`
- Layout handles: `<html>`, `<head>`, meta tags, global styles, footer
- Pages only provide content via `<slot />`

### Astro-specific
- Prefer `.astro` components over framework components (React/Vue/Svelte)
- Use framework components ONLY when client-side interactivity is required
- Use `client:load` / `client:visible` directives sparingly
- Run `astro check` before every commit to catch type errors

## Git Workflow

```
main      → production (auto-deploy to custom domain)
staging   → preview (staging.shield-site.pages.dev)
feat/*    → preview (feat-*.shield-site.pages.dev)
```

- Work on `staging` branch by default
- Feature branches for isolated changes: `feat/<linear-issue-id>-<slug>`
- NEVER push directly to `main`
- Merge to `main` only after human approval

### Commit messages
- Format: `type: description` (lowercase)
- Types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`
- Example: `feat: add hero section to home page`
- Reference Linear issues: `feat: add contact form (RIC-42)`

## DO NOT

- Install new npm packages without explicit approval
- Modify `astro.config.mjs` or `tsconfig.json` without approval
- Create files outside the defined structure
- Use React/Vue/Svelte unless the page specifically needs client-side JS
- Write custom CSS when Tailwind utilities exist
- Use `@astrojs/tailwind` integration (deprecated — we use `@tailwindcss/vite`)
- Push to `main` directly
- Invent page copy — always reference `docs/copy/`
- Leave images without alt text
- Use `public/` for images that should be optimized

## Brand

See `docs/brand.md` for:
- Color palette (primary, secondary, accent, neutral)
- Typography (headings, body, UI)
- Tone of voice

## Pages

See `docs/sitemap.md` for the complete page list and hierarchy.
