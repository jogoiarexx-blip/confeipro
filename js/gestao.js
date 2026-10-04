// ═══════════════════════════════════════════════════════════════
// GESTÃO — clientes, estoque, fichas técnicas e backups automáticos
// ═══════════════════════════════════════════════════════════════

function cpUid(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

let clientes = JSON.parse(localStorage.getItem('cpClientes') || '[]');
let clienteEmEdicaoId = null;

function salvarClientes() {
  localStorage.setItem('cpClientes', JSON.stringify(clientes));
  if (typeof registrarSnapshotAutomatico === 'function') registrarSnapshotAutomatico();
}

function atualizarDatalistsGestao() {
  const dlClientes = document.getElementById('listaClientesPedido');
  if (dlClientes) {
    dlClientes.innerHTML = clientes.map(c => `<option value="${escapeHtml(c.nome)}"></option>`).join('');
  }

  const dlProdutos = document.getElementById('listaProdutosPedido');
  if (dlProdutos) {
    dlProdutos.innerHTML = produtos.map(p => `<option value="${escapeHtml(p.nome)}"></option>`).join('');
  }
}

function limparFormCliente() {
  clienteEmEdicaoId = null;
  ['cNome','cTelefone','cObs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const t = document.getElementById('clienteFormTitulo');
  if (t) t.textContent = 'Novo cliente';
  const b = document.getElementById('cBtnSalvar');
  if (b) b.textContent = '+ Salvar cliente';
  const c = document.getElementById('cBtnCancelar');
  if (c) c.style.display = 'none';
}

function salvarCliente() {
  const nome = (document.getElementById('cNome')?.value || '').trim();
  const telefone = (document.getElementById('cTelefone')?.value || '').trim();
  const obs = (document.getElementById('cObs')?.value || '').trim();
  if (!nome) { toast('⚠️ Informe o nome do cliente', 'err'); return; }

  const duplicado = clientes.find(c => norm(c.nome) === norm(nome) && c.id !== clienteEmEdicaoId);
  if (duplicado) { toast('⚠️ Já existe um cliente com esse nome', 'err'); return; }

  if (clienteEmEdicaoId) {
    const i = clientes.findIndex(c => c.id === clienteEmEdicaoId);
    if (i !== -1) clientes[i] = { ...clientes[i], nome, telefone, obs, atualizadoEm: new Date().toISOString() };
  } else {
    clientes.push({ id: cpUid('cli'), nome, telefone, obs, criadoEm: new Date().toISOString() });
  }

  salvarClientes();
  renderClientes();
  atualizarDatalistsGestao();
  limparFormCliente();
  toast('✓ Cliente salvo');
}

function editarCliente(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  clienteEmEdicaoId = id;
  document.getElementById('cNome').value = c.nome || '';
  document.getElementById('cTelefone').value = c.telefone || '';
  document.getElementById('cObs').value = c.obs || '';
  document.getElementById('clienteFormTitulo').textContent = `Editando: ${c.nome}`;
  document.getElementById('cBtnSalvar').textContent = '✓ Salvar alterações';
  document.getElementById('cBtnCancelar').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function excluirCliente(id) {
  const i = clientes.findIndex(c => c.id === id);
  if (i < 0) return;
  const removido = clientes[i];
  clientes.splice(i, 1);
  salvarClientes();
  renderClientes();
  atualizarDatalistsGestao();
  toast(`✓ "${removido.nome}" removido`, null, () => {
    clientes.splice(i, 0, removido);
    salvarClientes();
    renderClientes();
    atualizarDatalistsGestao();
  });
}

function renderClientes() {
  const el = document.getElementById('listaClientes');
  if (!el) return;

  const busca = norm(document.getElementById('cBusca')?.value?.trim() || '');
  let itens = clientes.slice().sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (busca) itens = itens.filter(c => norm(c.nome).includes(busca) || norm(c.telefone || '').includes(busca));

  if (!itens.length) {
    el.innerHTML = '<div class="empty-state">👤 Nenhum cliente encontrado.</div>';
    return;
  }

  el.innerHTML = itens.map(c => {
    const ped = pedidos.filter(p => p.clienteId === c.id || (!p.clienteId && norm(p.cliente || '') === norm(c.nome)));
    const total = arred(ped.reduce((s,p) => s + (parseFloat(p.valor) || 0), 0));
    return `
      <div class="cliente-card">
        <div class="cliente-main">
          <strong>${escapeHtml(c.nome)}</strong>
          <span>${escapeHtml(c.telefone || 'Sem telefone')}</span>
          <small>${ped.length} pedido(s) · ${fmt(total)} em compras</small>
          ${c.obs ? `<small>${escapeHtml(c.obs)}</small>` : ''}
        </div>
        <div class="mini-actions">
          <button class="btn btn-outline" onclick="editarCliente('${c.id}')">✎ Editar</button>
          <button class="btn btn-red" onclick="excluirCliente('${c.id}')">🗑</button>
        </div>
      </div>`;
  }).join('');
}

function itensProdutoTodos(p) {
  return ['massa','recheio','cobertura','decoracao'].flatMap(etapa =>
    (p?.[etapa] || []).map(item => ({ ...item, etapa }))
  );
}

function renderEstoqueResumo() {
  const el = document.getElementById('estoqueResumo');
  if (!el) return;

  const baixos = ingredientes.filter(i => {
    const est = parseFloat(i.estoqueQtd) || 0;
    const min = parseFloat(i.estoqueMin) || 0;
    return min > 0 && est <= min;
  });

  document.getElementById('qtdEstoqueBaixo')?.replaceChildren(document.createTextNode(String(baixos.length)));

  if (!baixos.length) {
    el.innerHTML = '<div class="empty-state compact-empty">✅ Nenhum ingrediente abaixo do estoque mínimo.</div>';
    return;
  }

  el.innerHTML = baixos.map(i => `
    <div class="stock-row">
      <span><strong>${escapeHtml(i.nome)}</strong><small>${arred(parseFloat(i.estoqueQtd)||0)}${escapeHtml(i.unidade)} em estoque</small></span>
      <span class="stock-alert">mín. ${arred(parseFloat(i.estoqueMin)||0)}${escapeHtml(i.unidade)}</span>
    </div>`).join('');
}

function calcularListaCompras() {
  const necessidade = new Map();

  pedidos.filter(p => ['confirmado','producao','pronto'].includes(p.status || 'orcamento')).forEach(ped => {
    const prod = produtos.find(p => p.id === ped.produtoId);
    if (!prod) return;
    const mult = Math.max(1, parseFloat(ped.quantidade) || 1);
    itensProdutoTodos(prod).forEach(item => {
      const chave = norm(item.nome);
      necessidade.set(chave, (necessidade.get(chave) || 0) + (parseFloat(item.qtd) || 0) * mult);
    });
  });

  return ingredientes.map(ing => {
    const est = parseFloat(ing.estoqueQtd) || 0;
    const min = parseFloat(ing.estoqueMin) || 0;
    const req = necessidade.get(norm(ing.nome)) || 0;
    const alvo = Math.max(req, min);
    return { ing, requerido:req, comprar: Math.max(0, arred(alvo - est)) };
  }).filter(x => x.comprar > 0).sort((a,b) => b.comprar - a.comprar);
}

function gerarListaCompras() {
  const el = document.getElementById('listaCompras');
  if (!el) return;
  const lista = calcularListaCompras();
  if (!lista.length) {
    el.innerHTML = '<div class="empty-state">✅ Nada para comprar com base no estoque mínimo e pedidos abertos.</div>';
    return;
  }
  el.innerHTML = lista.map(x => `
    <div class="stock-row">
      <span><strong>${escapeHtml(x.ing.nome)}</strong><small>necessário em pedidos: ${arred(x.requerido)}${escapeHtml(x.ing.unidade)}</small></span>
      <span class="stock-buy">Comprar ${x.comprar}${escapeHtml(x.ing.unidade)}</span>
    </div>`).join('');
}

function baixarEstoquePedido(id) {
  const ped = pedidos.find(p => p.id === id);
  if (!ped) return;
  if (ped.estoqueBaixado) { toast('ℹ️ O estoque deste pedido já foi baixado', 'warn'); return; }
  const prod = produtos.find(p => p.id === ped.produtoId);
  if (!prod) { toast('⚠️ Vincule este pedido a um produto cadastrado', 'err'); return; }

  const mult = Math.max(1, parseFloat(ped.quantidade) || 1);
  itensProdutoTodos(prod).forEach(item => {
    const ing = ingredientes.find(i => norm(i.nome) === norm(item.nome));
    if (!ing) return;
    ing.estoqueQtd = arred(Math.max(0, (parseFloat(ing.estoqueQtd) || 0) - (parseFloat(item.qtd) || 0) * mult));
  });

  ped.estoqueBaixado = true;
  ped.estoqueBaixadoEm = new Date().toISOString();
  salvarIng();
  salvarPedidos();
  renderIngredientes();
  renderPedidos();
  renderEstoqueResumo();
  gerarListaCompras();
  atualizarDashboard();
  toast('✓ Estoque baixado para este pedido');
}

function verHistoricoIngrediente(idx) {
  const ing = ingredientes[idx];
  if (!ing) return;
  const hist = ing.historicoPrecos || [];
  const texto = hist.length
    ? hist.slice().reverse().slice(0, 12).map(h => {
        const d = new Date(h.data);
        return `${d.toLocaleDateString('pt-BR')}: ${fmt(h.de)} → ${fmt(h.para)}`;
      }).join('\n')
    : 'Ainda não há alterações de preço registradas.';
  alert(`Histórico de preço — ${ing.nome}\n\n${texto}`);
}

function criarPedidoDoProduto(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  goTab(2);
  const campo = document.getElementById('pProduto');
  if (campo) campo.value = p.nome;
  const qtd = document.getElementById('pQuantidade');
  if (qtd && !qtd.value) qtd.value = '1';
  if (typeof preencherPedidoPorProduto === 'function') preencherPedidoPorProduto();
}

function imprimirFichaTecnica(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  const r = calcularCustosProduto(p);
  const etapas = [
    ['Massa', p.massa], ['Recheio', p.recheio], ['Cobertura', p.cobertura], ['Decoração', p.decoracao]
  ];

  const linhas = etapas.map(([nome, itens]) => {
    if (!itens?.length) return '';
    return `<h3>${nome}</h3><table><thead><tr><th>Ingrediente</th><th>Quantidade</th><th>Custo</th></tr></thead><tbody>${
      itens.map(i => `<tr><td>${escapeHtml(i.nome)}</td><td>${i.qtd}${escapeHtml(i.unidade)}</td><td>${fmt(i.custo)}</td></tr>`).join('')
    }</tbody></table>`;
  }).join('');

  const html = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Ficha técnica - ${escapeHtml(p.nome)}</title>
  <style>body{font-family:Arial,sans-serif;color:#222;padding:28px;max-width:900px;margin:auto}h1{margin-bottom:4px}h2{font-size:16px;color:#666;margin-top:0}h3{margin-top:24px}table{width:100%;border-collapse:collapse;margin:8px 0 18px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}.resumo{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f7f7f7;padding:14px;border-radius:10px}.grande{font-size:22px;font-weight:bold}@media print{button{display:none}}</style></head>
  <body><h1>${escapeHtml(p.nome)}</h1><h2>Ficha técnica — ConfeiPro</h2>${linhas}
  <div class="resumo"><span>Custo total <strong>${fmt(r.custoTotal)}</strong></span><span>Custo/porção <strong>${fmt(r.custoPorcao)}</strong></span><span>Rendimento <strong>${r.porcoes}</strong></span><span>Lucro estimado <strong>${fmt(r.lucro)}</strong></span><span class="grande">Venda/porção ${fmt(r.vendaPorcao)}</span><span class="grande">Venda total ${fmt(r.vendaTotal)}</span></div>
  <p>Use a opção “Salvar como PDF” da janela de impressão para gerar o PDF.</p>
  <button onclick="window.print()">Imprimir / Salvar PDF</button>
  <script>setTimeout(()=>window.print(),250)<\/script></body></html>`;

  const w = window.open('', '_blank');
  if (!w) { toast('⚠️ Permita pop-ups para imprimir a ficha', 'err'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

// ── Backup automático local (últimas 5 versões) ──────────────────
function snapshotAtual() {
  return {
    schema: 2,
    criadoEm: new Date().toISOString(),
    ingredientes,
    pedidos,
    receita,
    produtos,
    clientes,
    receitasGerenciaveis: typeof receitasGerenciaveis !== 'undefined' ? receitasGerenciaveis : [],
  };
}

function registrarSnapshotAutomatico(forcar) {
  try {
    const agora = Date.now();
    const ultima = parseInt(localStorage.getItem('cpSnapshotEm') || '0', 10);
    if (!forcar && agora - ultima < 10 * 60 * 1000) return;
    const lista = JSON.parse(localStorage.getItem('cpBackupsAuto') || '[]');
    lista.unshift(snapshotAtual());
    localStorage.setItem('cpBackupsAuto', JSON.stringify(lista.slice(0, 5)));
    localStorage.setItem('cpSnapshotEm', String(agora));
    renderStatusBackup();
  } catch (e) {}
}

function renderStatusBackup() {
  const el = document.getElementById('backupStatus');
  if (!el) return;
  const auto = JSON.parse(localStorage.getItem('cpBackupsAuto') || '[]');
  const exportado = localStorage.getItem('cpUltimoBackupExportado');
  const a = auto[0]?.criadoEm ? new Date(auto[0].criadoEm).toLocaleString('pt-BR') : 'ainda não criado';
  const e = exportado ? new Date(exportado).toLocaleString('pt-BR') : 'nunca exportado';
  el.innerHTML = `Backup automático local: <strong>${escapeHtml(a)}</strong><br>Último JSON exportado: <strong>${escapeHtml(e)}</strong>`;
}

function restaurarUltimoBackupAutomatico() {
  const lista = JSON.parse(localStorage.getItem('cpBackupsAuto') || '[]');
  if (!lista.length) { toast('⚠️ Nenhum backup automático disponível', 'err'); return; }
  const dados = lista[0];
  abrirConfirmacao({
    titulo:'Restaurar backup automático?',
    mensagem:'Os dados atuais serão substituídos pela cópia local mais recente.',
    textoConfirmar:'Restaurar',
    icone:'🕘',
    perigo:true,
    aoConfirmar:function(){
      ingredientes = dados.ingredientes || [];
      pedidos = dados.pedidos || [];
      receita = dados.receita || [];
      produtos = dados.produtos || [];
      clientes = dados.clientes || [];
      if (typeof receitasGerenciaveis !== 'undefined') receitasGerenciaveis = dados.receitasGerenciaveis || [];
      salvarIng(); salvarPedidos(); salvarReceita(); salvarProdutos(); salvarClientes();
      if (typeof salvarReceitasGerenciaveis === 'function') salvarReceitasGerenciaveis();
      location.reload();
    }
  });
}

function iniciarGestao() {
  // IDs e campos novos em dados antigos.
  let mudouPedidos = false;
  pedidos.forEach(p => {
    if (!p.id) { p.id = cpUid('ped'); mudouPedidos = true; }
    if (!p.status) { p.status = 'orcamento'; mudouPedidos = true; }
    if (!p.quantidade) { p.quantidade = 1; mudouPedidos = true; }
    if (!p.criadoEm) { p.criadoEm = new Date().toISOString(); mudouPedidos = true; }
    if (!p.produtoId && p.produto) {
      const prod = produtos.find(x => norm(x.nome) === norm(p.produto));
      if (prod) { p.produtoId = prod.id; mudouPedidos = true; }
    }
    if (!p.clienteId && p.cliente) {
      let cli = clientes.find(c => norm(c.nome) === norm(p.cliente));
      if (!cli) {
        cli = { id: cpUid('cli'), nome:p.cliente, telefone:'', obs:'', criadoEm:p.criadoEm };
        clientes.push(cli);
      }
      p.clienteId = cli.id;
      mudouPedidos = true;
    }
  });
  if (mudouPedidos) salvarPedidos();
  salvarClientes();

  ingredientes.forEach(ing => {
    if (ing.estoqueQtd == null) ing.estoqueQtd = 0;
    if (ing.estoqueMin == null) ing.estoqueMin = 0;
    if (!Array.isArray(ing.historicoPrecos)) ing.historicoPrecos = [];
  });
  salvarIng();

  renderClientes();
  atualizarDatalistsGestao();
  renderEstoqueResumo();
  gerarListaCompras();
  registrarSnapshotAutomatico();
  renderStatusBackup();
}
