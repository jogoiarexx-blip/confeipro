// ═══════════════════════════════════════════
// MARCA — aplica o que está em config.js no cabeçalho
// ═══════════════════════════════════════════
function aplicarConfigVisual() {
  const logoHtml = `${CONFIG.emoji} ${CONFIG.nomeBase}<span class="logo-accent">${CONFIG.nomeDestaque}</span>`;
  document.getElementById('appLogo').innerHTML = logoHtml;
  document.getElementById('mobileLogo').innerHTML = logoHtml;
  document.getElementById('appTagline').textContent = CONFIG.tagline;
  document.getElementById('appBadge').textContent    = CONFIG.versao;
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  aplicarConfigVisual();
  atualizarInfoPWA();
  iniciarPWA();
  atualizarFabMobile(0);
  if (typeof iniciarGestao === 'function') iniciarGestao();
  const dataPedido = document.getElementById('pDataPedido');
  if (dataPedido && !dataPedido.value && typeof hojeISO === 'function') dataPedido.value = hojeISO();

  renderIngredientes();
  atualizarSelect();
  atualizarSelectProduto();
  renderReceita();
  renderPedidos();
  renderEtapasProduto();
  renderProdutos();
  atualizarDashboard();
  aplicarAtalhoDaURL();

  // Precificação automática do produto: recalcula ao digitar em qualquer campo
  ['pdNome','pdPeso','pdRendimento','pdGas','pdEnergia','pdEmbalagem',
   'pdValorHora','pdHoras','pdPerda','pdTaxa','pdMargem','pdTipoMargem'].forEach(id => {
    document.getElementById(id).addEventListener('input', autoCalcularProduto);
  });
});


// ═══════════════════════════════════════════════════════════════
// MOBILE / PWA — atualização, conectividade e atalhos
// ═══════════════════════════════════════════════════════════════
let registroPWA = null;
let workerAtualizacaoPendente = null;
let recarregandoPorAtualizacao = false;

function estaModoInstalado() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function atualizarStatusConexao() {
  const el = document.getElementById('networkStatus');
  if (!el) return;
  const online = navigator.onLine;
  el.textContent = online ? '● Online' : '● Offline';
  el.classList.toggle('offline', !online);
  el.classList.toggle('online', online);
  el.title = online ? 'Conectado — dados locais continuam salvos no aparelho' : 'Modo offline — seus dados continuam disponíveis neste aparelho';
}

function mostrarAtualizacaoPWA(worker) {
  if (worker) workerAtualizacaoPendente = worker;
  const barra = document.getElementById('pwaUpdateBar');
  if (!barra) return;
  barra.hidden = false;
  barra.classList.add('show');
}

function ocultarAtualizacaoPWA() {
  const barra = document.getElementById('pwaUpdateBar');
  if (!barra) return;
  barra.classList.remove('show');
  barra.hidden = true;
}

function aplicarAtualizacaoPWA() {
  const worker = workerAtualizacaoPendente || registroPWA?.waiting;
  if (!worker) {
    verificarAtualizacaoPWA(true);
    return;
  }
  recarregandoPorAtualizacao = true;
  const btn = document.getElementById('pwaUpdateBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Atualizando…';
  }
  worker.postMessage({ type: 'SKIP_WAITING' });
}

function observarInstalacaoPWA(reg) {
  if (!reg) return;
  if (reg.waiting && navigator.serviceWorker.controller) {
    mostrarAtualizacaoPWA(reg.waiting);
  }

  reg.addEventListener('updatefound', function() {
    const novo = reg.installing;
    if (!novo) return;
    novo.addEventListener('statechange', function() {
      if (novo.state === 'installed' && navigator.serviceWorker.controller) {
        mostrarAtualizacaoPWA(reg.waiting || novo);
      }
    });
  });
}

async function verificarAtualizacaoPWA(silencioso) {
  if (!registroPWA || !navigator.onLine) return;
  const btnCheck = document.getElementById('checkUpdateBtn');
  if (btnCheck && !silencioso) {
    btnCheck.disabled = true;
    btnCheck.textContent = 'Verificando…';
  }
  try {
    await registroPWA.update();
    if (registroPWA.waiting) mostrarAtualizacaoPWA(registroPWA.waiting);
    else if (!silencioso) toast('✓ Você já está na versão mais recente');
  } catch (e) {
    if (!silencioso) toast('⚠️ Não foi possível verificar agora', 'warn');
  } finally {
    if (btnCheck && !silencioso) {
      btnCheck.disabled = false;
      btnCheck.textContent = '🔄 Verificar atualização';
    }
  }
}

async function iniciarPWA() {
  atualizarStatusConexao();
  document.body.classList.toggle('pwa-installed', estaModoInstalado());

  if (!('serviceWorker' in navigator)) return;
  try {
    registroPWA = await navigator.serviceWorker.register('service-worker.js', {
      updateViaCache: 'none'
    });
    observarInstalacaoPWA(registroPWA);
    await verificarAtualizacaoPWA(true);
  } catch (err) {
    console.warn('SW não registrado:', err);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (recarregandoPorAtualizacao) {
      window.location.reload();
    }
  });
}

window.addEventListener('online', function() {
  atualizarStatusConexao();
  verificarAtualizacaoPWA(true);
  toast('✓ Conexão restaurada');
});
window.addEventListener('offline', function() {
  atualizarStatusConexao();
  toast('Modo offline — seus dados continuam salvos', 'warn');
});
window.addEventListener('focus', function() { verificarAtualizacaoPWA(true); });
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') verificarAtualizacaoPWA(true);
});

function aplicarAtalhoDaURL() {
  const params = new URLSearchParams(window.location.search);
  const tab = Number(params.get('tab'));
  if (Number.isInteger(tab) && tab >= 0 && tab <= 5 && typeof goTab === 'function') {
    goTab(tab);
  }
}

function abrirMaisMobile() {
  if (typeof abrirSidebar === 'function') abrirSidebar();
}


let tabMobileAtual = 0;

function atualizarInfoPWA() {
  const versao = document.getElementById('pwaVersionInfo');
  const modo = document.getElementById('pwaInstallMode');
  if (versao) versao.textContent = CONFIG.versao;
  if (modo) modo.textContent = estaModoInstalado() ? 'Instalado' : 'Navegador';
}

function atualizarFabMobile(idx) {
  tabMobileAtual = idx;
  const fab = document.getElementById('mobileFab');
  if (!fab) return;
  const cfg = {
    0: { rotulo: 'Adicionar ingrediente à receita', texto: '＋' },
    1: { rotulo: 'Novo ingrediente', texto: '＋' },
    2: { rotulo: 'Novo pedido', texto: '＋' },
    3: { rotulo: 'Novo pedido', texto: '＋' },
    4: { rotulo: 'Novo produto', texto: '＋' },
    5: { rotulo: 'Novo cliente', texto: '＋' },
  }[idx] || { rotulo: 'Nova ação', texto: '＋' };
  fab.setAttribute('aria-label', cfg.rotulo);
  fab.title = cfg.rotulo;
  fab.textContent = cfg.texto;
}

function acaoFabMobile() {
  const focar = function(id) {
    setTimeout(function() {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function() { el.focus(); }, 250);
    }, 80);
  };

  if (tabMobileAtual === 0) return focar('rSelect');
  if (tabMobileAtual === 1) return focar('iNome');
  if (tabMobileAtual === 2) return focar('pCliente');
  if (tabMobileAtual === 4) return focar('pdNome');
  if (tabMobileAtual === 5) return focar('cNome');

  goTab(2);
  focar('pCliente');
}
