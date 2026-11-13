/* toptal-badge.js — mostra o selo da Toptal só quando o RootifyONE liga "portal.toptal-badge" (v2.7, 13/Nov/2026).
   Depende do recursos.js (interruptores do Controle dos apps); sem ele, o selo fica escondido como nasceu.
   Padrão DESLIGADO: SolverRecursos.ligado(id, false) devolve false enquanto não houver regra publicada.
   Relê sozinho quando a pessoa volta para a aba (recursos.js, no máximo a cada 5 min). */
(function () {
  'use strict';
  var ID = 'portal.toptal-badge';
  var el = document.getElementById('toptal-badge');
  if (!el || !window.SolverRecursos) return;
  function aplicar() {
    var ligado = window.SolverRecursos.ligado(ID, false);
    el.hidden = !ligado;
    document.documentElement.classList.toggle('com-selo-toptal', ligado);
  }
  aplicar();
  window.SolverRecursos.aoMudar(aplicar);
})();
