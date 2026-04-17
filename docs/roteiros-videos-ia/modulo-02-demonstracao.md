# Módulo 2 — A Demonstração

## Núcleo narrativo (5 linhas)

1. **Situação:** No módulo anterior, mostrei os números. Agora o espectador quer ver se é real.
2. **Desejo:** Ver o sistema funcionando — do zero ao vídeo pronto.
3. **Conflito:** A maioria das "demonstrações de IA" mostra um prompt e um resultado, sem o meio. O espectador fica sem saber se é editado, se levou horas, se precisou de conhecimento técnico.
4. **Mudança:** Screencast real, em tempo real (acelerado), mostrando cada etapa: tema → roteiro → voice-over → storyboard → imagens → clips → timeline no Premiere.
5. **Resultado:** O espectador vê com os próprios olhos que o sistema funciona — e que o operador não precisou programar, desenhar ou editar nada até chegar no Premiere.

---

## Roteiro — Narrativa (Voice Over)

### ATO 1 — INTRO

No vídeo anterior eu te mostrei os números. Custo de quinze reais, margem de quatrocentos por cento, produção rodando de madrugada.

Pode ter parecido bom demais. Justo. Palavras são fáceis.

Então agora eu vou fazer diferente. Eu vou abrir a tela e produzir um vídeo do zero na tua frente. Do tema até a timeline no Premiere.

Sem corte escondido. Sem "e aqui eu já tinha feito antes". Cada etapa vai aparecer na tela, na sequência, como acontece de verdade.

[pausa]

Vamos.

### ATO 2 — DEMONSTRAÇÃO (Screencast)

[tela: Claude Cowork aberto, pasta do projeto vazia]

Eu começo abrindo o Claude no modo Cowork com a pasta do projeto selecionada. O sistema já sabe o que tem aqui dentro — ele leu as instruções, os scripts, os skills. Não preciso explicar nada pra ele.

Primeiro passo: criar o cliente e o projeto.

[tela: digitando "Cria um novo cliente chamado Demo e um projeto de vídeo sobre produtividade com IA"]

Ele roda o setup. Cria as pastas, o branding inicial, o status do projeto. Tudo padronizado.

[tela: estrutura de pastas criada]

Agora eu configuro o branding — o estilo visual, o tom de voz, as cores. Isso aqui é o que garante que todas as imagens do vídeo tenham a mesma identidade. Eu converso com o Claude e ele monta o arquivo.

[tela: branding.json sendo preenchido na conversa]

Com o branding definido, vamos pro roteiro.

[tela: digitando "Vamos escrever o roteiro"]

Eu dou o tema e ele me propõe as cinco frases centrais — o esqueleto da história. Eu ajusto, ele reescreve. A gente vai e volta até as cinco frases contarem a história sozinhas. Depois ele expande pro roteiro completo.

[tela: roteiro.md aparecendo, dividido em atos]

Próximo passo: o voice-over. Eu posso gravar eu mesmo ou pedir pro Claude gerar via ElevenLabs. Nesse caso eu vou gerar.

[tela: "Gera o voice-over do roteiro" → arquivo de áudio sendo criado]

Com o áudio pronto, ele transcreve com timestamps. Essa transcrição é o que conecta cada frase a um tempo exato — e é isso que permite montar o storyboard automaticamente.

[tela: "Transcreve o voice-over" → transcript aparecendo com timestamps]

Agora vem a parte visual.

[tela: "Monta o storyboard"]

Ele pega o roteiro, pega os timestamps, e constrói cada cena. Pra cada frase do voice-over, uma cena com: descrição visual, enquadramento de câmera, iluminação, tipo de movimento.

[tela: storyboard.json aparecendo — mostrando 3-4 shots com todos os campos]

Antes de gerar qualquer imagem, eu posso ver um preview de tudo.

[tela: "Gera o review do storyboard" → HTML abrindo no navegador, cenas lado a lado]

Esse review me mostra cada cena com a fala, a descrição visual e os parâmetros. Se alguma coisa não faz sentido, eu peço pra ajustar antes de gastar créditos.

[tela: navegador mostrando o review HTML]

Aprovei. Agora as imagens.

[tela: "Gera as imagens do storyboard" → imagens aparecendo uma a uma: shot_01.png, shot_02.png...]

Cada imagem usa a anterior como referência visual — isso mantém o estilo consistente do primeiro ao último frame. Repara como a paleta, a iluminação, a textura se mantêm.

[tela: grid com 6-8 imagens lado a lado]

Agora cada imagem vira um clip de vídeo.

[tela: "Gera os clips de vídeo" → clips sendo gerados, progresso aparecendo]

Cinco segundos cada. O sistema pega o keyframe e adiciona movimento sutil — zoom, pan, dolly. O tipo de movimento que eu defini no storyboard.

[tela: 2-3 clips rodando em preview]

E os efeitos sonoros.

[tela: "Gera os efeitos sonoros" → sfx sendo gerados]

Pra cada cena, o Claude criou uma descrição de ambiente sonoro. Passos num corredor, máquina digitando, relógio tiquetaqueando — o que fizer sentido narrativamente. Os efeitos são gerados e posicionados no tempo exato de cada cena.

[tela: lista de SFX gerados com nomes e duração]

Último passo antes do editor.

[tela: "Gera a timeline pro Premiere"]

Ele monta um arquivo FCPXML com tudo posicionado: clips de vídeo na trilha principal, voice-over na trilha de áudio, efeitos sonoros sincronizados.

[tela: arquivo .fcpxml aparecendo na pasta]

Agora eu abro no Premiere.

[tela: Premiere Pro importando o FCPXML]

E olha isso. A timeline está montada. Cada clip no lugar certo, o voice-over embaixo, os efeitos sonoros sincronizados. Eu não arrastei um único arquivo. Não cortei um único clip. Não ajustei um único timestamp.

[tela: timeline completa no Premiere — zoom lento mostrando as trilhas]

Daqui eu ajusto transições, faço um color grading leve, adiciono música de fundo — e exporto.

[tela: vídeo final renderizado rodando]

Isso aqui levou uma tarde. Do tema à exportação.

### ATO 3 — ENCERRAMENTO

Você acabou de ver o pipeline inteiro. Sem truque, sem edição escondida.

Eu digitei em português. O sistema executou. Roteiro, voice-over, transcrição, storyboard, imagens, clips, efeitos sonoros, timeline. E eu abri no Premiere com tudo pronto.

A pergunta que fica é: o que você faria se pudesse produzir nesse ritmo?

No próximo módulo eu mostro como conseguir clientes pra esse serviço — sem portfólio grande, sem cold call e com investimento mínimo.

---

## Notas de produção

**Formato:** Intro e encerramento em talking head. Ato 2 inteiro em screencast real (gravar a tela do Mac rodando o Cowork + Premiere). Pode acelerar os momentos de espera (geração de imagens, clips) com indicador de tempo no canto.

**Duração estimada:** 8-12 minutos.

**Dica de gravação:** Gravar o screencast inteiro primeiro, sem narração. Depois gravar a narração em cima, ajustando o ritmo. Nos momentos de espera (geração), acelerar 4-8x com indicador de tempo.

**Momentos-chave pra não cortar:**
- O storyboard.json aparecendo com os campos detalhados
- O review HTML abrindo no navegador
- As imagens aparecendo uma a uma (o reference chaining é visualmente impactante)
- O Premiere importando e mostrando a timeline montada

**Canal:** YouTube (módulo gratuito). Cortes pro Instagram: o trecho do Premiere abrindo a timeline (30s), o grid de imagens aparecendo (15s).
