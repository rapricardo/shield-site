-- =============================================
-- Seed: migrar aulas hardcoded para a tabela lessons
-- =============================================

-- Aulas GRATUITAS (is_free = true)
-- Originalmente em src/pages/membros/aulas/*.astro

INSERT INTO public.lessons (product_slug, slug, title, description, type, content_ref, summary_md, order_index, category, is_free)
VALUES
(
  'maquina-videos',
  'oportunidade',
  'Módulo 1 — A Oportunidade',
  'Como IA muda a produção de vídeo e o ROI do negócio',
  'video',
  'GcP5vICEyvs',
  $md$A produção de vídeo tradicional força uma escolha entre custo alto (equipe + equipamento), tempo alto (fazer sozinho) ou imprevisibilidade (freelancers). A IA elimina esse trilema.

Com o pipeline certo, você produz vídeos profissionais por ~R$100/minuto e vende a R$300-400/minuto. Margem de 67-75% sem aluguel, sem equipe fixa, sem estoque.

Comparação: investimentos tradicionais rendem ~12% ao ano. Um projeto de vídeo com IA pode render 300% em um dia de trabalho.$md$,
  1,
  'empreendedor',
  true
),
(
  'maquina-videos',
  'demonstracao',
  'Módulo 2 — Demonstração',
  'Demonstração ao vivo do pipeline completo de produção de vídeo com IA',
  'video',
  'SI-qfzxaivw',
  $md$Demonstração ao vivo e sem cortes do pipeline completo. Claude configura o projeto, escreve o roteiro, gera a narração com timestamps, monta o storyboard visual, gera imagens com referência encadeada, cria clips de vídeo, efeitos sonoros e exporta a timeline para DaVinci/Premiere.

Você não precisa programar, desenhar ou editar até o editor abrir. Todo o processo é orquestrado por IA dentro de uma tarde.$md$,
  2,
  'empreendedor',
  true
),
(
  'maquina-videos',
  'como-vender',
  'Módulo 3 — Como Vender',
  'Estratégia de aquisição de clientes para produção de vídeo com IA',
  'video',
  'Ts6GOHZ0dZc',
  $md$Estratégia de aquisição de clientes usando o Apolo: busca ativa de negócios locais por nicho/cidade, filtro por WhatsApp, e abordagem com vídeo demo personalizado.

Monitoramento passivo de grupos de WhatsApp para palavras-chave de intenção. Combine volume (busca ativa), consistência (automação) e alta intenção (grupos).$md$,
  3,
  'empreendedor',
  true
)
ON CONFLICT (product_slug, slug) DO NOTHING;

-- Aulas PAGAS (is_free = false)
-- Originalmente em src/pages/membros/maquina/*.astro

INSERT INTO public.lessons (product_slug, slug, title, description, type, content_ref, summary_md, order_index, category, is_free)
VALUES
(
  'maquina-videos',
  'introducao',
  'A Máquina — Introdução',
  'Introdução ao pacote completo de produção de vídeo com IA',
  'video',
  'VIDEO_ID_AQUI',
  $md$Visão geral do pacote de 66 arquivos que compõem a Máquina. Estrutura de pastas, convenções de nomenclatura, e como cada peça se conecta para formar o pipeline completo de produção.

Você vai entender a arquitetura antes de tocar em qualquer arquivo — o que cada skill faz, onde ficam os assets, e como o projeto final é exportado para edição.$md$,
  10,
  'empreendedor',
  false
),
(
  'maquina-videos',
  'skills',
  'A Máquina — Skills',
  'As 8 skills que compõem o pipeline de produção de vídeo com IA',
  'video',
  'VIDEO_ID_AQUI',
  $md$Cada skill é um módulo especializado que o Claude executa dentro do pipeline. Juntas, cobrem todo o processo de produção:

1. Roteirização
2. Transcrição
3. Storyboard
4. Geração de imagens
5. Geração de vídeo
6. Efeitos sonoros
7. Narração
8. Composição$md$,
  11,
  'empreendedor',
  false
),
(
  'maquina-videos',
  'workflow',
  'A Máquina — Workflow Completo',
  'O fluxo completo de produção de vídeo com IA do início ao export',
  'video',
  'VIDEO_ID_AQUI',
  $md$O workflow completo conecta as 8 skills em sequência. Do briefing do cliente até o arquivo de timeline pronto para importar no DaVinci Resolve ou Premiere Pro.

Cada etapa alimenta a próxima automaticamente — o roteiro gera o storyboard, o storyboard guia as imagens, as imagens viram clips, e tudo converge na composição final com narração e efeitos sonoros sincronizados.$md$,
  12,
  'empreendedor',
  false
),
(
  'maquina-videos',
  'download',
  'A Máquina — Download',
  'Download do pacote completo de produção de vídeo com IA',
  'download',
  'maquina-videos.zip',
  $md$Baixe o pacote completo com 66 arquivos: skills, templates, configurações e exemplos prontos para uso.

Quick start:

1. Extraia o arquivo ZIP em uma pasta dedicada ao projeto
2. Abra o terminal na pasta e inicie o Claude Code com o projeto
3. Passe o briefing do cliente como primeiro prompt
4. Acompanhe a execução das skills e exporte a timeline final$md$,
  13,
  'empreendedor',
  false
)
ON CONFLICT (product_slug, slug) DO NOTHING;
