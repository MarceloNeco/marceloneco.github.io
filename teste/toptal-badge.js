/* Teste automático do selo da Toptal (v2.7): nasce escondido; aparece só quando o RootifyONE publica
   recursos/portal.json com "portal.toptal-badge" ligado; some de novo quando desliga; link oficial, nova aba,
   rel=noopener, alt PT/EN; sem rolagem horizontal em 390 px e 1440 px; tema claro (data-theme) esconde a branca.
   Uso: node teste/toptal-badge.js   (sobe um servidor local sozinho; precisa do Playwright instalado) */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const servidor = http.createServer((req, res) => {
  let f = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
  if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end('nao'); } res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
});
(async () => {
  await new Promise(r => servidor.listen(0, r));
  const BASE = 'http://localhost:' + servidor.address().port;
  const browser = await chromium.launch();
  const falhas = []; let n = 0;
  const ok = (c, m) => { n++; if (c) process.stdout.write('  ✓ ' + m + '\n'); else falhas.push(m); };
  let regra = null;   /* o que o RootifyONE publicou em recursos/portal.json (null = nada publicado ainda) */
  async function abrir(vp, movel) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: movel, hasTouch: movel });
    await ctx.route('**/solverone-dados/**', (route) => {
      const u = route.request().url();
      if (u.endsWith('/recursos/portal.json') && regra) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(regra) });
      return route.fulfill({ status: 404, body: 'nao' });
    });
    const page = await ctx.newPage(); const erros = []; page.on('pageerror', e => erros.push(e.message));
    await page.goto(BASE + '/'); await page.waitForTimeout(700);
    return { ctx, page, erros };
  }
  const estado = (page) => page.evaluate(() => {
    const el = document.getElementById('toptal-badge'), a = el.querySelector('a'), img = el.querySelector('img.tt-white');
    return { escondido: el.hidden, visivel: !!(el.offsetWidth && el.offsetHeight), href: a.getAttribute('href'), alvo: a.getAttribute('target'), rel: a.getAttribute('rel'),
      alt: img.getAttribute('alt'), largura: el.getBoundingClientRect().width, rolaX: document.documentElement.scrollWidth > window.innerWidth,
      comSelo: document.documentElement.classList.contains('com-selo-toptal'), palco: document.getElementById('stage').getBoundingClientRect().height,
      brancaVisivel: !!(img.offsetWidth && img.offsetHeight) };
  });

  /* 1. nada publicado: escondido no celular e no computador */
  for (const [nome, vp, movel] of [['celular 390', { width: 390, height: 844 }, true], ['computador 1440', { width: 1440, height: 900 }, false]]) {
    const { ctx, page, erros } = await abrir(vp, movel); const e = await estado(page);
    ok(e.escondido && !e.visivel && !e.comSelo, nome + ': sem regra publicada, o selo nasce escondido');
    ok(!e.rolaX, nome + ': sem rolagem horizontal');
    ok(!erros.length, nome + ': sem erro de página'); await ctx.close();
  }
  /* 2. RootifyONE publicou ligado */
  regra = { formato: 1, app: 'portal', recursos: { 'portal.toptal-badge': { ligado: true } }, comportamentos: {} };
  const palcoAntes = {};
  for (const [nome, vp, movel, larg] of [['celular 390', { width: 390, height: 844 }, true, 64], ['computador 1440', { width: 1440, height: 900 }, false, 64]]) {
    const { ctx, page, erros } = await abrir(vp, movel); await page.waitForTimeout(600); const e = await estado(page);
    ok(!e.escondido && e.visivel && e.comSelo, nome + ': com a regra ligada, o selo aparece');
    ok(Math.round(e.largura) === larg, nome + ': largura de ' + larg + ' px (veio ' + Math.round(e.largura) + ')');
    ok(e.href === 'https://www.toptal.com/product-managers/resume/marcelo-freitas#4L3o7r', nome + ': endereço oficial do perfil na Toptal');
    ok(e.alvo === '_blank' && e.rel === 'noopener', nome + ': abre em nova aba com rel=noopener');
    ok(/verificado pela Toptal/.test(e.alt) && /Vetted by Toptal/.test(e.alt), nome + ': alt em PT e EN');
    ok(!e.rolaX, nome + ': sem rolagem horizontal');
    if (!movel) {
      const r = await page.evaluate(() => { const b = document.getElementById('toptal-badge').getBoundingClientRect(), t = document.querySelector('.rodape-textos').getBoundingClientRect(), f = document.querySelector('footer').getBoundingClientRect();
        return { grupoCentro: (b.left + t.right) / 2, centroTela: f.left + f.width / 2, mesmaLinha: Math.abs((b.top + b.bottom) / 2 - (t.top + t.bottom) / 2) < 12, selaEsquerda: b.right <= t.left }; });
      ok(Math.abs(r.grupoCentro - r.centroTela) < 6 && r.mesmaLinha && r.selaEsquerda, 'computador: selo à esquerda do texto, grupo centralizado na mesma linha');
    } else {
      const r = await page.evaluate(() => { const b = document.getElementById('toptal-badge').getBoundingClientRect(), t = document.querySelector('.rodape-textos').getBoundingClientRect(), f = document.querySelector('footer').getBoundingClientRect();
        return { textoAoLado: t.left > b.right && Math.abs((b.top + b.bottom) / 2 - (t.top + t.bottom) / 2) < 40, centrado: Math.abs((b.left + t.right) / 2 - (f.left + f.width / 2)) < 8, umaLinha: t.height < 120 }; });
      ok(r.textoAoLado && r.centrado && r.umaLinha, 'celular: selo à esquerda dos textos (empilhados ao lado), grupo centralizado no rodapé');
    }
    ok(!erros.length, nome + ': sem erro de página');
    /* tema claro (futuro): a branca some */
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    ok(!(await estado(page)).brancaVisivel, nome + ': com data-theme="light" a imagem branca some (lugar pronto para a azul)');
    await ctx.close();
  }
  /* 3. desligou de novo: some sem recarregar (recursos.js relê ao voltar para a aba) */
  regra = { formato: 1, app: 'portal', recursos: { 'portal.toptal-badge': { ligado: true } }, comportamentos: {} };
  const { ctx, page } = await abrir({ width: 1440, height: 900 }, false); await page.waitForTimeout(600);
  ok(!(await estado(page)).escondido, 'ligado ao abrir');
  regra = { formato: 1, app: 'portal', recursos: { 'portal.toptal-badge': { ligado: false } }, comportamentos: {} };
  await page.evaluate(() => SolverRecursos.atualizar()); await page.waitForTimeout(600);
  ok((await estado(page)).escondido, 'regra desligada e relida: o selo some sem recarregar a página');
  await ctx.close();

  await browser.close(); servidor.close();
  if (falhas.length) { console.log('FALHOU:\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('OK: selo da Toptal (' + n + ' verificações).');
})().catch(e => { console.error('Erro no teste:', e.message); process.exit(1); });
