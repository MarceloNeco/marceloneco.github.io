/* O Bolinho de Chuva mudou para /kids/. Este service worker substitui o antigo e se desliga: apaga as cópias
   guardadas por ele (caches "dgo-bolinho-de-chuva-", só desta pasta), tira o próprio registro e recarrega as abas
   abertas, que então vão para o endereço novo. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf('dgo-bolinho-de-chuva-') === 0; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.registration.unregister(); })
    .then(function () { return self.clients.matchAll({ type: 'window' }); })
    .then(function (abas) { abas.forEach(function (a) { try { a.navigate(a.url); } catch (er) {} }); }));
});
