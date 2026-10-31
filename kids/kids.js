/* Navegação pelo controle remoto: setas (esquerda/direita/cima/baixo) passam o foco entre os cartões;
   OK (Enter) abre o que está em foco. O primeiro cartão já começa em foco. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!cards.length) return;
  var i = Math.max(0, cards.indexOf(document.activeElement));
  function foco(n) { i = (n + cards.length) % cards.length; cards[i].focus(); }
  if (document.activeElement !== cards[0]) foco(0);
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); foco(i + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); foco(i - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); cards[i].click(); }
  });
  cards.forEach(function (c, n) { c.addEventListener('focus', function () { i = n; }); });
})();
