// ═══════════════════════════════════════════
// MARCA — aplica o que está em config.js no cabeçalho
// ═══════════════════════════════════════════
function aplicarConfigVisual() {
  document.getElementById('appLogo').innerHTML =
    `${CONFIG.emoji} ${CONFIG.nomeBase}<span class="logo-accent">${CONFIG.nomeDestaque}</span>`;
  document.getElementById('appTagline').textContent = CONFIG.tagline;
  document.getElementById('appBadge').textContent    = CONFIG.versao;
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  aplicarConfigVisual();

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
   'pdValorHora','pdHoras','pdPerda','pdTaxa','pdMargem'].forEach(id => {
    document.getElementById(id).addEventListener('input', autoCalcularProduto);
  });
});
