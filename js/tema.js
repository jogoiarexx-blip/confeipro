// ═══════════════════════════════════════════
// TEMA — claro / escuro
// ═══════════════════════════════════════════
// O atributo data-theme já é aplicado bem cedo, num <script> no <head>
// do index.html (pra não piscar claro->escuro ao carregar a página).
// Aqui só sincronizamos os botões e a cor da barra do navegador.

const CORES_THEME_COLOR = { light: '#FFF8F0', dark: '#1E1710' };

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeChoice === tema);
  });

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', CORES_THEME_COLOR[tema] || CORES_THEME_COLOR.light);
}

function setTema(tema) {
  localStorage.setItem('cpTema', tema);
  aplicarTema(tema);
  if (typeof toast === 'function') {
    toast(tema === 'dark' ? '🌙 Tema escuro ativado' : '☀ Tema claro ativado');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const atual = document.documentElement.getAttribute('data-theme') || 'light';
  aplicarTema(atual);
});
