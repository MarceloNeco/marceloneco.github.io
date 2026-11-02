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
- `bolinho-de-chuva/` — só redireciona para **solverone.com.br/kids/**. O Bolinho de Chuva (estante e todos os jogos)
  mudou para o repositório **kids** em 02/Nov/2026; mexa nele lá. O `sw.js` desta pasta desliga o service worker antigo.
- `tv/` — atalhos curtos para digitar na TV (`solverone.com.br/tv/...`), que levam aos jogos em `/kids/`.
