# Portal SolverONE (solverone.com.br) — regras do projeto para o Claude Code

- O dono (Marcelo) não é desenvolvedor: responda em português do Brasil, simples, sem jargão; passo a passo de
  iniciante quando ele precisar fazer algo.
- **Publicar é sempre autorizado** (decisão do dono, 02/Nov/2026: ele comanda pelo celular). Ao terminar e testar,
  faça o pull request e o merge sem perguntar e conte em uma ou duas frases o que mudou e onde ver.
  Criar repositório novo continua pedindo permissão.
- As diretrizes gerais da plataforma estão na skill `diretrizes-gerais-apps` (cópia em
  `FeatureTesting/.claude/skills/diretrizes-gerais-apps/SKILL.md`). Valem aqui também.
- Nenhuma senha, chave ou token no repositório (ele é público). Textos para o usuário em PT, EN e ES (diretriz do dono,
  14/Nov/2026: três idiomas oficiais; um seletor só, bandeira em SVG + sigla, componente do módulo comum, nunca emoji; cópia
  mestra das bandeiras em `bandeiras/` do RootifyONE; ES só quando o site inteiro estiver traduzido; detalhe na diretriz geral
  do `rootify-one`, seção "Idioma e datas"). Nada implementado aqui ainda: entra na ordem combinada com o dono (regra zero).

## O que tem aqui

- `index.html` — o Portal (HUB) com os apps.
- `bolinho-de-chuva/` — só redireciona para **solverone.com.br/kids/**. O Bolinho de Chuva (estante e todos os jogos)
  mudou para o repositório **kids** em 02/Nov/2026; mexa nele lá. O `sw.js` desta pasta desliga o service worker antigo.
- `tv/` — atalhos curtos para digitar na TV (`solverone.com.br/tv/...`), que levam aos jogos em `/kids/`.

## AssistONE: quem cuida (decisão do dono, 26/Nov/2026)

- O **AssistONE** (personagem, balão, tour, busca, passo a passo e "Perguntar ao assistente") é desenvolvido, melhorado e
  controlado pela **conta nova do Claude (marceloneco@gmail.com), conversa ASSISTONE**. Registrado na `01-PONTE-GERAL`
  (Drive "0-Orchestration": índice, "Quem escreve onde" e "Pedidos e conflitos").
- O **master** mora no repositório privado **`MarceloNeco/assist-one`**: `balao/assistone.js` (o balão), `balao/visual/` (o
  visual novo: personagem, menu, conversa, cores, fontes), `servidor/` (cópia sem segredos do leitor da fila e do Hermes da
  VPS) e os testes. O **visual novo**, aprovado no Claude Design em 26/Nov/2026, é o padrão para todos os apps; a
  especificação está em `assist-one/docs/desenho-pacote/ESPECIFICACAO.md`.
- São da conversa ASSISTONE, além do master: as cópias nos apps (`assistone.js` e a pasta `assistone/`, sempre idênticas ao
  master; **nunca editar a cópia**); no MoneyTRIO, o objeto `AssistOne` do `index.html` e `modulos/assist-hermes.js`; no
  `solverone-app`, a fila e as funções `assist_*` e `admin_assist_*` (SQL 2026-11-26b a 26g) e o medidor de uso de IA
  (`ia_consumo` / `admin_ia_uso`); no RootifyONE, a tela Atendimento → AssistONE (`rootify-assistone-adm.js`); na VPS, o
  leitor da fila e o Hermes (com a conversa HOSTINGER).
- **Qualquer sessão desta conta que precise mexer num desses itens pede antes na Ponte**, em "Pedidos e conflitos", para a
  ASSISTONE, e **não mexe sozinha**.
- Continua igual: os interruptores e as regras por app, plano, conta e família ficam no **RootifyONE**, e o AssistONE obedece a
  eles; a **diretriz master** continua com a conversa de diretrizes (conta antiga).
- **Toda IA da plataforma mede tokens e custo no porteiro `solverone-ia`** (decisão D-A17, 26/Nov/2026); nenhum app fala
  direto com provedor de IA.
- **Neste repositório (Portal)** o AssistONE ainda não está instalado; quando entrar, vem do master do `assist-one`, pedido pela Ponte.
