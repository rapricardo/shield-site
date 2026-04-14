-- Adicionar tipo, categoria, descrições e bundle
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'infoproduct',
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'geral',
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_path TEXT,
  ADD COLUMN IF NOT EXISTS includes_products TEXT[] DEFAULT '{}'::TEXT[];

-- Valores permitidos (documentados, sem constraint rigída pra flexibilidade):
-- type: 'infoproduct' | 'mentoring' | 'live_access'
-- category: 'empreendedor' | 'empregado' | 'geral'

-- Atualizar produto existente com descrição e categoria
UPDATE public.products
SET
  type = 'infoproduct',
  category = 'geral',
  short_description = 'Pipeline completo de produção de vídeo com IA — do roteiro à timeline.',
  long_description = '66 arquivos organizados: skills, templates, configurações e exemplos prontos para uso. Extraia, configure o Claude e comece a produzir vídeos profissionais.'
WHERE slug = 'maquina-videos';
