/*
  Tela cheia no celular e no tablet. No PRIMEIRO TOQUE pede tela cheia ao navegador e some a barra de
  endereço. Só em tela de toque e se ainda não estiver aberto como aplicativo (ícone na tela inicial).

  IMPORTANTE — tablet Amazon Fire (navegador Silk): o Silk NÃO entra em tela cheia pelo navegador (ele
  nem tem botão de tela cheia, e a função de tela cheia dos sites não funciona lá). No Fire, a única forma
  de ficar sem a barra é INSTALAR o aplicativo e abrir pelo ÍCONE — aí abre em tela cheia, como um app de
  verdade. Por isso, no Silk este arquivo não fica tentando (ia falhar sem avisar); a orientação de instalar
  está no botão "Instalar o aplicativo". No Chrome/Android, no Samsung e afins, a tela cheia pelo toque funciona.
  iPhone não tem tela cheia de página. Usado por /bolinho-de-chuva/ e /kids/.
*/
(function () {
  var d = document, el = d.documentElement;
  if (!window.matchMedia) return;
  var toque = matchMedia('(pointer: coarse)').matches;
  var comoApp = matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (!toque || comoApp) return;
  var silk = /Silk/.test(navigator.userAgent || '');
  var pedir = el.requestFullscreen || el.webkitRequestFullscreen;
  if (silk || !pedir) return;   // Fire/Silk: só instalando; não adianta tentar pelo navegador

  var eventos = ['pointerup', 'touchend', 'click', 'keydown'];
  function cheia() { return d.fullscreenElement || d.webkitFullscreenElement; }
  function parar() { eventos.forEach(function (t) { d.removeEventListener(t, primeiroToque, true); }); }
  function primeiroToque(e) {
    if (e && e.target && e.target.closest && e.target.closest('.bc-inst, .bc-fundo, .cx-inst')) return;
    if (cheia()) return parar();
    try {
      var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen();
      if (p && p.then) p.then(parar, function () {}); else parar();
    } catch (e2) {}
  }
  eventos.forEach(function (t) { d.addEventListener(t, primeiroToque, true); });
})();
