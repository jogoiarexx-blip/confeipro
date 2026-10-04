// ═══════════════════════════════════════════════════════════════
// CONFEIPRO PWA — Service Worker v21
// Navegação: network-first com fallback offline.
// Assets: cache imediato + atualização em segundo plano.
// Atualização: o app mostra "Atualizar agora" e envia SKIP_WAITING.
// ═══════════════════════════════════════════════════════════════
const CACHE_NAME = 'confeipro-v21';
const OFFLINE_URL = './index.html';

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
  './js/gestao.js',
  './js/receita.js',
  './js/tema.js',
  './js/utils.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(ARQUIVOS_PARA_CACHE); })
      .then(function() { return caches.keys(); })
      .then(function(nomes) {
        // Ponte única v2.0 -> v2.1: acelera a adoção por quem já tem a
        // versão anterior instalada. Nas próximas versões, o app v2.1
        // já mostrará o botão "Atualizar agora".
        if (nomes.includes('confeipro-v20')) return self.skipWaiting();
      })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(nomes) {
        return Promise.all(
          nomes
            .filter(function(nome) { return nome.startsWith('confeipro-') && nome !== CACHE_NAME; })
            .map(function(nome) { return caches.delete(nome); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

function respostaOfflineNavegacao() {
  return caches.match(OFFLINE_URL).then(function(r) {
    return r || caches.match('./');
  });
}

self.addEventListener('fetch', function(event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML/navegação deve preferir a rede para o usuário receber a interface nova
  // assim que estiver online. Sem internet, cai para a cópia instalada.
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(function(res) {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(OFFLINE_URL, clone); });
          }
          return res;
        })
        .catch(respostaOfflineNavegacao)
    );
    return;
  }

  // Assets: resposta rápida do cache, mas atualiza silenciosamente pela rede.
  event.respondWith(
    caches.match(req).then(function(cacheHit) {
      const rede = fetch(req).then(function(res) {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(req, clone); });
        }
        return res;
      }).catch(function() { return cacheHit; });

      return cacheHit || rede;
    })
  );
});
