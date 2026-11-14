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
let adiarAtualizacaoAte = 0;

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

function mostrarAtualizacaoPWA(worker, forcar) {
  if (!forcar && Date.now() < adiarAtualizacaoAte) return;
  if (worker) workerAtualizacaoPendente = worker;
  const barra = document.getElementById('pwaUpdateBar');
  if (!barra) return;
  barra.hidden = false;
  barra.classList.add('show');
}

function ocultarAtualizacaoPWA() {
  adiarAtualizacaoAte = Date.now() + 60 * 60 * 1000;
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
    if (registroPWA.waiting) mostrarAtualizacaoPWA(registroPWA.waiting, !silencioso);
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
  const valor = params.get('tab');
  const tab = valor !== null && /^[0-5]$/.test(valor) ? Number(valor) : 3;
  if (Number.isInteger(tab) && tab >= 0 && tab <= 5 && typeof goTab === 'function') {
    goTab(tab);
  } else if (typeof goTab === 'function') {
    goTab(3);
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


// ConfeiPro 2.3 — orientação progressiva sem alterar os dados persistidos.
let cp23Passo = 0;
function abrirAssistenteReceita() {
  goTab(0);
  const painel = document.getElementById('cp23Guide');
  if (!painel) return;
  cp23Passo = 0;
  painel.hidden = false;
  renderAssistenteReceita();
  painel.scrollIntoView({behavior:'smooth',block:'start'});
}
function fecharAssistenteReceita() {
  const painel = document.getElementById('cp23Guide');
  if (painel) painel.hidden = true;
}
function passoAssistenteReceita(delta) {
  if (delta > 0 && cp23Passo === 1 && !receita.length) {
    toast('Adicione pelo menos um ingrediente à receita para continuar', 'warn');
    return;
  }
  if (delta > 0 && cp23Passo === 3) {
    transferirReceitaParaProduto();
    return;
  }
  cp23Passo = Math.max(0, Math.min(3, cp23Passo + delta));
  renderAssistenteReceita();
}
function renderAssistenteReceita() {
  const painel = document.getElementById('cp23GuideContent');
  if (!painel) return;
  const textos = [
    '<h3>1. Confira os ingredientes</h3><p>Cadastre os ingredientes e seus preços antes de montar a receita. Você tem <strong>'+ingredientes.length+'</strong> ingredientes cadastrados.</p><button type="button" class="btn btn-outline" onclick="goTab(1)">Abrir ingredientes</button>',
    '<h3>2. Monte a receita</h3><p>Use o formulário “Montar receita” logo abaixo para selecionar os ingredientes e informar as quantidades. Itens adicionados: <strong>'+receita.length+'</strong>.</p>',
    '<h3>3. Confira o custo e o rendimento</h3><p>Confira o total de ingredientes, informe quantas porções a receita rende e calcule o preço no formulário desta página. O preço sugerido é uma estimativa que você pode ajustar.</p><p><strong>Custo atual dos ingredientes: '+fmt(receita.reduce((s,r)=>s+(Number(r.custo)||0),0))+'</strong></p>',
    '<h3>4. Transforme em produto</h3><p>Informe o nome e o rendimento. Os ingredientes serão copiados para Produtos sem salvar automaticamente.</p><label for="cp23NomeProduto">Nome do produto</label><input id="cp23NomeProduto" maxlength="120" placeholder="Ex.: Bolo de chocolate"><label for="cp23RendimentoProduto">Rendimento (porções)</label><input id="cp23RendimentoProduto" type="number" min="1" max="100000" step="1" value="1"><p class="cp23-hint">Confira os custos e o preço no formulário de Produtos antes de salvar.</p>'
  ];
  painel.innerHTML = textos[cp23Passo];
  document.getElementById('cp23GuideProgress').textContent = 'Etapa '+(cp23Passo+1)+' de 4';
  document.getElementById('cp23GuideBack').disabled = cp23Passo === 0;
  document.getElementById('cp23GuideNext').textContent = cp23Passo === 3 ? 'Preencher produto' : 'Próximo';
}


// V2.3.1: transferência guiada, sem gravação automática ou alteração do cadastro.
function transferirReceitaParaProduto() {
  const nome = document.getElementById('cp23NomeProduto')?.value.trim() || '';
  const rendimento = Number(document.getElementById('cp23RendimentoProduto')?.value);
  if (!nome || !Number.isInteger(rendimento) || rendimento < 1 || rendimento > 100000) {
    toast('Informe nome e rendimento inteiro válido', 'warn'); return;
  }
  if (!receita.length) { toast('Adicione ingredientes à receita', 'warn'); return; }
  const aplicar = function() {
    resetFormProduto();
    produtoEmEdicao.massa = receita.map(item => ({
      nome: item.nome, qtd: Number(item.qtd), unidade: item.unidade, custo: Number(item.custo)
    }));
    document.getElementById('pdNome').value = nome;
    document.getElementById('pdRendimento').value = rendimento;
    renderEtapasProduto();
    autoCalcularProduto();
    fecharAssistenteReceita();
    goTab(4);
    document.getElementById('pdNome').scrollIntoView({behavior:'smooth',block:'center'});
    toast('✓ Receita copiada. Revise os custos e salve o produto.');
  };
  const temRascunho = editandoProdutoId || document.getElementById('pdNome')?.value.trim() ||
    ['massa','recheio','cobertura','decoracao'].some(etapa => produtoEmEdicao[etapa]?.length);
  if (temRascunho) {
    abrirConfirmacao({
      titulo: 'Substituir formulário atual?',
      mensagem: 'Há alterações não salvas em Produtos. Substituir o formulário? Os produtos já cadastrados não serão modificados.',
      textoConfirmar: 'Substituir formulário',
      aoConfirmar: aplicar
    });
  } else aplicar();
}
