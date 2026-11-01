/* Navegação pelo controle remoto: setas passam o foco entre os cartões; OK (Enter) abre.
   Navegadores de TV mandam as teclas de jeitos diferentes (nome, código antigo, só keyup, só keypress),
   por isso ouvimos tudo, na janela e no documento, em captura. Na LG (Magic Remote), enquanto a bolinha
   do cursor está na tela as setas movem o cursor; a bolinha some uns 5 s depois de parar de mexer o controle.
   ?debug mostra na tela cada tecla recebida (para diagnosticar numa TV de verdade). */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!cards.length) return;
  var i = Math.max(0, cards.indexOf(document.activeElement)), ultimo = 0, ultimaTecla = '';
  var debug = /[?&]debug\b/.test(location.search), painel = null;
  if (debug) { painel = document.createElement('pre'); painel.id = 'debug'; painel.textContent = 'DIAGNÓSTICO: aperte as setas e OK no controle…\n'; document.body.appendChild(painel); }
  function log(e) { if (!painel) return; var ae = document.activeElement; painel.textContent += e.type + '  key=' + JSON.stringify(e.key) + '  code=' + JSON.stringify(e.code) + '  keyCode=' + e.keyCode + '  which=' + e.which + '  foco=' + (ae && (ae.id || ae.tagName)) + '\n'; var linhas = painel.textContent.split('\n'); if (linhas.length > 10) painel.textContent = linhas.slice(-10).join('\n'); }
  function foco(n, parado) { i = (n + cards.length) % cards.length; try { cards[i].focus({ preventScroll: !!parado }); } catch (e) { cards[i].focus(); } cards.forEach(function (c, k) { c.classList.toggle('sel', k === i); }); }
  document.body.tabIndex = -1;
  foco(0, true); setTimeout(function () { if (document.activeElement !== cards[i]) foco(i, true); }, 300);
  window.addEventListener('load', function () { foco(i, true); });
  function tecla(e) {
    log(e);
    if (document.body.classList.contains('bc-modal')) return;
    var k = e.key || '', c = e.keyCode || e.which || 0, agora = Date.now();
    var dir = (k === 'ArrowRight' || k === 'Right' || c === 39) ? 1 : (k === 'ArrowDown' || k === 'Down' || c === 40) ? 1 : (k === 'ArrowLeft' || k === 'Left' || c === 37) ? -1 : (k === 'ArrowUp' || k === 'Up' || c === 38) ? -1 : 0;
    var ok = k === 'Enter' || k === 'OK' || k === ' ' || c === 13 || c === 32;
    if (!dir && !ok) return;
    var ae = document.activeElement;
    if (ok && ae && ae.className && String(ae.className).indexOf('bc-') === 0) return; // OK no botão de instalar: é dele
    // a mesma tecla pode chegar como keydown, keypress e keyup: trata uma vez só a cada 350 ms
    var assinatura = (dir || 'ok');
    if (agora - ultimo < 350 && ultimaTecla === assinatura) { e.preventDefault(); return; }
    ultimo = agora; ultimaTecla = assinatura;
    e.preventDefault();
    if (dir) foco(i + dir); else { var alvo = cards[i]; if (alvo.href) location.href = alvo.href; else alvo.click(); }
  }
  ['keydown', 'keypress', 'keyup'].forEach(function (t) { window.addEventListener(t, tecla, true); });
  cards.forEach(function (c, n) { c.addEventListener('focus', function () { i = n; }); c.addEventListener('mouseenter', function () { i = n; }); });
  // LG webOS avisa quando a bolinha do cursor aparece ou some
  var dica = document.getElementById('dicaCursor');
  document.addEventListener('cursorStateChange', function (e) { if (dica) dica.style.display = (e.detail && e.detail.visibility) ? 'block' : 'none'; if (painel) painel.textContent += 'cursor ' + (e.detail && e.detail.visibility ? 'visível' : 'escondido') + '\n'; }, false);
  // TVs sem evento de tecla: a roda/clique do Magic Remote ainda funciona; o mouse sobre o cartão já o seleciona
})();
