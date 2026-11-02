/*
  Catálogo do Bolinho de Chuva — A LISTA ÚNICA dos jogos e apps para criança.
  Daqui saem os cartões da estante (/bolinho-de-chuva/), da TV (/kids/), o botão "📲 Instalar" de cada cartão,
  o "Guardar todos neste aparelho" e o "Instalar um por um". Jogo novo = uma entrada nesta lista; nada mais.

  Campos de cada jogo:
    id       nome curto, sem espaço (identifica o jogo)
    nome     nome que aparece no cartão
    ico      emoji do cartão          cor   cor de destaque do cartão
    url      endereço do jogo a partir da raiz do site (funciona em solverone.com.br e no endereço antigo)
    texto    descrição em português   en    descrição em inglês   tag   texto do botão do cartão
    instalar true = pode ser instalado e funciona sem internet (o service worker fica em url + 'sw.js')
    soOnline true = precisa de internet (ex.: YouTube e TV); o cartão mostra "🌐 Só com internet"
    tv       { texto, tag, param } = aparece na página da TV (/kids/); param vai no fim do endereço

  Como a página usa: <div class="grid" data-catalogo="estante"></div> (ou "tv") e, logo depois,
  <script src="catalogo.js"></script>. O script monta os cartões na hora (a página não pisca vazia).
*/
(function () {
  var JOGOS = [
    { id: 'baguncolandia', nome: 'Bagunçolândia', ico: '🍉', cor: '#c6ff3d', url: '/FeatureTesting/baguncolandia/',
      texto: 'Frutas, doces e personagens voam na TV e você corta, pega, chuta, pula e abaixa com o corpo. 1 ou 2 pessoas, boneco personalizável, ou no dedo no celular.',
      en: 'Slice, catch, kick, jump and duck with your body on the TV. Or by finger on the phone.',
      tag: '▶ Brincar / Play', instalar: true,
      tv: { texto: 'Corte, pegue, chute, pule e abaixe com o corpo. A TV mostra o código; o celular filma.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'peluqueria', nome: 'Peluqueria', ico: '💇', cor: '#ffd166', url: '/FeatureTesting/peluqueria/',
      texto: 'O provador maluco da família: uma coroa, um bigode ou uma peruca desce sobre o bicho e você toca na hora certa. Quanto mais perto, mais pontos. UHUL!',
      en: "The family's crazy fitting room: tap at the right moment, points for precision.",
      tag: '▶ Brincar / Play', instalar: true,
      tv: { texto: 'Um chapéu, um bigode ou uma peruca desce sobre o bicho: aperte OK na hora certa.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'danca-na-sala', nome: 'Dança na Sala', ico: '💃', cor: '#ff4fa3', url: '/FeatureTesting/danca-na-sala.html',
      texto: 'A TV toca a música do YouTube e mostra quem está dançando, com neon, fogos e placar de energia. O celular filma e comanda.',
      en: 'Living Room Dance: YouTube on the TV, phone cameras live, energy score.',
      tag: '▶ Dançar / Dance', soOnline: true,
      tv: { texto: 'Música do YouTube na TV e as câmeras dos celulares ao vivo, com neon e placar de energia.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'vruuum', nome: 'Vruuum!', ico: '🏎️', cor: '#ff9f1c', url: '/FeatureTesting/vruuum/',
      texto: 'Corrida de carrinho: desvie dos cones e da lama, pegue estrelas, turbo de arco-íris e rampas, passando pela praia, floresta, doces, neve e cidade neon. 1 ou 2 jogadores na mesma tela.',
      en: 'Kart race: dodge, grab stars, rainbow turbo and ramps across 4 worlds. 1 or 2 players.',
      tag: '▶ Correr / Race', instalar: true,
      tv: { texto: 'Corrida de carrinho: setas do controle para virar, OK para buzinar. Pegue as estrelas!', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'purpurina', nome: 'Purpurina', ico: '💄', cor: '#cfa8ff', url: '/FeatureTesting/purpurina/',
      texto: 'Maquiagem, roupas, joias e muito brilho: monte a personagem, faça a maquiagem com o pincel, vista roupas e acessórios, cumpra desafios e desfile com confete. Brinque na TV com o celular de controle e música do YouTube ou do Spotify.',
      en: 'Makeup, outfits and sparkle: style your character, take challenges and walk the runway.',
      tag: '▶ Brilhar / Sparkle', instalar: true,
      tv: { texto: 'Maquiagem, roupas e desfile. A TV mostra um código: no celular, toque em 📺 Conectar na TV e brinque com o celular de controle. Música do YouTube e do Spotify.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'rabiscolandia', nome: 'Rabiscolândia', ico: '🎨', cor: '#c6ff3d', url: '/FeatureTesting/rabiscolandia/',
      texto: 'Desenhar, livro de colorir e pintar por números, com pincéis que mexem, adesivos animados, paisagens e música. Desenhe com a mão na frente da câmera ou na TV com o celular de controle.',
      en: 'Draw, color and paint by numbers with live brushes, animated stickers and your hand in the camera.',
      tag: '▶ Desenhar / Draw', instalar: true,
      tv: { texto: 'Desenhar e colorir na TV. A TV mostra um código: no celular, toque em 📺 Na TV → 🎮 Controlar e desenhe com o dedo, mexendo o celular ou com a mão na câmera.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'contador-de-historias', nome: 'Contador de Histórias', ico: '📖', cor: '#3ee8ff', url: '/contador-de-historias/',
      texto: 'Histórias para dormir: um acervo para ler e ouvir, e a criação de histórias novas com os nomes da sua família.',
      en: 'Storyteller: bedtime stories to read, listen to and create.',
      tag: '▶ Ouvir / Listen', instalar: true,
      tv: { texto: 'Histórias para ler e ouvir na tela grande, antes de dormir.', tag: '▶ Abrir', param: '' } }
  ];
  // cartão final da estante (não é um jogo)
  var EM_BREVE = { ico: '➕', nome: 'Próxima brincadeira', cor: '#ffd166', texto: 'Mais jogos de movimento, música e imaginação estão a caminho.', en: 'More games on the way.', tag: '🚧 Em breve / Soon' };

  window.BolinhoCatalogo = {
    jogos: JOGOS,
    instalaveis: function () { return JOGOS.filter(function (j) { return j.instalar; }); },
    sw: function (j) { return j.url.replace(/[^\/]*$/, '') + 'sw.js'; }
  };

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function cartao(j, modo) {
    var a = el('a', 'card');
    a.style.setProperty('--c', j.cor);
    var tv = modo === 'tv' && j.tv;
    a.href = tv ? j.url + (j.tv.param || '') : j.url;
    a.setAttribute('data-jogo', j.id);
    if (tv) a.tabIndex = 0;
    else if (j.instalar) { a.setAttribute('data-instalar', j.url); a.setAttribute('data-sw', window.BolinhoCatalogo.sw(j)); }
    else if (j.soOnline) a.setAttribute('data-so-online', '');
    a.appendChild(el('div', 'ico', j.ico));
    a.appendChild(el('h2', null, j.nome));
    a.appendChild(el('p', null, tv ? j.tv.texto : j.texto));
    if (!tv && j.en) a.appendChild(el('p', 'en', j.en));
    a.appendChild(el('span', 'tag', tv ? j.tv.tag : j.tag));
    return a;
  }

  // monta cada grade marcada com data-catalogo que já existe na página (o script vem logo depois dela)
  var grades = document.querySelectorAll('[data-catalogo]');
  for (var i = 0; i < grades.length; i++) {
    var g = grades[i], modo = g.getAttribute('data-catalogo');
    if (g.getAttribute('data-montado')) continue;
    JOGOS.forEach(function (j) { if (modo !== 'tv' || j.tv) g.appendChild(cartao(j, modo)); });
    if (modo === 'estante') {
      var b = cartao(EM_BREVE, 'estante');
      b.className = 'card breve'; b.href = '#'; b.setAttribute('aria-disabled', 'true'); b.tabIndex = -1; b.removeAttribute('data-jogo');
      g.appendChild(b);
    }
    g.setAttribute('data-montado', '1');
  }
})();
