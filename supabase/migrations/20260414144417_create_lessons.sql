-- Tabela de aulas/lições (substitui arquivos .astro hardcoded)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'video' | 'download' | 'text' | 'live_replay'
  content_ref TEXT, -- youtube_id | storage_path | markdown
  summary_md TEXT,
  order_index INT NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'geral',
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_slug, slug)
);

-- Index pra busca rápida por slug (quando não filtramos por product_slug)
CREATE INDEX idx_lessons_slug ON public.lessons(slug);
CREATE INDEX idx_lessons_product_order ON public.lessons(product_slug, order_index);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Todos leem todas as aulas (conteúdo em si é gate no app, não no DB)
-- Isso simplifica queries e permite mostrar cards de aulas bloqueadas
CREATE POLICY "Qualquer um lê lessons"
  ON public.lessons FOR SELECT
  USING (true);
