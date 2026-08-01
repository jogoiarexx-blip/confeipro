// ═══════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════
function goTab(idx) {
  document.querySelectorAll('.tab').forEach((t, i)  => t.classList.toggle('active', i === idx));
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === idx));
  if (idx === 3) atualizarDashboard();
}
