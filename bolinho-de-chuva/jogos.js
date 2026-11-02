/*
  Jogos no aparelho, sem internet (a lista vem de catalogo.js).
  - Cada cartão com data-instalar ganha "📲 Instalar": abre o jogo com ?instalar=1 e o jogo mostra a barra
    "Instalar o aplicativo" (instalar.js) para ganhar ícone próprio.
  - Painel "Todos os jogos" (#todos):
      ⬇ Guardar todos neste aparelho → registra o service worker de cada jogo, com andamento na tela; cada jogo
        guarda o próprio código e passa a abrir sem internet (músicas e partes pesadas seguem a regra de cada jogo,
        em geral só no Wi-Fi). Ao abrir de novo, a página mostra se já está tudo guardado.
      📲 Instalar um por um → navegador nenhum instala vários ícones de uma vez (cada app só se instala a partir da
        própria página). Então abre o primeiro jogo com ?instalar=1&fila=1; depois de instalar (ou pular), a barra
        leva ao próximo; no fim, volta para cá (?fila=fim). A fila fica em localStorage "bolinho:fila".
  - Com o Bolinho instalado (aberto como aplicativo, ou logo depois de instalar), guarda todos sozinho.
  - Cartão com data-so-online (ex.: Dança na Sala: YouTube e TV) ganha "🌐 Só com internet".
  Sem internet não existe TV: o pareamento celular ↔ TV precisa da internet.
*/
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('a.card[data-instalar], a.card[data-so-online]'));
  if (!cards.length) return;
  var instalaveis = cards.filter(function (c) { return c.hasAttribute('data-instalar'); });
  var temSW = 'serviceWorker' in navigator;

  var css = '' +
    '.cx{position:relative;display:flex}' +
    '.cx>.card{flex:1}' +
    '.cx-inst{position:absolute;top:.9rem;right:.9rem;z-index:2;display:inline-flex;align-items:center;gap:.35rem;min-height:40px;padding:.4rem .8rem;border-radius:999px;background:rgba(11,10,31,.75);border:1px solid var(--c,#c6ff3d);color:#f3f0ff;font-weight:700;font-size:.85rem;text-decoration:none}' +
    '.cx-inst:hover,.cx-inst:focus-visible{background:var(--c,#c6ff3d);color:#1a1446;outline:3px solid #ffd166;outline-offset:2px}' +
    '.cx-on{position:absolute;top:.9rem;right:.9rem;z-index:2;padding:.35rem .7rem;border-radius:999px;background:rgba(11,10,31,.75);border:1px solid #3a2f73;color:#b3acd6;font-size:.8rem}' +
    '.cx-ok{position:absolute;right:.9rem;bottom:.9rem;z-index:2;font-size:.75rem;color:#c6ff3d}' +
    '.todos{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;margin-top:1.4rem;padding:.9rem 1rem;border-radius:18px;background:rgba(34,27,77,.7);border:1px solid #3a2f73}' +
    '.todos[hidden]{display:none}' +
    '.todos b{flex-basis:100%;font-size:1rem}' +
    '.todos button{min-height:44px;padding:.5rem 1rem;border-radius:999px;font:inherit;font-weight:700;cursor:pointer;border:1px solid #3a2f73;background:#221b4d;color:#f3f0ff}' +
    '.todos button.forte{background:#c6ff3d;color:#1a1446;border-color:#c6ff3d}' +
    '.todos button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}' +
    '.todos button:disabled{opacity:.6;cursor:default}' +
    '.todos .st{flex-basis:100%;color:#b3acd6;font-size:.9rem;line-height:1.4}' +
    '.todos .st.ok{color:#c6ff3d}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  // ---------- botão de cada cartão ----------
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
    bot.textContent = '📲 Instalar';
    bot.setAttribute('aria-label', 'Instalar ' + nome + ' no aparelho, para jogar sem internet / Install ' + nome);
    caixa.appendChild(bot);
  });

  function nomeDe(card) { return ((card.querySelector('h2') || {}).textContent || '').trim(); }
  function escopo(card) { return card.getAttribute('data-sw').replace(/[^\/]*$/, ''); }

  // ---------- guardar todos ----------
  function esperarAtivo(reg) {
    return new Promise(function (ok) {
      if (reg.active) return ok(true);
      var w = reg.installing || reg.waiting;
      if (!w) return ok(false);
      var fim = setTimeout(function () { ok(false); }, 45000);
      w.addEventListener('statechange', function () {
        if (w.state === 'activated') { clearTimeout(fim); ok(true); }
        if (w.state === 'redundant') { clearTimeout(fim); ok(false); }
      });
    });
  }
  function guardarTodos(aoAndar) {
    if (!temSW) return Promise.resolve(0);
    var feitos = 0;
    return instalaveis.reduce(function (fila, card, i) {
      return fila.then(function () {
        if (aoAndar) aoAndar(i, nomeDe(card), feitos);
        return navigator.serviceWorker.register(card.getAttribute('data-sw'), { scope: escopo(card) })
          .then(esperarAtivo).then(function (ok) { if (ok) { feitos++; marcar(card); } }).catch(function () {});
      });
    }, Promise.resolve()).then(function () { return feitos; });
  }
  function marcar(card) {
    var caixa = card.parentNode;
    if (caixa.querySelector('.cx-ok')) return;
    var m = document.createElement('span');
    m.className = 'cx-ok';
    m.textContent = '✓ funciona sem internet';
    caixa.appendChild(m);
  }

  // ---------- painel "Todos os jogos" ----------
  var painel = document.getElementById('todos');
  if (painel && temSW) {
    painel.hidden = false;
    painel.innerHTML = '<b>📦 Todos os jogos neste aparelho · All games on this device</b>';
    var bGuardar = document.createElement('button');
    bGuardar.type = 'button'; bGuardar.className = 'forte';
    bGuardar.textContent = '⬇ Guardar todos (jogar sem internet)';
    var bFila = document.createElement('button');
    bFila.type = 'button';
    bFila.textContent = '📲 Instalar os ícones um por um';
    var st = document.createElement('p');
    st.className = 'st';
    st.setAttribute('aria-live', 'polite');
    st.textContent = 'Guardar todos: cada jogo passa a abrir sem internet. Instalar um por um: cada jogo ganha o próprio ícone na tela inicial (o navegador só deixa instalar um de cada vez).';
    painel.appendChild(bGuardar); painel.appendChild(bFila); painel.appendChild(st);

    bGuardar.addEventListener('click', function () {
      bGuardar.disabled = true;
      st.className = 'st';
      guardarTodos(function (i, nome) {
        st.textContent = '⬇ Guardando ' + (i + 1) + ' de ' + instalaveis.length + ': ' + nome + '…';
      }).then(function (n) {
        bGuardar.disabled = false;
        if (n === instalaveis.length) {
          st.className = 'st ok';
          st.textContent = '✓ Pronto: os ' + n + ' jogos funcionam sem internet neste aparelho. As músicas e as partes pesadas terminam de baixar sozinhas no Wi-Fi.';
          bGuardar.textContent = '✓ Todos guardados';
        } else {
          st.textContent = n + ' de ' + instalaveis.length + ' guardados. Confira a internet e toque de novo para terminar.';
        }
      });
    });

    bFila.addEventListener('click', function () {
      var fila = instalaveis.map(function (c) { return { nome: nomeDe(c), url: c.getAttribute('data-instalar') }; });
      try { localStorage.setItem('bolinho:fila', JSON.stringify(fila.slice(1))); } catch (e) {}
      location.href = fila[0].url + '?instalar=1&fila=1';
    });

    var fimFila = /[?&]fila=fim\b/.test(location.search);
    // já guardados antes? mostra sem precisar tocar
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      var escopos = regs.map(function (r) { return new URL(r.scope).pathname; });
      var n = 0;
      instalaveis.forEach(function (c) { if (escopos.indexOf(escopo(c)) >= 0) { n++; marcar(c); } });
      if (n === instalaveis.length) {
        bGuardar.textContent = '✓ Todos guardados';
        if (fimFila) return;   // a mensagem do fim do "Instalar um por um" fica
        st.className = 'st ok';
        st.textContent = '✓ Os ' + n + ' jogos já funcionam sem internet neste aparelho.';
      }
    }).catch(function () {});

    // voltou do "Instalar um por um"
    if (fimFila) {
      st.className = 'st ok';
      st.textContent = '✓ Pronto! Os ícones que você instalou estão na tela inicial do aparelho.';
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    }
  }

  // com o Bolinho instalado, guarda todos sozinho
  var comoApp = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  if (comoApp) window.addEventListener('load', function () { guardarTodos(); });
  window.addEventListener('appinstalled', function () { guardarTodos(); });
})();
