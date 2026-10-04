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

  // Precificação automática do produto: recalcula ao digitar em qualquer campo
  ['pdNome','pdPeso','pdRendimento','pdGas','pdEnergia','pdEmbalagem',
   'pdValorHora','pdHoras','pdPerda','pdTaxa','pdMargem','pdTipoMargem'].forEach(id => {
    document.getElementById(id).addEventListener('input', autoCalcularProduto);
  });
});
