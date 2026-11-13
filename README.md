# marceloneco.github.io — Portal de Projetos (solverone.com.br)

Site estático do Portal da SolverONE: `index.html` + `fundo.jpg`. Publicado pelo GitHub Pages em `https://solverone.com.br/`.

## Selo "Top 3% Talent · Vetted by Toptal" (v2.7, 13/Nov/2026)

Componente isolado, fácil de mover quando o site for reformulado (B2B):

| Arquivo | O que é |
|---|---|
| `toptal-badge.css` | aparência e posição (rodapé: no computador, à esquerda do "Conecte-se comigo", tudo centralizado; no celular, à esquerda dos textos do rodapé) e a troca por tema |
| `toptal-badge.js` | mostra o selo só quando o RootifyONE liga o recurso `portal.toptal-badge` |
| `assets/toptal-badge-white.webp` | imagem oficial branca (208 × 240), sem alteração; a azul (`toptal-badge-blue.webp`) entra quando houver tema claro |
| `recursos.js` | interruptores do Controle dos apps (cópia do master em `rootify-one`; não editar aqui) |
| `recursos-do-app.json` | o que o Portal obedece: `portal.toptal-badge`, com `"padrao": false` |
| `teste/toptal-badge.js` | teste automático (Playwright): `node teste/toptal-badge.js` |

Regras do selo: endereço oficial do perfil (`https://www.toptal.com/product-managers/resume/marcelo-freitas#4L3o7r`),
`target="_blank"` com `rel="noopener"`, `alt` em PT e EN, **sem dependência nem chamada externa**, imagem sem mudar cor,
proporção ou conteúdo. O HTML do selo fica sempre na página (escondido com `hidden`); quem decide se aparece é o
RootifyONE.

**Nasce desligado.** Para ligar ou desligar (dono, no RootifyONE): Controle dos apps → Portal de Projetos → aba
Recursos → lista "O app diz que obedece" → interruptor "Selo Toptal (Top 3% Talent) no rodapé" → Publicar. O Portal
relê o arquivo publicado quando a pessoa volta para a aba (no máximo a cada 5 minutos), sem recarregar.

**Validação na Toptal** (Talent Portal → Referrals & More → Copy the Code → passo 4 → Submit, informando
`https://solverone.com.br/`): o validador procura o link do perfil na página. O link está no HTML mesmo com o selo
desligado; se a Toptal exigir o selo visível, ligue o interruptor, publique, valide e desligue de novo.

**Tema:** o Portal hoje é só escuro e mostra a imagem branca. Quando ganhar a opção de tema, basta pôr
`data-theme="light"` ou `"dark"` no `<html>` e acrescentar `<img class="tt-blue" src="assets/toptal-badge-blue.webp" …>`
ao lado da branca em `index.html`: o CSS já troca sozinho.

## Outras pastas

- `bolinho-de-chuva/` — só redireciona para `solverone.com.br/kids/` (o app mora no repositório `kids`).
- `tv/` — atalhos curtos para a TV, que levam aos jogos em `/kids/`.
- `rootify-one/` — redirecionamento antigo do admin.
