/* Navegação pelo controle remoto: setas passam o foco entre os cartões; OK (Enter) abre.
   Na LG (Magic Remote): enquanto a bolinha do cursor está na tela, as setas movem o cursor e não chegam
   à página; a bolinha some sozinha uns 5 s depois de parar de mexer o controle (ou ao apertar Voltar).
   Por isso ouvimos as setas pelo nome (e.key) e pelo código antigo (keyCode 37-40, 13), nos dois eventos
   (keydown e keyup, sem repetir), e mostramos a dica do cursor quando a LG avisa que ele apareceu. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!cards.length) return;
  var i = Math.max(0, cards.indexOf(document.activeElement)), ultimo = 0;
  function foco(n) { i = (n + cards.length) % cards.length; try { cards[i].focus({ preventScroll: false }); } catch (e) { cards[i].focus(); } }
  foco(0); setTimeout(function () { if (document.activeElement !== cards[i]) foco(i); }, 300);
  function tecla(e) {
    var k = e.key || '', c = e.keyCode || e.which || 0, agora = Date.now();
    var dir = (k === 'ArrowRight' || k === 'ArrowDown' || c === 39 || c === 40) ? 1 : (k === 'ArrowLeft' || k === 'ArrowUp' || c === 37 || c === 38) ? -1 : 0;
    var ok = k === 'Enter' || k === ' ' || c === 13 || c === 32;
    if (!dir && !ok) return;
    e.preventDefault();
    if (e.type === 'keyup' && agora - ultimo < 400) return;   // o keydown já tratou
    ultimo = agora;
    if (dir) foco(i + dir); else cards[i].click();
  }
  document.addEventListener('keydown', tecla); document.addEventListener('keyup', tecla);
  cards.forEach(function (c, n) { c.addEventListener('focus', function () { i = n; }); c.addEventListener('mouseenter', function () { i = n; }); });
  // LG webOS avisa quando a bolinha do cursor aparece ou some
  var dica = document.getElementById('dicaCursor');
  document.addEventListener('cursorStateChange', function (e) { if (dica) dica.style.display = (e.detail && e.detail.visibility) ? 'block' : 'none'; }, false);
})();
