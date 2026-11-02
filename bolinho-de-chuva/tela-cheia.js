/*
  Tela cheia no celular e no tablet (ex.: tablet Fire da Amazon, cujo navegador abre o atalho da tela inicial
  ainda com a barra de endereço). No PRIMEIRO TOQUE na página, pede tela cheia ao navegador: some a barra de
  endereço e a página fica como um aplicativo. Navegador nenhum deixa fazer isso sem um toque da pessoa.
  - Só em tela de toque (no computador, tela cheia surpreende) e só se ainda não estiver como aplicativo.
  - Se a pessoa sair da tela cheia, não insiste nesta página.
  - Ao trocar de página a tela cheia acaba (regra do navegador): cada página/jogo pede de novo no primeiro toque.
  - iPhone não permite tela cheia de página; lá nada acontece.
  - Toque no botão de instalar não conta (a janela de instalar do navegador precisa daquele toque).
  Usado por /bolinho-de-chuva/ e /kids/.
*/
(function () {
  var d = document, el = d.documentElement;
  var pedir = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!pedir) return;
  var toque = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var comoApp = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches);
  if (!toque || comoApp) return;
  // Eventos em que o navegador libera a tela cheia: o dedo SAINDO da tela (no encostar, ainda não libera).
  var eventos = ['pointerup', 'touchend', 'click', 'keydown'];
  function cheia() { return d.fullscreenElement || d.webkitFullscreenElement; }
  function primeiroToque(e) {
    // toque no botão de instalar: a janela "Instalar" do navegador precisa desse toque; a tela cheia espera o próximo
    if (e && e.target && e.target.closest && e.target.closest('.bc-inst, .bc-fundo, .cx-inst')) return;
    if (cheia()) return parar();
    try {
      var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen();
      if (p && p.then) p.then(parar, function () {});   // recusou: tenta de novo no próximo toque
      else parar();
    } catch (e) {}
  }
  function parar() { eventos.forEach(function (t) { d.removeEventListener(t, primeiroToque, true); }); }
  eventos.forEach(function (t) { d.addEventListener(t, primeiroToque, true); });
})();
