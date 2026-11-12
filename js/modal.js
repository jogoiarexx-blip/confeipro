// ═══════════════════════════════════════════
// MODAL — popup genérico de confirmação
// ═══════════════════════════════════════════
// Substitui o confirm() nativo do navegador por um popup no visual
// do app. Uso:
//
//   abrirConfirmacao({
//     titulo: 'Apagar tudo?',
//     mensagem: 'Isso vai remover ingredientes, receitas e pedidos.',
//     textoConfirmar: 'Apagar tudo',
//     perigo: true,                 // deixa o botão de confirmar vermelho
//     aoConfirmar: function() { ... } // só roda se o usuário confirmar
//   });

let _modalAoConfirmar = null;
let _focoAntesModal = null;

function abrirConfirmacao(opcoes) {
  const {
    titulo = 'Confirmar ação',
    mensagem = 'Tem certeza?',
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    icone = '❓',
    perigo = false,
    aoConfirmar = null,
  } = opcoes || {};

  _modalAoConfirmar = typeof aoConfirmar === 'function' ? aoConfirmar : null;

  const overlay = document.getElementById('modalOverlay');
  const box     = document.getElementById('modalBox');

  box.classList.toggle('perigo', !!perigo);
  document.getElementById('modalIcon').textContent    = icone;
  document.getElementById('modalTitle').textContent   = titulo;
  document.getElementById('modalMessage').textContent = mensagem;

  const btnConfirmar = document.getElementById('modalBtnConfirmar');
  btnConfirmar.textContent = textoConfirmar;
  btnConfirmar.className = 'btn ' + (perigo ? 'btn-red' : 'btn-primary');

  document.getElementById('modalBtnCancelar').textContent = textoCancelar;

  _focoAntesModal = document.activeElement;
  overlay.classList.add('show');
  document.body.classList.add('modal-open');
  document.querySelector('.app-shell').inert = true;
  document.getElementById('mobileBottomNav').inert = true;
  document.getElementById('mobileFab').inert = true;
  document.getElementById('modalBtnCancelar').focus();
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  _modalAoConfirmar = null;
  document.body.classList.remove('modal-open');
  document.querySelector('.app-shell').inert = false;
  document.getElementById('mobileBottomNav').inert = false;
  document.getElementById('mobileFab').inert = false;
  if (_focoAntesModal?.isConnected) _focoAntesModal.focus();
}

function _modalConfirmarClique() {
  const fn = _modalAoConfirmar;
  fecharModal();
  if (fn) fn();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab' && document.getElementById('modalOverlay').classList.contains('show')) conterFoco(e, document.getElementById('modalBox'));
  if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('show')) {
    fecharModal();
  }
});

function conterFoco(event, container) {
  const itens = [...container.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
    .filter(el => !el.disabled && el.getClientRects().length);
  const primeiro = itens[0], ultimo = itens[itens.length - 1];
  if (!primeiro) return;
  if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo.focus(); }
  else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus(); }
}
