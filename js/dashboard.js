// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function atualizarDashboard() {
  const total   = arred(pedidos.reduce((s, p) => s + parseFloat(p.valor), 0));
  const ticket  = pedidos.length ? arred(total / pedidos.length) : 0;
  document.getElementById('dFaturado').textContent    = fmt(total);
  document.getElementById('dPedidos').textContent     = pedidos.length;
  document.getElementById('dIngredientes').textContent = ingredientes.length;
  document.getElementById('dTicket').textContent      = fmt(ticket);
}

// ═══════════════════════════════════════════
// BACKUP — EXPORTAR / IMPORTAR
// ═══════════════════════════════════════════
function exportarDados() {
  const dados = { ingredientes, pedidos, receita, produtos, exportadoEm: new Date().toISOString() };
  const blob  = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `confeipro-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('✓ Backup exportado!');
}

function importarDados() {
  const file = document.getElementById('importFile').files[0];
  if (!file) { toast('⚠️ Selecione um arquivo JSON', 'err'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dados = JSON.parse(e.target.result);
      if (!dados.ingredientes || !dados.pedidos) throw new Error('Formato inválido');

      if (!confirm('Isso vai substituir todos os dados atuais. Continuar?')) return;

      ingredientes = dados.ingredientes;
      pedidos      = dados.pedidos;
      receita      = dados.receita || [];
      produtos     = dados.produtos || [];

      salvarIng(); salvarPedidos(); salvarReceita(); salvarProdutos();

      // O backup pode ser de uma versão antiga do app (com bugs já
      // corrigidos hoje, tipo custo zerado ou ingrediente padrão faltando).
      // Roda merge + todas as migrações de novo, do zero, pra garantir que
      // os dados importados fiquem no mesmo estado que os de quem já
      // estava usando o app.
      rodarMesclaEMigracoes(0);

      renderIngredientes(); atualizarSelect(); atualizarSelectProduto(); renderReceita(); renderPedidos(); renderProdutos(); atualizarDashboard();
      toast('✓ Dados importados com sucesso!');
    } catch(err) {
      toast('⚠️ Arquivo inválido ou corrompido', 'err');
    }
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════
// LIMPAR DADOS
// ═══════════════════════════════════════════
function confirmarLimpar(tipo) {
  const msgs = {
    receita:  'Limpar a receita atual?',
    pedidos:  'Apagar todos os pedidos?',
    produtos: 'Apagar todos os produtos cadastrados?',
    tudo:     '⚠️ Apagar TUDO (ingredientes, receita, produtos e pedidos)?',
  };
  if (!confirm(msgs[tipo])) return;
  try {
    if (tipo === 'receita' || tipo === 'tudo') {
      receita = [];
      salvarReceita();
      renderReceita();
      document.getElementById('resultFinal').style.display = 'none';
    }
    if (tipo === 'pedidos' || tipo === 'tudo') {
      pedidos = [];
      salvarPedidos();
      renderPedidos();
    }
    if (tipo === 'produtos' || tipo === 'tudo') {
      produtos = [];
      salvarProdutos();
      resetFormProduto();
      renderProdutos();
    }
    if (tipo === 'tudo') {
      localStorage.removeItem('cpIngredientes');
      ingredientes = [...EXEMPLOS];
      salvarIng();
      renderIngredientes();
      atualizarSelect();
      atualizarSelectProduto();
    }
  } catch(e) {}
  atualizarDashboard();
  toast('✓ Dados removidos');
}
