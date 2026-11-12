// ═══════════════════════════════════════════
// NAVEGAÇÃO — menu lateral
// ═══════════════════════════════════════════
function goTab(idx) {
  if (!Number.isInteger(idx) || idx < 0 || idx > 5) return;
  document.querySelectorAll('.nav-item').forEach(item => {
    const ativo = Number(item.dataset.tab) === idx;
    item.classList.toggle('active', ativo);
    if (ativo) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
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
  window.scrollTo({ top: 0, behavior: 'instant' });
  fecharSidebar();
}

// ── MENU LATERAL (drawer no mobile) ─────────
let focoAntesSidebar = null;
function abrirSidebar() {
  focoAntesSidebar = document.activeElement;
  document.getElementById('sidebar').inert = false;
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
  document.querySelector('.hamburger').setAttribute('aria-expanded', 'true');
  document.querySelector('.sidebar-close').focus();
  document.body.classList.add('drawer-open');
  document.querySelector('.main-content').inert = true;
  document.getElementById('mobileBottomNav').inert = true;
  document.getElementById('mobileFab').inert = true;
}

function fecharSidebar() {
  const aberto = document.getElementById('sidebar').classList.contains('open');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  document.querySelector('.hamburger').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
  document.querySelector('.main-content').inert = false;
  document.getElementById('mobileBottomNav').inert = false;
  document.getElementById('mobileFab').inert = false;
  if (aberto && focoAntesSidebar?.isConnected) focoAntesSidebar.focus();
  document.getElementById('sidebar').inert = window.matchMedia('(max-width: 900px)').matches;
}

// O menu fechado não participa da navegação por teclado no celular.
const telaMobile = window.matchMedia('(max-width: 900px)');
function sincronizarSidebar() {
  fecharSidebar();
  document.getElementById('sidebar').inert = telaMobile.matches;
}
document.addEventListener('DOMContentLoaded', sincronizarSidebar);
telaMobile.addEventListener('change', sincronizarSidebar);
document.addEventListener('keydown', function(e) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); fecharSidebar(); }
  if (e.key === 'Tab') conterFoco(e, sidebar);
});
