// ═══════════════════════════════════════════════════════════════
// CONFEIPRO PWA — Service Worker v24
// HTML e assets: conjunto consistente por versão, disponível offline.
// Atualização: o app mostra "Atualizar agora" e envia SKIP_WAITING.
// ═══════════════════════════════════════════════════════════════
const CACHE_NAME = 'confeipro-v24';
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
  // Uma versão só fica disponível depois de baixar o conjunto inteiro.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS_PARA_CACHE)));
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

self.addEventListener('fetch', function(event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const base = new URL('./', self.location.href);
  const navegacao = req.mode === 'navigate' &&
    (url.pathname === base.pathname || url.pathname === new URL(OFFLINE_URL, base).pathname);
  const arquivo = ARQUIVOS_PARA_CACHE.some(path => new URL(path, base).pathname === url.pathname);
  if (!navegacao && !arquivo) return;

  // HTML e scripts da MESMA versão: a atualização é ativada pelo usuário.
  // Não misturar HTML novo da rede com scripts antigos do cache.
  event.respondWith(caches.open(CACHE_NAME).then(async function(cache) {
    const chave = navegacao ? OFFLINE_URL : new URL(url.pathname, url.origin).href;
    const salvo = await cache.match(chave);
    return salvo || fetch(req);
  }));
});
