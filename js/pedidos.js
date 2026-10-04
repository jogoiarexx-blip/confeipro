// ═══════════════════════════════════════════
// PEDIDOS / ENCOMENDAS
// ═══════════════════════════════════════════
let editandoPedidoId = null;

const STATUS_PEDIDO = {
  orcamento: 'Orçamento',
  confirmado: 'Confirmado',
  producao: 'Em produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

function hojeISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,10);
}

function produtoExatoPorNome(nome) {
  return produtos.find(p => norm(p.nome) === norm(String(nome || '').trim())) || null;
}

function clienteExatoPorNome(nome) {
  if (typeof clientes === 'undefined') return null;
  return clientes.find(c => norm(c.nome) === norm(String(nome || '').trim())) || null;
}

function preencherPedidoPorProduto() {
  const prod = produtoExatoPorNome(document.getElementById('pProduto')?.value);
  if (!prod) return;
  const qtd = Math.max(1, parseFloat(document.getElementById('pQuantidade')?.value) || 1);
  const r = calcularCustosProduto(prod);
  const valor = document.getElementById('pValor');
  if (valor) valor.value = arred(r.vendaPorcao * qtd).toFixed(2);
}

function lerFormularioPedido() {
  const cliente = (document.getElementById('pCliente')?.value || '').trim();
  const produto = (document.getElementById('pProduto')?.value || '').trim();
  const quantidade = Math.max(1, parseFloat(document.getElementById('pQuantidade')?.value) || 1);
  const valor = parseFloat(document.getElementById('pValor')?.value);
  const sinal = Math.max(0, parseFloat(document.getElementById('pSinal')?.value) || 0);
  const dataPedido = document.getElementById('pDataPedido')?.value || hojeISO();
  const dataEntrega = document.getElementById('pDataEntrega')?.value || '';
  const pagamento = document.getElementById('pPagamento')?.value || '';
  const status = document.getElementById('pStatus')?.value || 'orcamento';

  if (!cliente) { toast('⚠️ Informe o nome do cliente', 'err'); return null; }
  if (!produto) { toast('⚠️ Informe o produto', 'err'); return null; }
  if (!isFinite(valor) || valor <= 0) { toast('⚠️ Valor inválido', 'err'); return null; }
  if (sinal > valor) { toast('⚠️ O sinal não pode ser maior que o valor total', 'err'); return null; }

  let cli = clienteExatoPorNome(cliente);
  if (!cli && typeof clientes !== 'undefined') {
    cli = { id: cpUid('cli'), nome: cliente, telefone: '', obs: '', criadoEm: new Date().toISOString() };
    clientes.push(cli);
    salvarClientes();
    renderClientes();
    atualizarDatalistsGestao();
  }

  const prod = produtoExatoPorNome(produto);
  const custoTotal = prod ? arred(calcularCustosProduto(prod).custoPorcao * quantidade) : 0;

  return {
    cliente,
    clienteId: cli?.id || null,
    produto,
    produtoId: prod?.id || null,
    quantidade,
    valor: arred(valor),
    sinal: arred(sinal),
    pagamento,
    status,
    dataPedido,
    dataEntrega,
    custoTotal,
    lucroEstimado: arred(valor - custoTotal),
  };
}

function limparFormularioPedido() {
  editandoPedidoId = null;
  ['pCliente','pProduto','pValor','pDataEntrega'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const qtd = document.getElementById('pQuantidade'); if (qtd) qtd.value = '1';
  const sinal = document.getElementById('pSinal'); if (sinal) sinal.value = '0';
  const pag = document.getElementById('pPagamento'); if (pag) pag.value = '';
  const st = document.getElementById('pStatus'); if (st) st.value = 'orcamento';
  const data = document.getElementById('pDataPedido'); if (data) data.value = hojeISO();
  const titulo = document.getElementById('pedidoFormTitulo'); if (titulo) titulo.textContent = 'Novo pedido';
  const btn = document.getElementById('pBtnSalvar'); if (btn) btn.textContent = '+ Salvar pedido';
  const canc = document.getElementById('pBtnCancelar'); if (canc) canc.style.display = 'none';
}

function addPedido() {
  const dados = lerFormularioPedido();
  if (!dados) return;

  if (editandoPedidoId) {
    const i = pedidos.findIndex(p => p.id === editandoPedidoId);
    if (i !== -1) {
      const anterior = pedidos[i];
      pedidos[i] = { ...anterior, ...dados, id: anterior.id, atualizadoEm: new Date().toISOString() };
    }
  } else {
    pedidos.push({
      ...dados,
      id: cpUid('ped'),
      criadoEm: new Date().toISOString(),
      estoqueBaixado: false,
    });
  }

  salvarPedidos();
  renderPedidos();
  atualizarDashboard();
  if (typeof gerarListaCompras === 'function') gerarListaCompras();
  limparFormularioPedido();
  toast('✓ Pedido salvo');
}

function editarPedido(id) {
  const p = pedidos.find(x => x.id === id);
  if (!p) return;
  editandoPedidoId = id;
  document.getElementById('pCliente').value = p.cliente || '';
  document.getElementById('pProduto').value = produtos.find(x => x.id === p.produtoId)?.nome || p.produto || '';
  document.getElementById('pQuantidade').value = p.quantidade || 1;
  document.getElementById('pValor').value = p.valor || '';
  document.getElementById('pSinal').value = p.sinal || 0;
  document.getElementById('pPagamento').value = p.pagamento || '';
  document.getElementById('pStatus').value = p.status || 'orcamento';
  document.getElementById('pDataPedido').value = p.dataPedido || hojeISO();
  document.getElementById('pDataEntrega').value = p.dataEntrega || '';
  document.getElementById('pedidoFormTitulo').textContent = `Editando pedido de ${p.cliente}`;
  document.getElementById('pBtnSalvar').textContent = '✓ Salvar alterações';
  document.getElementById('pBtnCancelar').style.display = 'block';
  window.scrollTo({top:0,behavior:'smooth'});
}

function cancelarEdicaoPedido() {
  limparFormularioPedido();
  toast('Edição cancelada');
}

function delPedidoPorId(id) {
  const idx = pedidos.findIndex(p => p.id === id);
  if (idx < 0) return;
  const p = pedidos[idx];
  pedidos.splice(idx, 1);
  salvarPedidos();
  renderPedidos();
  atualizarDashboard();
  if (typeof gerarListaCompras === 'function') gerarListaCompras();

  toast(`✓ Pedido de "${p.cliente}" removido`, null, function() {
    pedidos.splice(idx, 0, p);
    salvarPedidos();
    renderPedidos();
    atualizarDashboard();
    if (typeof gerarListaCompras === 'function') gerarListaCompras();
  });
}

// Compatibilidade com botões antigos.
function delPedido(idx) {
  const p = pedidos[idx];
  if (p) delPedidoPorId(p.id);
}

function alterarStatusPedido(id, status) {
  const p = pedidos.find(x => x.id === id);
  if (!p || !STATUS_PEDIDO[status]) return;
  p.status = status;
  p.atualizadoEm = new Date().toISOString();
  salvarPedidos();
  renderPedidos();
  atualizarDashboard();
  if (typeof gerarListaCompras === 'function') gerarListaCompras();
}

function formatarDataCurta(valor) {
  if (!valor) return '—';
  const [a,m,d] = String(valor).split('-');
  return a && m && d ? `${d}/${m}/${a}` : valor;
}

function renderPedidos() {
  const lista = document.getElementById('listaPedidos');
  const totalDiv = document.getElementById('totalPedidosDiv');
  if (!lista) return;

  if (!pedidos.length) {
    lista.innerHTML = '<div class="empty-state">📋 Nenhum pedido registrado ainda.<br>Adicione o primeiro ali em cima!</div>';
    if (totalDiv) totalDiv.style.display = 'none';
    return;
  }

  const buscaEl = document.getElementById('pedBusca');
  const ordemEl = document.getElementById('pedOrdem');
  const busca = buscaEl ? norm(buscaEl.value.trim()) : '';
  const ordem = ordemEl ? ordemEl.value : 'recente';

  let itens = pedidos.slice();
  if (busca) itens = itens.filter(p => norm(p.cliente || '').includes(busca) || norm(p.produto || '').includes(busca));

  if (ordem === 'maiorValor') itens.sort((a,b) => (b.valor||0)-(a.valor||0));
  else if (ordem === 'menorValor') itens.sort((a,b) => (a.valor||0)-(b.valor||0));
  else if (ordem === 'cliente') itens.sort((a,b) => (a.cliente||'').localeCompare(b.cliente||'', 'pt-BR'));
  else itens.sort((a,b) => String(b.criadoEm||'').localeCompare(String(a.criadoEm||'')));

  if (!itens.length) {
    lista.innerHTML = `<div class="empty-state">🔍 Nenhum pedido encontrado para "${escapeHtml(buscaEl?.value || '')}".</div>`;
  } else {
    lista.innerHTML = itens.map(p => {
      const saldo = arred((parseFloat(p.valor)||0) - (parseFloat(p.sinal)||0));
      const custo = parseFloat(p.custoTotal) || 0;
      const nomeProdutoAtual = produtos.find(x => x.id === p.produtoId)?.nome || p.produto || '';
      const lucro = p.lucroEstimado != null ? parseFloat(p.lucroEstimado) : arred((parseFloat(p.valor)||0)-custo);
      return `
      <div class="pedido-card">
        <div class="pedido-card-head">
          <div>
            <div class="pedido-cliente">${escapeHtml(p.cliente || '')}</div>
            <div class="pedido-produto">${escapeHtml(nomeProdutoAtual)} · ${p.quantidade || 1} un.</div>
          </div>
          <span class="pedido-valor">${fmt(p.valor || 0)}</span>
        </div>
        <div class="pedido-grid">
          <span>📅 Pedido <strong>${formatarDataCurta(p.dataPedido)}</strong></span>
          <span>🎂 Entrega <strong>${formatarDataCurta(p.dataEntrega)}</strong></span>
          <span>💵 Sinal <strong>${fmt(p.sinal || 0)}</strong></span>
          <span>💳 Saldo <strong>${fmt(saldo)}</strong></span>
          <span>📉 Custo <strong>${fmt(custo)}</strong></span>
          <span>💚 Lucro est. <strong>${fmt(lucro)}</strong></span>
        </div>
        <select class="pedido-status status-${escapeHtml(p.status || 'orcamento')}" onchange="alterarStatusPedido('${p.id}',this.value)">
          ${Object.entries(STATUS_PEDIDO).map(([v,n]) => `<option value="${v}" ${v===(p.status||'orcamento')?'selected':''}>${n}</option>`).join('')}
        </select>
        <div class="mini-actions">
          <button class="btn btn-outline" onclick="editarPedido('${p.id}')">✎ Editar</button>
          ${p.produtoId && !p.estoqueBaixado ? `<button class="btn btn-outline" onclick="baixarEstoquePedido('${p.id}')">📦 Baixar estoque</button>` : ''}
          ${p.estoqueBaixado ? '<span class="stock-done">✓ estoque baixado</span>' : ''}
          <button class="btn btn-red" onclick="delPedidoPorId('${p.id}')">🗑</button>
        </div>
      </div>`;
    }).join('');
  }

  const validos = pedidos.filter(p => p.status !== 'cancelado');
  const total = arred(validos.reduce((s,p) => s + (parseFloat(p.valor)||0),0));
  document.getElementById('totalPedidosValor').textContent = fmt(total);
  if (totalDiv) totalDiv.style.display = 'block';
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
  const valorUnit = parseFloat(match[0].replace(',', '.'));
  const qtd = Math.max(1, parseFloat(document.getElementById('pQuantidade')?.value)||1);
  document.getElementById('pValor').value = arred(valorUnit*qtd).toFixed(2);
  toast('✓ Valor preenchido com o preço da receita');
}
