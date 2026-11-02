/*
  Rádio do Bolinho: 10 músicas de rock alegre gravadas (Kevin MacLeod, CC BY 4.0, e HoliznaCC0, domínio público; pasta musicas/,
  créditos em CREDITOS.md) tocando uma depois da outra, num player fixo no pé da página.
  - Começa sozinha ao abrir a página. Celular e computador costumam bloquear som antes de a pessoa tocar na
    página: nesse caso começa no PRIMEIRO TOQUE EM QUALQUER LUGAR (menos no próprio player, que tem os botões dele).
  - Quem pausou não é surpreendido: a página lembra (bolinho:radio:pausado) e só volta a tocar sozinha depois que
    alguém tocar ▶ de novo. Com "economia de dados" ligada, não toca sozinha.
  - ⏯ pausa e continua; ⏮ ⏭ trocam; as bolinhas mostram as 10 músicas e escolhem uma.
  - Cada música baixa só quando vai tocar (preload="none").
  - Lembra em que música parou (localStorage, com proteção para quando não houver).
  - Tela de bloqueio do celular mostra a música e os botões (Media Session).
*/
(function () {
  // Rock alegre e leve, para criança: tom maior, pouca distorção (medido em cada faixa antes de entrar).
  var K = 'Kevin MacLeod', H = 'HoliznaCC0';
  var MUSICAS = [
    { t: 'Classic', a: 'classic', au: H },
    { t: 'Chipper', a: 'chipper', au: K },
    { t: 'Americana', a: 'americana', au: H },
    { t: 'Cool Rock', a: 'cool-rock', au: K },
    { t: 'Hotrock', a: 'hotrock', au: K },
    { t: 'Jams', a: 'jams', au: H },
    { t: 'Gearhead', a: 'gearhead', au: K },
    { t: 'Feelin Good', a: 'feelin-good', au: K },
    { t: 'Delay Rock', a: 'delay-rock', au: K },
    { t: 'RetroFuture Clean', a: 'retrofuture-clean', au: K }
  ];
  var CHAVE = 'bolinho:radio:musica';
  var CHAVE_PAUSA = 'bolinho:radio:pausado';
  function pausouAntes() { try { return localStorage.getItem(CHAVE_PAUSA) === '1'; } catch (e) { return false; } }
  function lembrarPausa(sim) { try { if (sim) localStorage.setItem(CHAVE_PAUSA, '1'); else localStorage.removeItem(CHAVE_PAUSA); } catch (e) {} }

  function ler() { try { return parseInt(localStorage.getItem(CHAVE), 10) || 0; } catch (e) { return 0; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, String(v)); } catch (e) {} }

  var atual = ler() % MUSICAS.length;
  var falhas = 0;
  var audio = new Audio();
  audio.preload = 'none';
  audio.volume = 0.8;

  var css = '' +
    'body{padding-bottom:7.5rem!important}' +
    '.radio{position:fixed;left:50%;bottom:.8rem;transform:translateX(-50%);z-index:15;width:calc(100% - 1.6rem);max-width:36rem;display:flex;align-items:center;gap:.6rem;padding:.55rem .8rem .55rem .55rem;border-radius:999px;background:rgba(26,20,70,.92);border:1px solid #3a2f73;box-shadow:0 10px 30px rgba(0,0,0,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#f3f0ff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.radio button{flex:none;border:0;cursor:pointer;color:inherit;background:transparent;border-radius:50%;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;font:inherit}' +
    '.radio button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}' +
    '.radio svg{width:22px;height:22px;fill:currentColor}' +
    '.radio .r-play{width:52px;height:52px;background:#ff4fa3;background:linear-gradient(135deg,#ff4fa3,#ff9f1c);color:#1a1446;box-shadow:0 0 18px rgba(255,79,163,.45)}' +
    '.radio .r-play svg{width:26px;height:26px}' +
    '.r-disco{flex:none;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,#ffd166 0 14%,#1a1446 15% 22%,#2a1f6b 23% 60%,#14103a 61%);border:2px solid #3a2f73;display:none}' +
    '.radio.tocando .r-disco{animation:r-gira 2.4s linear infinite}' +
    '@keyframes r-gira{to{transform:rotate(360deg)}}' +
    '.r-info{flex:1;min-width:0;overflow:hidden}' +
    '.r-titulo{font-weight:800;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:transform .25s ease-out,opacity .25s ease-out}' +
    '.r-titulo.troca{transform:translateX(-18px);opacity:0}' +
    '.r-autor{font-size:.78rem;color:#b3acd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.r-autor a{color:#3ee8ff}' +
    '.r-bolinhas{display:none;margin-top:.1rem}' +
    '.r-bolinhas button{width:24px;height:24px;border-radius:6px}' +
    '.r-bolinhas i{display:block;width:12px;height:5px;border-radius:3px;background:#3a2f73}' +
    '.r-bolinhas button[aria-current] i{background:#c6ff3d;width:18px}' +
    /* as bolinhas só aparecem onde cabem com alvo de toque de 24 px; no celular, ⏮ ⏭ trocam */
    '@media (min-width:34rem){.r-disco{display:block}.r-bolinhas{display:flex}}' +
    '@media (prefers-reduced-motion:reduce){.radio.tocando .r-disco{animation:none}.r-titulo{transition:none}}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  var ICONE = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    ant: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12L18 18V6z"/></svg>',
    prox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>'
  };

  var barra = document.createElement('div');
  barra.className = 'radio';
  barra.setAttribute('role', 'region');
  barra.setAttribute('aria-label', 'Rádio do Bolinho / Bolinho radio');
  var bolinhas = '';
  for (var k = 0; k < MUSICAS.length; k++) bolinhas += '<button type="button" data-n="' + k + '" aria-label="' + (k + 1) + ': ' + MUSICAS[k].t + '"><i></i></button>';
  barra.innerHTML = '<div class="r-disco" aria-hidden="true"></div>' +
    '<button type="button" class="r-ant" aria-label="Música anterior / Previous">' + ICONE.ant + '</button>' +
    '<button type="button" class="r-play" aria-label="Tocar / Play">' + ICONE.play + '</button>' +
    '<button type="button" class="r-prox" aria-label="Próxima música / Next">' + ICONE.prox + '</button>' +
    '<div class="r-info"><div class="r-titulo" aria-live="polite"></div>' +
    '<div class="r-autor"></div><div class="r-bolinhas">' + bolinhas + '</div></div>';
  document.body.appendChild(barra);

  var bPlay = barra.querySelector('.r-play');
  var titulo = barra.querySelector('.r-titulo');
  var autor = barra.querySelector('.r-autor');
  var listaBolinhas = barra.querySelectorAll('.r-bolinhas button');
  var comecou = false;

  function mostrar() {
    titulo.classList.add('troca');
    setTimeout(function () {
      titulo.textContent = comecou ? MUSICAS[atual].t : '🎸 Rock no Bolinho';
      titulo.classList.remove('troca');
    }, 120);
    var m = MUSICAS[atual];
    autor.innerHTML = (comecou ? (atual + 1) + '/' + MUSICAS.length + ' · ' + m.au + ' · ' + (m.au === H ? 'CC0' : 'CC BY 4.0') : 'Tocar / Play') + ' · <a href="https://github.com/MarceloNeco/marceloneco.github.io/blob/main/bolinho-de-chuva/CREDITOS.md" target="_blank" rel="noopener">créditos</a>';
    for (var i = 0; i < listaBolinhas.length; i++) {
      if (i === atual) listaBolinhas[i].setAttribute('aria-current', 'true'); else listaBolinhas[i].removeAttribute('aria-current');
    }
    if ('mediaSession' in navigator && comecou && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: MUSICAS[atual].t, artist: MUSICAS[atual].au, album: 'Bolinho de Chuva',
          artwork: [{ src: 'icone-512.png', sizes: '512x512', type: 'image/png' }] });
      } catch (e) {}
    }
  }

  function botaoPlay() {
    var tocando = !audio.paused;
    bPlay.innerHTML = tocando ? ICONE.pausa : ICONE.play;
    bPlay.setAttribute('aria-label', tocando ? 'Pausar / Pause' : 'Tocar / Play');
    barra.classList.toggle('tocando', tocando);
  }

  function tocar(n) {
    atual = (n + MUSICAS.length) % MUSICAS.length;
    gravar(atual);
    comecou = true;
    audio.src = '/bolinho-de-chuva/musicas/' + MUSICAS[atual].a + '.mp3';
    mostrar();
    var p = audio.play();
    if (p && p.catch) p.catch(function () { botaoPlay(); });
  }

  bPlay.addEventListener('click', function () {
    if (!comecou) { lembrarPausa(false); tocar(atual); return; }
    if (audio.paused) { lembrarPausa(false); var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    else { lembrarPausa(true); audio.pause(); }
  });
  barra.querySelector('.r-ant').addEventListener('click', function () { lembrarPausa(false); tocar(atual - 1); });
  barra.querySelector('.r-prox').addEventListener('click', function () { lembrarPausa(false); tocar(atual + 1); });
  for (var j = 0; j < listaBolinhas.length; j++) {
    listaBolinhas[j].addEventListener('click', function () { lembrarPausa(false); tocar(parseInt(this.getAttribute('data-n'), 10)); });
  }

  audio.addEventListener('play', botaoPlay);
  audio.addEventListener('pause', botaoPlay);
  audio.addEventListener('playing', function () { falhas = 0; });
  audio.addEventListener('ended', function () { tocar(atual + 1); });
  // Música que não abriu (sem internet, arquivo faltando): pula para a próxima, sem ficar em laço.
  audio.addEventListener('error', function () {
    if (!comecou) return;
    falhas++;
    if (falhas < MUSICAS.length) tocar(atual + 1);
    else { autor.textContent = 'Sem internet para tocar agora. / No connection.'; botaoPlay(); }
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', function () { lembrarPausa(false); if (!comecou) tocar(atual); else audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { lembrarPausa(true); audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { tocar(atual - 1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { tocar(atual + 1); });
    } catch (e) {}
  }

  mostrar();
  botaoPlay();

  // Tocar sozinho ao abrir. Se o navegador bloquear, espera o primeiro toque em qualquer lugar da página.
  var con = navigator.connection;
  if (!pausouAntes() && !(con && con.saveData)) {
    var esperando = false;
    var noPrimeiroToque = function (e) {
      if (e.target && e.target.closest && e.target.closest('.radio')) return;   // o player cuida dos botões dele
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.removeEventListener(t, noPrimeiroToque, true); });
      if (audio.paused && !pausouAntes()) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    };
    comecou = true;
    audio.src = '/bolinho-de-chuva/musicas/' + MUSICAS[atual].a + '.mp3';
    mostrar();
    var p0 = audio.play();
    if (p0 && p0.catch) p0.catch(function (err) {
      if (!err || err.name !== 'NotAllowedError' || esperando) return;
      esperando = true;
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.addEventListener(t, noPrimeiroToque, true); });
    });
  }
})();
