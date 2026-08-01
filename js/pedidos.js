// ═══════════════════════════════════════════
// PEDIDOS
// ═══════════════════════════════════════════
function addPedido() {
  const cliente = document.getElementById('pCliente').value.trim();
  const produto = document.getElementById('pProduto').value.trim();
  const valor   = parseFloat(document.getElementById('pValor').value);

  if (!cliente) { toast('⚠️ Informe o nome do cliente', 'err'); return; }
  if (!produto) { toast('⚠️ Informe o produto', 'err'); return; }
  if (isNaN(valor) || valor <= 0) { toast('⚠️ Valor inválido', 'err'); return; }

  pedidos.push({ cliente, produto, valor: arred(valor) });
  salvarPedidos();
  renderPedidos();
  atualizarDashboard();

  document.getElementById('pCliente').value = '';
  document.getElementById('pProduto').value = '';
  document.getElementById('pValor').value   = '';
  toast('✓ Pedido adicionado');
}

function delPedido(idx) {
  pedidos.splice(idx, 1);
  salvarPedidos();
  renderPedidos();
  atualizarDashboard();
  toast('✓ Pedido removido');
}

function renderPedidos() {
  const lista    = document.getElementById('listaPedidos');
  const totalDiv = document.getElementById('totalPedidosDiv');

  if (!pedidos.length) {
    lista.innerHTML = '<div class="empty-state">📋 Nenhum pedido registrado ainda.<br>Adicione o primeiro ali em cima!</div>';
    totalDiv.style.display = 'none';
    return;
  }

  lista.innerHTML = pedidos.map((p, i) => `
    <div class="pedido-item">
      <div class="pedido-info">
        <div class="pedido-cliente">${p.cliente}</div>
        <div class="pedido-produto">${p.produto}</div>
      </div>
      <span class="pedido-valor">${fmt(p.valor)}</span>
      <button class="btn-del" onclick="delPedido(${i})">✕</button>
    </div>
  `).join('');

  const total = arred(pedidos.reduce((s, p) => s + parseFloat(p.valor), 0));
  document.getElementById('totalPedidosValor').textContent = fmt(total);
  totalDiv.style.display = 'block';
}

// ═══════════════════════════════════════════
// INTEGRAÇÃO RECEITA → PEDIDO
// ═══════════════════════════════════════════
function preencherValorDaReceita() {
  const fVenda = document.getElementById('fVenda');
  if (!fVenda || !fVenda.textContent.trim()) {
    toast('⚠️ Calcule o preço de venda na aba Receita primeiro', 'err');
    return;
  }
  const match = fVenda.textContent.match(/[\d,\.]+/);
  if (!match) { toast('⚠️ Valor não encontrado', 'err'); return; }
  const valor = parseFloat(match[0].replace(',', '.'));
  document.getElementById('pValor').value = valor.toFixed(2);
  toast('✓ Valor preenchido com o preço da receita');
}
