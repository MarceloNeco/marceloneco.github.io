/*
  Bolinho de Chuva — service worker.
  Serve para duas coisas: o navegador aceitar instalar o Bolinho como aplicativo e a estante abrir
  mesmo sem internet. Rede primeiro (sempre a versão mais nova do site); sem resposta em 4 s, usa a
  cópia guardada. O cache leva o nome do app e só apaga caches do próprio Bolinho, porque todos os
  apps da SolverONE moram no mesmo endereço e dividem o espaço de cache.
  A cada mudança no Bolinho, suba a VERSAO.
*/
var VERSAO = 1;
var PREFIXO = 'dgo-bolinho-de-chuva-';
var CACHE = PREFIXO + 'v' + VERSAO;
var BASICO = ['./', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'icone-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICO); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf(PREFIXO) === 0 && n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  var escopo = new URL(self.registration.scope);
  // Só cuida do que é do próprio Bolinho; jogos e outros apps seguem com o service worker deles.
  if (req.method !== 'GET' || url.origin !== escopo.origin || url.pathname.indexOf(escopo.pathname) !== 0) return;
  e.respondWith(new Promise(function (resolve) {
    var respondeu = false;
    function daCopia() {
      if (respondeu) return;
      caches.match(req, { ignoreSearch: true }).then(function (r) {
        if (respondeu) return;
        if (r) { respondeu = true; resolve(r); }
      });
    }
    var prazo = setTimeout(daCopia, 4000);
    fetch(req, { cache: 'no-cache' }).then(function (r) {
      clearTimeout(prazo);
      if (r && r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
      if (!respondeu) { respondeu = true; resolve(r); }
    }).catch(function () {
      clearTimeout(prazo);
      caches.match(req, { ignoreSearch: true }).then(function (r) {
        if (!respondeu) { respondeu = true; resolve(r || Response.error()); }
      });
    });
  }));
});
