// ═══════════════════════════════════════════
// TEMA — claro / escuro
// ═══════════════════════════════════════════
// O atributo data-theme já é aplicado bem cedo, num <script> no <head>
// do index.html (pra não piscar claro->escuro ao carregar a página).
// Aqui só sincronizamos os botões e a cor da barra do navegador.

const CORES_THEME_COLOR = { light: '#FFF8F0', dark: '#121B26' };

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    const ativo = btn.dataset.themeChoice === tema;
    btn.classList.toggle('active', ativo);
    btn.setAttribute('aria-pressed', String(ativo));
  });

  const alternar = document.getElementById('mobileThemeQuick');
  if (alternar) {
    const mudarParaClaro = tema === 'dark';
    const nome = mudarParaClaro ? 'Modo claro' : 'Modo escuro';
    const rotulo = mudarParaClaro ? '☀ Modo claro' : '🌙 Modo escuro';
    alternar.textContent = rotulo;
    alternar.setAttribute('aria-label', 'Ativar ' + nome.toLowerCase());
    alternar.title = 'Ativar ' + nome.toLowerCase();
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', CORES_THEME_COLOR[tema] || CORES_THEME_COLOR.dark);
}

function setTema(tema) {
  if (tema !== 'dark' && tema !== 'light') return;
  localStorage.setItem('cpTema', tema);
  aplicarTema(tema);
  if (typeof toast === 'function') {
    toast(tema === 'dark' ? '🌙 Tema escuro ativado' : '☀ Tema claro ativado');
  }
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme');
  setTema(atual === 'dark' ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', function () {
  const atual = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  aplicarTema(atual);
});
