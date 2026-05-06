# Estrutura da Página de Resultado do Quiz

> Diretriz central: **ser generoso**. A pessoa entra esperando um veredito e sai com um mapa, identidade, dados, próximo passo e vontade de pertencer. O resultado tem que fazer salivar — e o cadastro no Círculo é o caminho natural para baixar o kit completo.

> URL: `/operador/[nivel]/` (ex: `/operador/nivel-1/`, `/operador/nivel-2/`, `/operador/nivel-3/`)
> Renderização: SSR com base nas respostas (querystring ou state) — não estático.

## Princípios de design

1. **Reconhecimento antes de prescrição** — antes de dizer o que ele tem que fazer, mostrar que você entendeu quem ele é.
2. **Dado por trás de cada afirmação** — toda frase forte é ancorada em uma estatística (BCG, McKinsey, St. Louis Fed, Stanford HAI).
3. **Linguagem de pertencimento, não de verdict** — "Você está aqui" é convite. "Você é X" é gaiola.
4. **A nota baixa sobe naturalmente** — quem está no Nível 1 deve sair se sentindo respeitado e com a régua pra cima, não envergonhado.
5. **Compartilhamento por orgulho, não por descoberta forçada** — o cara compartilha porque o resultado o representa bem, não porque tem botão pop-up.

## Estrutura — 9 blocos

### Bloco 1 — Banner do nível *(impacto imediato)*

- Tag pequena: "Seu mapa"
- H1: **"Você é Nível 2."**
- Sub: **"Você trabalha com a IA. Mas ainda não delega."**
- Selo de raridade: **"Aprox. 40% das pessoas que usam IA estão neste nível."**

→ Em 5 segundos a pessoa já sabe onde está, sem precisar ler nada.

### Bloco 2 — O eco do que ele marcou *(empatia)*

> "Pelo que você respondeu, sua semana inclui:"
>
> - 5+ sistemas e abas pra trabalhar
> - 3+ planilhas pra atualizar manualmente
> - Informação que escapa por estar em vários lugares
> - Dia que termina cansado mas com sensação de pouco avanço
>
> *"Isso não é desorganização. É falta de stack."*

→ Bloco condicional. Mostra só os SIMs do quiz. A frase final muda por nível.

### Bloco 3 — Onde você está vs onde você pode estar *(visualização)*

Visualização em escada dos 3 níveis com **destaque no nível atual** e **glow no Nível 3**.

```
Nível 1 ────── Nível 2 ────── Nível 3 (Soberano)
                  ●               🟡
              Você está        6% chegou
               aqui            até aqui
```

→ A pessoa **vê** o salto. Não é abstrato. Tem distância visível.

### Bloco 4 — O que você ainda não sabe *(o "salivar")*

> **"O que separa você do Nível 3 são 4 conceitos que provavelmente nunca alguém te explicou direito:"**

Lista de 4-5 itens (varia conforme o nível). Cada item:
- **Nome** (em destaque)
- **1 linha do que é**
- **1 linha de por que importa**

Exemplo para quem está no Nível 2:

| Conceito | O que é | Por que importa |
|----------|---------|-----------------|
| **MCP (Model Context Protocol)** | O "USB-C" dos agentes — conecta Claude/IDE a qualquer ferramenta sua | Transforma seu Claude num orquestrador de fluxos |
| **Skills versionadas** | Prompt + ferramenta + contexto, salvos como pacote reutilizável | Você para de copiar/colar prompt — ele virou software |
| **Self-hosting (VPS)** | IA rodando em servidor seu, 24/7, fora do navegador | A IA não dorme, não fecha aba, não esquece |
| **Agente em background** | Tarefa que executa sem você abrir nada | É a diferença entre "uso" e "tenho funcionário" |

→ Aqui mora o gatilho: a pessoa lê e pensa *"como eu não sabia disso?"*. É o ponto onde ela decide querer entrar.

### Bloco 5 — A regra 10-20-70 *(manifesto curto com dado)*

Bloco visual destacado:

> **10% modelo. 20% infraestrutura. 70% pessoas e processo.**
>
> Pesquisa BCG. O Soberano não tem o melhor GPT — tem coragem de redesenhar o trabalho. **2,8x** mais propenso a reconstruir do que sobrepor IA num processo quebrado.

→ Validação externa do que você está dizendo. Aumenta a régua.

### Bloco 6 — Os 4 modos (referência McKinsey/BCG) *(credibilidade emprestada)*

> **"O que a McKinsey/BCG chama de '[Diretor / Autor / Orquestrador]', a gente chama de Nível [X]."**

Tabela curta:

| Modo (BCG/McKinsey) | Nosso Nível                 |
|---------------------|-----------------------------|
| Autor               | Nível 1                     |
| Revisor             | Nível 1 → 2                 |
| Diretor             | Nível 2                     |
| **Orquestrador**    | **Nível 3 · Soberano**      |

→ Você não inventou um framework — deu nome melhor a um já consagrado.

### Bloco 7 — Próximo passo *(CTA principal)*

Headline forte:

> **"Pra subir do Nível 2 ao Nível 3, você precisa de 3 coisas. Eu te dou as 3."**

Lista do que vem no kit (varia por nível):
- ✓ Setup OpenClaw em VPS — passo a passo testado
- ✓ Pacote de 5 MCPs essenciais (n8n, Slack, Notion, GitHub, Postgres)
- ✓ Skill "Auditor pessoal de produtividade"
- ✓ Vídeo de 12min: como eu delego 80% do meu trabalho repetitivo
- ✓ 1 sessão ao vivo gratuita por mês

CTA principal:

> **[ Entrar no Círculo (grátis) e baixar meu kit → ]**

→ O "grátis" é honesto: a entrada é gratuita. O upsell vem depois, quando o cara já viu valor.

### Bloco 8 — O que tem dentro do Círculo *(tease premium)*

3 cards curtos do que tem além do kit:

- **Trilha do seu nível** — vídeos, scripts, instruções progressivas
- **Sessões ao vivo** — uma por mês, gratuita; gravadas sempre
- **Comunidade async** — outros operadores no mesmo nível e acima

→ Não vende cohort/master classes pagas ainda. Esses são upsell de email depois.

### Bloco 9 — Compartilhamento social *(viralização)*

Bloco simples, com personalidade:

> **"Sou Nível 2 — e você?"**

Botões:
- Compartilhar no LinkedIn
- Compartilhar no WhatsApp
- Copiar link

OG image customizado por nível (3 imagens prontas). Texto da OG:
- *"Sou Nível 2 — Trabalho com a IA. Faço o quiz dos 3 níveis para descobrir quem você é."*

→ Volume orgânico. As pessoas postam quizzes — esse precisa estar pronto pra isso.

### Bloco 10 *(opcional)* — Crédito das fontes

Rodapé pequeno:

> *Dados: BCG (2024), McKinsey & Company, St. Louis Fed (2025), Stanford HAI AI Index 2025.*

→ Honestidade científica. Aumenta credibilidade sem poluir.

## Diferença de copy entre os 3 níveis

A estrutura é a mesma. O que muda:

### Página /operador/nivel-1/
- **Tom**: encorajador, sem julgamento.
- **Frase-chave**: *"Você está no momento mais fácil de subir. A IA hoje encurta a distância entre quem começa e quem é sênior. Você só precisa saber para onde olhar."*
- **Kit**: foco em fundamentos — projetos persistentes, prompt versionado, primeiros agentes.
- **Próximo passo**: ir para Nível 2.

### Página /operador/nivel-2/
- **Tom**: provocador. Você já sabe o suficiente pra reconhecer o que falta.
- **Frase-chave**: *"Você está a 1 movimento de virar Soberano. Mas é o movimento mais difícil — porque exige soltar o controle."*
- **Kit**: foco em delegação real — VPS, MCPs, skills, agentes background.
- **Próximo passo**: ir para Nível 3.

### Página /operador/nivel-3/
- **Tom**: receptivo, igual-para-igual. Não vendemos conteúdo básico aqui.
- **Frase-chave**: *"Bem-vindo. Você já é Soberano. Agora a pergunta é: o que você constrói daqui pra frente?"*
- **Kit**: pacote curado de MCPs avançados + acesso direto à comunidade.
- **Próximo passo**: cohort, comunidade paga, parcerias técnicas.

## Implementação técnica (resumo)

- **Roteamento**: Astro dynamic route `/operador/[nivel]/index.astro` ou rotas estáticas (uma página por nível) — preferir estáticas se a personalização puder ser feita via JS no cliente lendo querystring.
- **Persistência das respostas**: `sessionStorage` com chave `__quiz_answers` (JSON com {q1: ..., q2: ..., ...}).
- **Renderização condicional**: blocos 2 e 4 leem `sessionStorage` e ajustam o conteúdo.
- **Cadastro**: o CTA do bloco 7 leva para `/membros/cadastro/` com `?nivel=2&source=quiz` na URL — mesmo Supabase Auth que já existe.
- **Pós-cadastro**: usuário cai na área de membros já com a trilha do nível dele desbloqueada.

## O que decidir antes de construir

1. Os **kits específicos** de cada nível (lista final dos 4-5 itens com link/arquivo de cada um).
2. As **3 OG images** (uma por nível) — design consistente com a paleta do site.
3. **Onde mora o conteúdo do kit** — dentro da área de membros (gating) ou disponível para download direto pós-cadastro?
4. **Email de boas-vindas pós-cadastro** — entrega de novo o kit + convite para sessão ao vivo do mês.

## Fora do escopo desta versão (futuro)

- Página `/operador/avancado/` para quem está acima do Nível 3 (parceiros, builders).
- Versão PJ do quiz (mesma lógica, perguntas adaptadas para "operação" em vez de "operador").
- Personalização ainda mais fina (subníveis, recomendação por arquétipo + nível).
