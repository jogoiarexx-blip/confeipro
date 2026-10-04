// ═══════════════════════════════════════════
// NAVEGAÇÃO — menu lateral
// ═══════════════════════════════════════════
function goTab(idx) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', Number(item.dataset.tab) === idx);
  });
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === idx));
  document.querySelectorAll('.mobile-nav-item[data-mobile-tab]').forEach(item => {
    item.classList.toggle('active', Number(item.dataset.mobileTab) === idx);
  });
  const mais = document.getElementById('mobileMoreBtn');
  if (mais) mais.classList.toggle('active', idx === 1 || idx === 5);
  if (typeof atualizarFabMobile === 'function') atualizarFabMobile(idx);
  if (idx === 3) atualizarDashboard();
  const main = document.querySelector('.main-content');
  if (main) main.scrollTop = 0;
  fecharSidebar();
}

// ── MENU LATERAL (drawer no mobile) ─────────
function abrirSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}

function fecharSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}
