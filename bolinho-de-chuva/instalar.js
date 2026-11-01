/*
  Botão fixo "Instalar o aplicativo" — usado pela estante do Bolinho de Chuva (/bolinho-de-chuva/)
  e pela tela da TV (/kids/). Cada página inclui:
    <script src=".../bolinho-de-chuva/instalar.js" data-nome="Bolinho de Chuva" data-icone="icone-192.png"></script>
  e tem na própria pasta um manifest.webmanifest (com <link rel="manifest">) e um sw.js.

  Um botão só, para qualquer aparelho:
  - Chrome, Edge e Samsung no Android e Chrome/Edge no computador entregam a janela de instalar
    (beforeinstallprompt): o toque instala na hora.
  - Onde o navegador não tem essa janela (iPhone, Mac, Firefox, tablet Fire da Amazon, TV, navegador
    dentro de outro app), o toque abre o passo a passo daquele aparelho, detectado sem perguntar.
  - Já aberto como aplicativo, o botão some. "Já instalei" também esconde (se o navegador voltar a
    oferecer a instalação, é porque não está instalado, e o botão volta).
  Enquanto a janela de passos está aberta, <body> ganha a classe "bc-modal" (o kids.js deixa as
  setas e o OK do controle para ela).
*/
(function () {
  var script = document.currentScript;
  var NOME = (script && script.getAttribute('data-nome')) || 'Bolinho de Chuva';
  var ICONE = (script && script.getAttribute('data-icone')) || 'icone-192.png';
  var ua = navigator.userAgent;
  var CHAVE = 'bolinho:instalado:' + location.pathname;
  var pedido = null; // janela de instalar guardada pelo navegador

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { if (v) localStorage.setItem(CHAVE, v); else localStorage.removeItem(CHAVE); } catch (e) {} }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  var comoApp = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches)) || navigator.standalone === true;
  if (comoApp) return;

  var css = '' +
    '.bc-inst{position:sticky;top:0;z-index:10;display:flex;justify-content:center;width:100%;padding:.7rem 0 .8rem;pointer-events:none}' +
    '.bc-inst[hidden]{display:none}' +
    '.bc-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:.6rem;min-height:48px;padding:.55rem 1.3rem .55rem .9rem;border:0;border-radius:999px;font:inherit;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-weight:800;font-size:1.05rem;color:#1a1446;background:#c6ff3d;background:linear-gradient(90deg,#c6ff3d,#3ee8ff);box-shadow:0 6px 20px rgba(62,232,255,.25);cursor:pointer}' +
    '.bc-btn svg{width:1.6rem;height:1.6rem;flex:none}' +
    '.bc-btn small{font-weight:600;font-size:.8rem;opacity:.75}' +
    '.bc-btn:hover,.bc-btn:focus,.bc-btn:focus-visible{outline:3px solid #ffd166;outline-offset:3px}' +
    '.bc-btn.ok{background:#c6ff3d}' +
    '.bc-fundo{position:fixed;top:0;left:0;right:0;bottom:0;z-index:20;background:rgba(5,4,20,.7);display:flex;align-items:flex-end;justify-content:center;padding:1rem;opacity:0;transition:opacity .2s ease-out;text-align:left}' +
    '.bc-fundo[hidden]{display:none}' +
    '.bc-fundo.aberto{opacity:1}' +
    '.bc-passos{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:1rem;color:#f3f0ff;background:#221b4d;border:1px solid #3a2f73;border-radius:20px;max-width:30rem;width:100%;max-height:90vh;overflow:auto;padding:1.3rem 1.3rem 1.1rem;transform:translateY(24px);transition:transform .2s ease-out}' +
    '.bc-fundo.aberto .bc-passos{transform:none}' +
    '@media (min-width:40rem){.bc-fundo{align-items:center}}' +
    '.bc-topo{display:flex;align-items:center;gap:.7rem;margin-bottom:.8rem}' +
    '.bc-topo img{width:48px;height:48px;border-radius:12px}' +
    '.bc-passos h2{font-size:1.2rem;flex:1;margin:0;color:#f3f0ff;background:none}' +
    '.bc-fechar{width:44px;height:44px;border:0;border-radius:50%;background:#3a2f73;color:#f3f0ff;font-size:1.3rem;cursor:pointer;flex:none}' +
    '.bc-passos ol{padding-left:1.4rem;line-height:1.55;margin:.6rem 0}' +
    '.bc-passos li{margin:.35rem 0}' +
    '.bc-passos p{line-height:1.5;margin:.5rem 0;font-size:1rem;color:#f3f0ff}' +
    '.bc-passos .en{color:#b3acd6;font-size:.85rem;font-style:italic}' +
    '.bc-passos .aviso{background:rgba(255,209,102,.12);border-left:3px solid #ffd166;padding:.5rem .7rem;border-radius:8px}' +
    '.bc-passos a{color:#3ee8ff}' +
    '.bc-botoes{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}' +
    '.bc-botoes a,.bc-botoes button{min-height:44px;padding:.5rem 1rem;border-radius:999px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;border:0}' +
    '.bc-botoes a:focus,.bc-botoes button:focus,.bc-fechar:focus{outline:3px solid #ffd166;outline-offset:2px}' +
    '.bc-passos a.bc-forte{background:#c6ff3d;color:#1a1446}' +
    '.bc-leve{background:transparent;color:#f3f0ff;border:1px solid #3a2f73!important}' +
    '@media (prefers-reduced-motion:reduce){.bc-passos,.bc-fundo{transition:none}}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  var barra = document.createElement('div');
  barra.className = 'bc-inst';
  barra.innerHTML = '<button type="button" class="bc-btn" aria-haspopup="dialog">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7"/><path d="M9 11l3 3 3-3"/><path d="M10.5 18.5h3"/></svg>' +
    '<span>Instalar o aplicativo <small>· Install app</small></span></button>';
  document.body.insertBefore(barra, document.body.firstChild);
  var botao = barra.querySelector('button');
  var texto = barra.querySelector('span');
  if (ler()) barra.hidden = true;

  var fundo = document.createElement('div');
  fundo.className = 'bc-fundo';
  fundo.hidden = true;
  fundo.innerHTML = '<div class="bc-passos" role="dialog" aria-modal="true" aria-labelledby="bcTitulo">' +
    '<div class="bc-topo"><img src="' + ICONE + '" alt=""><h2 id="bcTitulo">Instalar o ' + NOME + '</h2>' +
    '<button type="button" class="bc-fechar" aria-label="Fechar / Close">✕</button></div>' +
    '<div class="bc-corpo"></div>' +
    '<div class="bc-botoes"><button type="button" class="bc-leve bc-ja">✓ Já instalei / Done</button></div></div>';
  document.body.appendChild(fundo);
  var corpo = fundo.querySelector('.bc-corpo');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    pedido = e;
    gravar(null);       // o navegador diz que ainda não está instalado
    barra.hidden = false;
  });
  window.addEventListener('appinstalled', function () { pedido = null; gravar('1'); pronto(); });

  function pronto() {
    botao.className = 'bc-btn ok';
    texto.innerHTML = '✓ Instalado! Procure o ícone ' + NOME + ' <small>· Installed!</small>';
    setTimeout(function () { barra.hidden = true; }, 6000);
  }

  // Qual aparelho e navegador é (para escrever o passo a passo certo).
  var tv = /SmartTV|SMART-TV|Web0S|WebOS|Tizen|NetCast|HbbTV|BRAVIA|VIDAA|Roku|AFT[A-Z]|Android TV|GoogleTV|CrKey/i.test(ua);
  var fire = /Silk\//.test(ua) && !tv;   // tablet Fire da Amazon (navegador Silk)
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  var samsung = /SamsungBrowser/.test(ua) && !tv;
  var dentroDeApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|; wv\)|GSA\//.test(ua);
  var firefox = /Firefox|FxiOS/.test(ua);
  var edge = /Edg\//.test(ua);
  var macSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua) && !ios;
  var endereco = location.href.split('#')[0];

  function linkChrome() {
    return 'intent://' + location.host + location.pathname + location.search + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(endereco) + ';end';
  }

  function passos() {
    if (tv) return '<p>Na TV não existe "instalar" pelo navegador, mas dá para deixar o ' + NOME + ' a um clique:</p>' +
      '<ol><li>Com esta página aberta, aperte o botão de <b>menu</b> do navegador da TV (às vezes é a engrenagem ou os <b>três pontinhos</b>).</li>' +
      '<li>Escolha <b>Adicionar aos favoritos</b> (em algumas TVs aparece <b>Fixar na tela inicial</b> ou <b>Adicionar à página inicial</b>: use esse, se tiver).</li>' +
      '<li>Da próxima vez, abra o navegador e escolha <b>' + NOME + '</b> nos favoritos.</li></ol>' +
      '<p class="en">On the TV: open the browser menu and choose "Add to favorites" (or "Pin to home", if your TV has it).</p>' +
      '<p class="aviso">TV LG: dá para ter o ícone na barra de apps, igual ao Netflix. Peça para alguém seguir no computador o <a href="https://github.com/MarceloNeco/FeatureTesting/blob/main/tv-lg-kids/LEIA-ME.md" target="_blank" rel="noopener">passo a passo da TV LG</a>.</p>';
    if (fire) return '<p>No tablet Fire, o navegador da Amazon (Silk) põe o ícone na tela inicial assim:</p>' +
      '<ol><li>Toque nos <b>três pontinhos ⋮</b>, no canto de cima, à direita da barra de endereço.</li>' +
      '<li>Toque em <b>Adicionar à tela inicial</b> (em inglês: <b>Add to Home Screen</b>). Se não estiver na lista, role a lista para baixo.</li>' +
      '<li>Deixe o nome <b>' + NOME + '</b> e toque em <b>Adicionar</b>.</li>' +
      '<li>Volte para a tela inicial do tablet: o ícone do ' + NOME + ' está lá. Toque nele para abrir direto.</li></ol>' +
      '<p class="en">Fire tablet (Silk): ⋮ menu → Add to Home Screen → Add.</p>' +
      '<p class="aviso">Se o tablet estiver no perfil de criança (Amazon Kids) e essa opção não aparecer, faça estes passos no perfil do adulto.</p>';
    if (ios) return '<ol><li>Abra esta página no <b>Safari</b> (se estiver dentro de outro app, toque em <b>Abrir no Safari</b>).</li>' +
      '<li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima ⬆, embaixo ou no topo da tela).</li>' +
      '<li>Role a lista e toque em <b>Adicionar à Tela de Início</b>.</li>' +
      '<li>Toque em <b>Adicionar</b>. O ícone aparece junto dos seus apps.</li></ol>' +
      '<p class="en">iPhone/iPad: Safari → Share ⬆ → Add to Home Screen → Add.</p>';
    if (samsung) return '<p>No navegador da Samsung, instalar pode mostrar um alerta do Google ("app de risco"). O ' + NOME + ' não tem risco nenhum: o alerta é do jeito que esse navegador instala. Pelo <b>Chrome</b> instala sem alerta:</p>' +
      '<ol><li>Toque em <b>Abrir no Chrome</b> (botão abaixo).</li>' +
      '<li>No Chrome, toque de novo em <b>Instalar o aplicativo</b>, no topo da página.</li>' +
      '<li>Toque em <b>Instalar</b>. Pronto: o ícone aparece na tela do celular.</li></ol>' +
      '<p class="aviso">Já apareceu o alerta? Toque em <b>OK</b> e siga os passos acima.</p>' +
      '<p class="en">Samsung Internet may show a Google "risky app" alert. Install from Chrome instead.</p>' +
      '<div class="bc-botoes"><a class="bc-forte" href="' + linkChrome() + '">Abrir no Chrome / Open in Chrome</a></div>';
    if (android && dentroDeApp) return '<p>Você abriu esta página dentro de outro app (WhatsApp, Instagram…). Para instalar, abra no Chrome:</p>' +
      '<ol><li>Toque em <b>Abrir no Chrome</b> (botão abaixo) ou nos <b>três pontinhos ⋮</b> e em <b>Abrir no navegador</b>.</li>' +
      '<li>No Chrome, toque em <b>Instalar o aplicativo</b>, no topo da página.</li></ol>' +
      '<p class="en">Opened inside another app: open in Chrome, then tap "Install app".</p>' +
      '<div class="bc-botoes"><a class="bc-forte" href="' + linkChrome() + '">Abrir no Chrome / Open in Chrome</a></div>';
    if (android) return '<ol><li>Toque nos <b>três pontinhos ⋮</b> do navegador (no canto de cima ou de baixo).</li>' +
      '<li>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li>' +
      '<li>Confirme em <b>Instalar</b>. O ícone aparece junto dos seus apps.</li></ol>' +
      '<p class="en">Android: browser menu ⋮ → Install app (or Add to Home screen).</p>' +
      '<p class="aviso">Se essa opção não aparecer, talvez já esteja instalado: procure o ícone <b>' + NOME + '</b> nos seus apps.</p>';
    if (macSafari) return '<ol><li>No menu do topo da tela, clique em <b>Arquivo</b>.</li>' +
      '<li>Clique em <b>Adicionar ao Dock</b> e em <b>Adicionar</b>.</li></ol>' +
      '<p class="en">Mac Safari: File → Add to Dock.</p>';
    if (firefox) return '<p>O Firefox do computador não instala sites como aplicativo. Abra esta mesma página no <b>Chrome</b> ou no <b>Edge</b> e toque em <b>Instalar o aplicativo</b>.</p>' +
      '<p>Ou, para ter só um atalho: aperte <b>Ctrl + D</b> (no Mac, <b>⌘ + D</b>) para guardar nos favoritos.</p>' +
      '<p class="en">Firefox desktop cannot install sites: use Chrome or Edge, or press Ctrl+D to bookmark.</p>';
    if (edge) return '<ol><li>Clique nos <b>três pontinhos ⋯</b> no canto de cima do Edge.</li>' +
      '<li>Clique em <b>Aplicativos</b> → <b>Instalar este site como um aplicativo</b>.</li>' +
      '<li>Clique em <b>Instalar</b>. Abre na janela própria e ganha ícone no menu Iniciar.</li></ol>' +
      '<p class="en">Edge: ⋯ → Apps → Install this site as an app.</p>' +
      '<p class="aviso">Se a opção não aparecer, já deve estar instalado: procure <b>' + NOME + '</b> no menu Iniciar.</p>';
    return '<ol><li>Clique no ícone de <b>instalar</b> no fim da barra de endereço (um monitor com uma seta ⤓), se aparecer.</li>' +
      '<li>Ou clique nos <b>três pontinhos ⋮</b> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b>.</li>' +
      '<li>Clique em <b>Instalar</b>. Abre na janela própria, com ícone na área de trabalho.</li></ol>' +
      '<p class="en">Chrome: install icon in the address bar, or ⋮ → Cast, save and share → Install page as app.</p>' +
      '<p class="aviso">Se nada disso aparecer, já deve estar instalado: procure <b>' + NOME + '</b> nos seus programas.</p>';
  }

  // Janela de passos: abre com movimento curto, fecha no ✕, no Esc, tocando fora e no Voltar do celular.
  var naHistoria = false;
  function abrir() {
    corpo.innerHTML = passos();
    fundo.hidden = false;
    document.body.classList.add('bc-modal');
    requestAnimationFrame(function () { fundo.classList.add('aberto'); });
    fundo.querySelector('.bc-fechar').focus();
    try { history.pushState({ bcPassos: 1 }, ''); naHistoria = true; } catch (e) {}
  }
  function fechar(pelaHistoria) {
    if (fundo.hidden) return;
    fundo.classList.remove('aberto');
    fundo.hidden = true;
    document.body.classList.remove('bc-modal');
    if (!barra.hidden) botao.focus();
    if (naHistoria && !pelaHistoria) { naHistoria = false; history.back(); }
    naHistoria = false;
  }
  window.addEventListener('popstate', function () { if (!fundo.hidden) fechar(true); });
  fundo.querySelector('.bc-fechar').addEventListener('click', function () { fechar(); });
  fundo.addEventListener('click', function (e) { if (e.target === fundo) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) fechar(); });
  fundo.querySelector('.bc-ja').addEventListener('click', function () { gravar('1'); barra.hidden = true; fechar(); });

  botao.addEventListener('click', function () {
    if (!pedido) { abrir(); return; }
    var p = pedido;
    pedido = null; // a janela do navegador só pode ser usada uma vez
    p.prompt();
    p.userChoice.then(function (r) {
      if (r && r.outcome === 'accepted') { gravar('1'); pronto(); }
    }).catch(function () {});
  });
})();
