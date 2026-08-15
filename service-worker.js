// ═══════════════════════════════════════════
// SERVICE WORKER — cache do app shell (offline + instalável)
// ─────────────────────────────────────────────
// Bump no CACHE_NAME sempre que os arquivos abaixo mudarem
// (ou pelo menos junto do APP_VERSION em js/dados.js), senão
// os usuários instalados continuam vendo a versão antiga.
// ═══════════════════════════════════════════
const CACHE_NAME = 'confeipro-v12';

// Caminhos relativos ao escopo do SW — funciona tanto na raiz
// quanto num subdiretório de projeto do GitHub Pages
// (ex: usuario.github.io/confeipro/).
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/estilo.css',
  './css/tema.css',
  './js/app.js',
  './js/config.js',
  './js/dados.js',
  './js/dashboard.js',
  './js/ingredientes.js',
  './js/migracoes.js',
  './js/modal.js',
  './js/navegacao.js',
  './js/pedidos.js',
  './js/produtos.js',
  './js/receita.js',
  './js/tema.js',
  './js/utils.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(ARQUIVOS_PARA_CACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes.filter(function (nome) { return nome !== CACHE_NAME; })
             .map(function (nome) { return caches.delete(nome); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Estratégia: cache-first pro app shell, com atualização em segundo
// plano (stale-while-revalidate) — abre rápido e sempre offline,
// mas se pegar internet já busca a versão nova pra próxima visita.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  // Só trata pedidos same-origin (não mexe em fontes do Google etc.)
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (respostaCache) {
      const buscaRede = fetch(event.request).then(function (respostaRede) {
        if (respostaRede && respostaRede.ok) {
          const clone = respostaRede.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return respostaRede;
      }).catch(function () {
        // Sem rede: se não tem no cache e é navegação, cai pro index.html
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return undefined;
      });

      return respostaCache || buscaRede;
    })
  );
});
