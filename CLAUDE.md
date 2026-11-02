# Portal SolverONE (solverone.com.br) — regras do projeto para o Claude Code

- O dono (Marcelo) não é desenvolvedor: responda em português do Brasil, simples, sem jargão; passo a passo de
  iniciante quando ele precisar fazer algo.
- **Publicar é sempre autorizado** (decisão do dono, 02/Nov/2026: ele comanda pelo celular). Ao terminar e testar,
  faça o pull request e o merge sem perguntar e conte em uma ou duas frases o que mudou e onde ver.
  Criar repositório novo continua pedindo permissão.
- As diretrizes gerais da plataforma estão na skill `diretrizes-gerais-apps` (cópia em
  `FeatureTesting/.claude/skills/diretrizes-gerais-apps/SKILL.md`). Valem aqui também.
- Nenhuma senha, chave ou token no repositório (ele é público). Textos para o usuário em PT e EN.

## O que tem aqui

- `index.html` — o Portal (HUB) com os apps.
- `bolinho-de-chuva/` — a estante de brincadeiras para criança:
  - `catalogo.js` — **a lista única dos jogos**. Jogo novo = uma entrada lá; ela monta os cartões da estante e da
    TV (`/kids/`), o botão "📲 Instalar", o "Guardar todos" e o "Instalar um por um".
  - `jogos.js` (botões de instalar e painel "Todos os jogos"), `instalar.js` (barra "Instalar o aplicativo",
    também usada pelos jogos com `?instalar=1`), `radio.js` (rádio de rock), `tela-cheia.js` (tela cheia no primeiro
    toque em celular/tablet), `sw.js` + `manifest.webmanifest` (instalável e sem internet), `CREDITOS.md`.
- `kids/` — página para a TV (setas do controle). `tv/` — atalhos curtos para digitar na TV.
- A cada mudança no Bolinho ou no Kids, suba a `VERSAO` nos dois `sw.js` (`bolinho-de-chuva/` e `kids/`, iguais).
