/*
  Rádio do Bolinho: 10 músicas de rock gravadas (Kevin MacLeod, licença CC BY 4.0, pasta musicas/,
  créditos em CREDITOS.md) tocando uma depois da outra, num player fixo no pé da página.
  - Só começa com um toque (os navegadores não deixam site tocar som sozinho).
  - ⏯ pausa e continua; ⏮ ⏭ trocam; as bolinhas mostram as 10 músicas e escolhem uma.
  - Nada baixa antes do toque (preload="none"); cada música baixa só quando vai tocar.
  - Lembra em que música parou (localStorage, com proteção para quando não houver).
  - Tela de bloqueio do celular mostra a música e os botões (Media Session).
*/
(function () {
  var MUSICAS = [
    { t: 'Metalmania', a: 'metalmania' },
    { t: 'Big Mojo', a: 'big-mojo' },
    { t: "Ryno's Theme", a: 'rynos-theme' },
    { t: 'Volatile Reaction', a: 'volatile-reaction' },
    { t: 'Exit the Premises', a: 'exit-the-premises' },
    { t: 'Ready Aim Fire', a: 'ready-aim-fire' },
    { t: 'Getting it Done', a: 'getting-it-done' },
    { t: 'Heroic Age', a: 'heroic-age' },
    { t: 'Movement Proposition', a: 'movement-proposition' },
    { t: 'Unholy Knight', a: 'unholy-knight' }
  ];
  var AUTOR = 'Kevin MacLeod';
  var CHAVE = 'bolinho:radio:musica';

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
    autor.innerHTML = (comecou ? (atual + 1) + '/' + MUSICAS.length : 'Tocar / Play') + ' · ' + AUTOR + ' · <a href="https://github.com/MarceloNeco/marceloneco.github.io/blob/main/bolinho-de-chuva/CREDITOS.md" target="_blank" rel="noopener">CC BY 4.0</a>';
    for (var i = 0; i < listaBolinhas.length; i++) {
      if (i === atual) listaBolinhas[i].setAttribute('aria-current', 'true'); else listaBolinhas[i].removeAttribute('aria-current');
    }
    if ('mediaSession' in navigator && comecou && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: MUSICAS[atual].t, artist: AUTOR, album: 'Bolinho de Chuva',
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
    audio.src = 'musicas/' + MUSICAS[atual].a + '.mp3';
    mostrar();
    var p = audio.play();
    if (p && p.catch) p.catch(function () { botaoPlay(); });
  }

  bPlay.addEventListener('click', function () {
    if (!comecou) { tocar(atual); return; }
    if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else audio.pause();
  });
  barra.querySelector('.r-ant').addEventListener('click', function () { tocar(atual - 1); });
  barra.querySelector('.r-prox').addEventListener('click', function () { tocar(atual + 1); });
  for (var j = 0; j < listaBolinhas.length; j++) {
    listaBolinhas[j].addEventListener('click', function () { tocar(parseInt(this.getAttribute('data-n'), 10)); });
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
      navigator.mediaSession.setActionHandler('play', function () { if (!comecou) tocar(atual); else audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { tocar(atual - 1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { tocar(atual + 1); });
    } catch (e) {}
  }

  mostrar();
  botaoPlay();
})();
