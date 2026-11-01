/*
  Jogos no aparelho, sem internet.
  - Cada cartão com data-instalar ganha o botão "📲 Instalar": abre o jogo com ?instalar=1, e o jogo mostra
    a barra "Instalar o aplicativo" (instalar.js) para ele ganhar ícone próprio. O próprio jogo, ao abrir,
    registra o service worker dele e guarda no aparelho o que precisa para jogar sem internet.
  - Com o Bolinho instalado (aberto como aplicativo, ou logo depois de instalar), guarda TODOS os jogos de uma
    vez: registra o service worker de cada um (data-sw). Cada jogo guarda o próprio código; músicas e partes
    pesadas seguem a regra de cada jogo (em geral, só no Wi-Fi).
  - Cartão com data-so-online (ex.: Dança na Sala, que depende do YouTube e da TV) ganha o aviso "Só com
    internet" em vez do botão.
  Sem internet não existe TV: o pareamento celular ↔ TV precisa da internet.
*/
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('a.card[data-instalar], a.card[data-so-online]'));
  if (!cards.length) return;

  var css = '' +
    '.cx{position:relative;display:flex}' +
    '.cx>.card{flex:1}' +
    '.cx-inst{position:absolute;top:.9rem;right:.9rem;z-index:2;display:inline-flex;align-items:center;gap:.35rem;min-height:40px;padding:.4rem .8rem;border-radius:999px;background:rgba(11,10,31,.75);border:1px solid var(--c,#c6ff3d);color:#f3f0ff;font-weight:700;font-size:.85rem;text-decoration:none}' +
    '.cx-inst:hover,.cx-inst:focus-visible{background:var(--c,#c6ff3d);color:#1a1446;outline:3px solid #ffd166;outline-offset:2px}' +
    '.cx-on{position:absolute;top:.9rem;right:.9rem;z-index:2;padding:.35rem .7rem;border-radius:999px;background:rgba(11,10,31,.75);border:1px solid #3a2f73;color:#b3acd6;font-size:.8rem}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  cards.forEach(function (card) {
    var caixa = document.createElement('div');
    caixa.className = 'cx';
    caixa.style.setProperty('--c', card.style.getPropertyValue('--c'));
    card.parentNode.insertBefore(caixa, card);
    caixa.appendChild(card);
    var nome = (card.querySelector('h2') || {}).textContent || '';
    if (card.hasAttribute('data-so-online')) {
      var aviso = document.createElement('span');
      aviso.className = 'cx-on';
      aviso.textContent = '🌐 Só com internet';
      aviso.title = 'Precisa de internet: YouTube e TV. / Needs internet.';
      caixa.appendChild(aviso);
      return;
    }
    var bot = document.createElement('a');
    bot.className = 'cx-inst';
    bot.href = card.getAttribute('data-instalar') + '?instalar=1';
    bot.innerHTML = '📲 Instalar';
    bot.setAttribute('aria-label', 'Instalar ' + nome + ' no aparelho, para jogar sem internet / Install ' + nome);
    caixa.appendChild(bot);
  });

  function guardarTodos() {
    if (!('serviceWorker' in navigator)) return;
    cards.forEach(function (card) {
      var sw = card.getAttribute('data-sw');
      if (!sw) return;
      navigator.serviceWorker.register(sw, { scope: sw.replace(/[^\/]*$/, '') }).catch(function () {});
    });
  }
  var comoApp = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  if (comoApp) window.addEventListener('load', guardarTodos);
  window.addEventListener('appinstalled', guardarTodos);
})();
