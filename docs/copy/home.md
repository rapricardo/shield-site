# Copy — Home Page

> Fonte da verdade da copy da home. Sempre que ajustar texto em `src/pages/index.astro`, atualizar este arquivo também.

## Fio condutor — 3 áreas

A home alinha a promessa em torno de **3 áreas** (vendas / atendimento / operação) — mesma base da bio. Cada peça reforça uma das 3:

| Área | Card "Onde está travando" | Produto principal | Caso real |
|------|---------------------------|-------------------|-----------|
| Vendas | 01. Diretoria não vê o que vende | Athena, Ângulo | IBREP |
| Atendimento | 02. Cliente espera mais do que aceita | Athena | REZULTZ (vendas+atendimento) |
| Operação | 03. Cada contratação derruba a margem | Mercúrio | PLANA AMBIENTAL |

Marketing aparece como bônus (Máquina de Produção) — não está nas 3 áreas principais mas é parte do portfólio.

## Ordem das seções

1. Hero
2. **Faixa amarela** — gancho para Operação Soberana (público PF)
3. Bio (autoridade rápida)
4. Diagnóstico (3 blocos de problema)
5. Casos reais
6. Infraestrutura (produtos)
7. Contato

## Nav (componente compartilhado: `src/components/Nav.astro`)

- Logo (link para "/")
- **Manifesto** (`/manifesto/`)
- **O Círculo** (`/circulo/`)
- **Login** (`/membros/login/`)
- CTA destacado em amarelo: **Fazer o teste** (`/quiz/`)

> Nav é "sério" — sem CTA agressivo de quiz no topo. O quiz aparece via faixa amarela e popups, não no menu.
> "Preços" foi removido do menu e a página `/precos/` foi deletada. Quando houver produto pago real estruturado, recriamos.

## Hero

**Pre-headline (badge):** Infraestrutura de IA para vendas B2B

**Headline:** Cresça **sem contratar** mais gente.

**Sub-headline:** Construo a infraestrutura de IA que resolve gargalos de **vendas, atendimento e operação** — sem precisar empilhar pessoas, planilhas e retrabalho.

**Social proof:** → Athena · Ângulo · Mercúrio — produtos próprios em produção

**CTA:** [ Falar comigo ] (âncora `#contato`)

**Sub-CTA:** * Para empresas com faturamento acima de R$ 5M/ano.

## Faixa amarela — gancho do quiz

Posiciona o funil PF logo após o Hero (que serve PJ). Fundo amarelo, texto preto.

**Frase principal:** Só 6% das pessoas no mundo usam IA de verdade. Você é uma delas?
**Frase de apoio:** Em 90 segundos, você descobre.
**CTA:** [ Fazer o teste → ] (link para `/quiz/`)

## Bio

**Tag:** Quem está por trás
**H2:** Sobre mim.

Ajudo empresas de serviços a aplicar IA em vendas, atendimento e operação para crescer com mais margem, menos retrabalho e menos dependência de contratação.

Uno visão comercial, produto, processos e código para transformar gargalos reais em sistemas que vendem, atendem e operam melhor.

## Onde está travando (3 blocos — uma área por card)

**Tag:** Onde está travando
**H2:** Sua operação está vazando. Em 3 lugares.

> Cada card mapeia uma das 3 áreas da bio (vendas / atendimento / operação) e conecta a um produto.

### 01. Sua diretoria não vê o que vende *(área: vendas — Athena/Ângulo)*
A negociação real acontece no WhatsApp, longe do CRM e fora do alcance da diretoria. Leads caros são perdidos sem ninguém saber por quê.

### 02. Seu cliente espera mais do que aceita *(área: atendimento — Athena)*
Tickets espalhados em e-mail, WhatsApp e planilha. SLAs descumpridos sem ninguém perceber. O cliente que custou caro pra entrar vai embora antes que você consiga resgatar.

### 03. Cada contratação derruba sua margem *(área: operação — Mercúrio)*
Crescer pelo CLT custa caro: salário, encargos, gestão e mais ruído na operação. A margem encolhe na mesma velocidade que o time aumenta.

## Casos reais (3 cases)

**Tag:** Prova de Conceito
**H2:** Casos reais.

Estrutura de cada case: três etiquetas — `O problema` / `O que fizemos` / `O resultado`.

### IBREP — Auditoria e Recuperação de Margem · *Vendas*
- **O problema:** Marketing entregava leads caros, mas a diretoria não tinha como saber quantos eram realmente atendidos nem como os corretores conduziam a conversa no WhatsApp.
- **O que fizemos:** Instalamos o Athena para auditar todas as conversas em tempo real e cruzar com o CRM. A diretoria passou a ver onde cada lead esfriava e onde cada corretor travava.
- **O resultado:** Tempo de resposta caiu de horas para minutos, conversão subiu e a diretoria parou de tomar decisão no escuro.

### REZULTZ — War Room de Vendas · *Vendas + Atendimento*
- **O problema:** Equipe comercial travada em planilhas dispersas e processos manuais. Gestores sem visão real de meta, carteira ou status de crédito de cada cliente.
- **O que fizemos:** Construímos uma sala de operação que junta meta, carteira, WhatsApp e análise de crédito numa tela só. Saíram as planilhas e as ferramentas soltas.
- **O resultado:** Receita e TPV crescendo de forma previsível, onboarding de cliente mais rápido e fim das análises manuais que travavam o ciclo.

### PLANA AMBIENTAL — Orquestração Agêntica · *Operação*
- **O problema:** Comercial, financeiro e produção rodavam em planilhas e softwares desconectados. Prazo perdido virou rotina, e a margem caía a cada nova obra.
- **O que fizemos:** Conectamos os três departamentos num fluxo só, com IA executando as etapas repetitivas de ponta a ponta — proposta, ordem de serviço, faturamento.
- **O resultado:** O trabalho de um departamento inteiro passou a caber em um único operador. Folha estacionou, volume de entregas multiplicou.

## Infraestrutura (4 produtos)

**Tag:** A Infraestrutura
**H2:** A tecnologia que cresce a receita sem inflar a folha.

> Apex MKT foi removido da home (não está no foco atual). Página `/operacoes-marketing-ia/` segue viva caso seja retomado depois.

### Athena — Auditoria de WhatsApp comercial · *Vendas + Atendimento*
**Domínio:** athena.app.br
Lê e analisa 100% das conversas de vendas no WhatsApp em tempo real. Cruza com o CRM e mostra à diretoria onde o time está ganhando, onde está perdendo e o que falar com cada lead.

CTAs: `Conhecer o Athena` (`/auditoria-comercial-ia/`) · `Acessar SaaS` (athena.app.br)

### Ângulo — Prospecção em grupos de WhatsApp · *Vendas*
**Domínio:** angulo.ia.br
Monitora grupos de WhatsApp 24/7, identifica quem está pronto para comprar e manda mensagem no direct na hora. Sem custo por clique, sem SDR no telefone.

CTAs: `Conhecer o Ângulo` (`/prospeccao-whatsapp-ia/`) · `Acessar SaaS` (angulo.ia.br)

### Mercúrio — ERP/CRM unificado por IA · *Operação*
**Domínio:** mercurio.ia.br
Do comercial ao financeiro num fluxo só: proposta, execução e faturamento ligados, sem planilhas paralelas e sem retrabalho.

CTAs: `Conhecer o Mercúrio` (`/gestao-integrada-ia/`) · `Acessar SaaS` (mercurio.ia.br)

### Máquina de Produção — Vídeo com IA · *Marketing*
**Domínio:** Pipeline interno
De uma ideia ao vídeo pronto: roteiro, storyboard, imagens, clipes, efeitos e timeline montada. Tudo orquestrado por IA.

CTA: `Conhecer a Máquina` (`/video-ia/`)

## Contato

**ID da seção:** `#contato`
**Tag:** Contato
**H2:** Vamos conversar.
**Sub:** Conta o que você precisa. Te respondo no WhatsApp em breve.

### Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `name` | text | sim |
| `company` | text | não |
| `whatsapp` | tel | sim |
| `email` | email | sim |
| `message` | textarea | não — placeholder: "Escreva à vontade. Ou só mande oi e a gente conversa." |

**CTA:** [ Enviar contato ]
**Selo:** Suas informações são confidenciais.

### Estados do formulário
- **Sucesso:** "Recebido." / "Te chamo no WhatsApp em breve."
- **Erro:** "Erro ao enviar. Tente novamente."
- **Loading do botão:** "Enviando..."

### Integração
- Endpoint: `https://apolo-lead-proxy.rapricardo.workers.dev`
- `payload.source = "tocha_home_contato"`
- Roteamento esperado: o worker direciona esse `source` para o **Ângulo** (IA de prospecção via WhatsApp), que faz o primeiro contato.
- Campos ocultos GTM via `<TrackingHiddenFields />` (padrão 26 campos — ver raiz `DOCUMENTACAO_Campos_Ocultos_GTM.pdf`)
- `dataLayer.push` com evento `form_submit_lead` (com nome/email/whatsapp) antes do envio

> O form de qualificação de 5 perguntas (que ficava em `#auditoria` com `source: "tocha_home"`) foi removido. A qualificação acontece agora na conversa via WhatsApp, conduzida pelo Ângulo.

## Footer (mínimo — `src/layouts/Layout.astro`)

Footer inteiro em uma linha. Nada de coluna de produto. Quem quer encontrar SaaS específico (Athena, Ângulo, Mercúrio, Máquina de Produção) acessa pelas seções da home ou via link direto.

**Conteúdo:**
- `© {ano} Ricardo Tocha`
- Links: Manifesto · Círculo · Login

## Meta tags

- **`<title>`:** Ricardo Tocha | IA para operações de vendas B2B
- **`<meta description>`:** Construo a infraestrutura de IA que cresce sua receita sem inflar a folha de pagamento.

## Padrão visual de fundos das seções

Alternância de cor para separação visual sem precisar de divisores:

| Seção           | Background    | Notas                                  |
|-----------------|---------------|----------------------------------------|
| Hero            | `#0a0a0a`     | + grid pattern + gradient overlay      |
| Faixa amarela   | `yellow-500`  | divisor visual entre PJ e PF           |
| Bio             | `#0a0a0a`     | sólido                                 |
| Diagnóstico     | `#0f0f0f`     | sólido                                 |
| Casos reais     | `#0a0a0a`     | sólido                                 |
| Infraestrutura  | `#0f0f0f`     | + skew yellow overlay no canto sup. dir.|
| Formulário      | `#0a0a0a`     | + grid pattern + gradient overlay      |

## Tom de voz — diretrizes

- Frases curtas, voz ativa.
- Falar como humano que vende para humano: "Cresça sem contratar mais gente" no lugar de "Descole o crescimento da necessidade de contratar".
- Evitar metáforas médicas/militares (sangramento, intervenção cirúrgica, war room — exceto quando for nome de produto).
- Evitar palavras-buzzword sem contexto: "Unit Economics", "Go-To-Market", "Orquestração agêntica", "LLMs de fronteira", "A-Players".
- Não inventar números nos cases. Quando houver, usar valores reais. Quando não houver, descrever em ordem de grandeza ("de horas para minutos").
- Quando citar um produto interno (Athena, Ângulo, Mercúrio), sempre acompanhar de uma categoria explicativa na primeira menção.
- A bio vem antes dos produtos. Autoridade primeiro, oferta depois.
