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

  overlay.classList.add('show');
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  _modalAoConfirmar = null;
}

function _modalConfirmarClique() {
  const fn = _modalAoConfirmar;
  fecharModal();
  if (fn) fn();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('show')) {
    fecharModal();
  }
});
