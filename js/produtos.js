// ═══════════════════════════════════════════
// PRODUTOS
// ═══════════════════════════════════════════
function criarProdutoVazio() {
  return {
    id: null, nome: '', categoria: '', pesoFinal: '', pesoPorcao: '', rendimento: '',
    massa: [], recheio: [], cobertura: [], decoracao: [],
    embalagem: 2, gas: 2, energia: 0, valorHora: 20, horas: 0,
    perda: 8, taxa: 5, margem: 50,
  };
}

let produtoEmEdicao   = criarProdutoVazio();
let editandoProdutoId = null;

function somaEtapa(arr) {
  return arred((arr || []).reduce((s, i) => s + i.custo, 0));
}

function calcularCustosProduto(p) {
  const custoMassa      = somaEtapa(p.massa);
  const custoRecheio    = somaEtapa(p.recheio);
  const custoCobertura  = somaEtapa(p.cobertura);
  const custoDecoracao  = somaEtapa(p.decoracao);
  const custoIngBase    = arred(custoMassa + custoRecheio + custoCobertura + custoDecoracao);

  const perdaPct = Math.min(Math.max(parseFloat(p.perda) || 0, 0), 100);
  const taxaPct  = Math.min(Math.max(parseFloat(p.taxa)  || 0, 0), 95);
  const margem   = Math.max(parseFloat(p.margem) || 0, 0);
  const porcoes  = Math.max(parseFloat(p.rendimento) || 1, 1);

  const valorPerda = arred(custoIngBase * (perdaPct / 100));
  const custoIng   = arred(custoIngBase + valorPerda);

  const extras   = arred(numNaoNegativo(p.gas) + numNaoNegativo(p.energia) + numNaoNegativo(p.embalagem));
  const maoObra  = arred(numNaoNegativo(p.valorHora) * numNaoNegativo(p.horas));

  const custoTotal  = arred(custoIng + extras + maoObra);
  const custoPorcao = arred(custoTotal / porcoes);

  const vendaPorcao = arred((custoPorcao * (1 + margem / 100)) / (1 - taxaPct / 100));
  const vendaTotal  = arred(vendaPorcao * porcoes);
  const valorTaxa   = arred(vendaTotal * (taxaPct / 100));
  const lucro       = arred(vendaTotal - custoTotal - valorTaxa);

  return { custoMassa, custoRecheio, custoCobertura, custoDecoracao, custoIngBase,
           valorPerda, custoIng, extras, maoObra, custoTotal, custoPorcao,
           vendaPorcao, vendaTotal, valorTaxa, lucro, porcoes };
}

// Conta quantos pedidos batem com o nome de um produto (comparação sem
// acento/maiúsculas), pra alimentar o filtro "Mais vendidos". Pedido
// guarda o produto como texto livre (não tem vínculo por id), então essa
// é a única forma de relacionar os dois sem mudar o cadastro de pedidos.
function contarVendasProduto(nomeProduto) {
  const alvo = norm(nomeProduto);
  return pedidos.filter(p => norm(p.produto) === alvo).length;
}

// Preenche o filtro de categoria com as categorias já usadas nos
// produtos cadastrados, mantendo a seleção atual se ela ainda existir.
function atualizarFiltroCategoriaProdutos() {
  const sel = document.getElementById('pdFiltroCategoria');
  if (!sel) return;
  const atual = sel.value;

  const categorias = [...new Set(
    produtos.map(p => (p.categoria || '').trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  sel.innerHTML = '<option value="">🏷 Todas as categorias</option>' +
    categorias.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  if (categorias.includes(atual)) sel.value = atual;
}

function renderProdutos() {
  const el = document.getElementById('listaProdutos');
  atualizarFiltroCategoriaProdutos();

  if (!produtos.length) {
    el.innerHTML = '<div class="empty-state">🎂 Nenhum produto ainda.<br>Cadastre um novo produto ali em baixo!</div>';
    return;
  }

  const buscaEl    = document.getElementById('pdBusca');
  const categEl    = document.getElementById('pdFiltroCategoria');
  const ordemEl    = document.getElementById('pdOrdem');
  const busca      = buscaEl ? norm(buscaEl.value.trim()) : '';
  const categoria  = categEl ? categEl.value : '';
  const ordem      = ordemEl ? ordemEl.value : 'recente';

  let itens = produtos.map(p => ({ p, r: calcularCustosProduto(p) }));

  if (busca)     itens = itens.filter(({ p }) => norm(p.nome).includes(busca));
  if (categoria) itens = itens.filter(({ p }) => norm(p.categoria || '') === norm(categoria));

  if (ordem === 'nome') {
    itens.sort((a, b) => a.p.nome.localeCompare(b.p.nome, 'pt-BR'));
  } else if (ordem === 'maiorPreco') {
    itens.sort((a, b) => b.r.vendaPorcao - a.r.vendaPorcao);
  } else if (ordem === 'menorPreco') {
    itens.sort((a, b) => a.r.vendaPorcao - b.r.vendaPorcao);
  } else if (ordem === 'vendidos') {
    itens.sort((a, b) => contarVendasProduto(b.p.nome) - contarVendasProduto(a.p.nome));
  } else {
    itens.reverse(); // últimos cadastrados primeiro
  }

  if (!itens.length) {
    el.innerHTML = `<div class="empty-state">🔍 Nenhum produto encontrado.</div>`;
    return;
  }

  el.innerHTML = itens.map(({ p, r }) => {
    const vendas = ordem === 'vendidos' ? contarVendasProduto(p.nome) : null;
    return `
    <div class="produto-card">
      <div class="produto-card-top">
        <div>
          <div class="produto-nome">🎂 ${escapeHtml(p.nome)}</div>
          <div class="produto-meta">
            ${p.categoria ? `🏷 ${escapeHtml(p.categoria)} · ` : ''}${p.pesoFinal ? `⚖️ ${p.pesoFinal}kg · ` : ''}🥄 ${p.rendimento || 1} porç.${vendas !== null ? ` · 🔥 ${vendas} vendido(s)` : ''}
          </div>
        </div>
        <div class="produto-preco">${fmt(r.vendaPorcao)}<small>por porção</small></div>
      </div>
      <div class="produto-actions">
        <button class="btn btn-outline" onclick="editarProduto('${p.id}')">✎ Editar</button>
        <button class="btn btn-outline" onclick="duplicarProduto('${p.id}')">⧉ Duplicar</button>
        <button class="btn btn-red" onclick="excluirProduto('${p.id}')">🗑 Excluir</button>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// AUTOCOMPLETE DE CATEGORIA
// ═══════════════════════════════════════════
let catIndex = -1;

function catFiltrar() {
  const q    = norm(document.getElementById('pdCategoria').value.trim());
  const list = document.getElementById('catList');
  if (!q) { catFechar(); return; }

  const categorias = [...new Set(produtos.map(p => (p.categoria || '').trim()).filter(Boolean))];
  const matches = categorias.filter(c => norm(c).includes(q)).slice(0, 6);
  if (!matches.length) { catFechar(); return; }

  catIndex = -1;
  list.innerHTML = matches.map(c => `<div class="ac-item">${escapeHtml(c)}</div>`).join('');
  list.classList.add('open');
}

function catSelecionar(nome) {
  document.getElementById('pdCategoria').value = nome;
  catFechar();
}

function catFechar() {
  const list = document.getElementById('catList');
  if (list) list.classList.remove('open');
  catIndex = -1;
}

function catKeydown(e) {
  const items = document.querySelectorAll('#catList .ac-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    catIndex = Math.min(catIndex + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    catIndex = Math.max(catIndex - 1, 0);
  } else if (e.key === 'Enter' && catIndex >= 0) {
    items[catIndex].click(); e.preventDefault(); return;
  } else if (e.key === 'Escape') {
    catFechar(); return;
  }
  items.forEach((el, i) => el.classList.toggle('focused', i === catIndex));
}

document.addEventListener('click', function(e) {
  const item = e.target.closest('#catList .ac-item');
  if (item) catSelecionar(item.textContent);
  if (!e.target.closest('#pdCategoria') && !e.target.closest('#catList')) catFechar();
});

function atualizarSelectProduto() {
  const sel = document.getElementById('pdSelect');
  const cur = sel.value;
  sel.innerHTML = '<option value="">— selecionar ingrediente —</option>';
  ingredientes.forEach((ing, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = ing.nome;
    sel.appendChild(o);
  });
  sel.value = cur;
}

function aoSelecionarIngredienteProduto() {
  const idx   = document.getElementById('pdSelect').value;
  const meta  = document.getElementById('pdMeta');
  const chip  = document.getElementById('pdChip');
  const uDisp = document.getElementById('pdUnidadeDisplay');

  if (idx === '') {
    meta.style.display = 'none';
    uDisp.value = '';
    return;
  }

  const ing = ingredientes[parseInt(idx)];
  chip.textContent = `R$${ing.precoTotal.toFixed(2).replace('.', ',')} / ${ing.qtdTotal}${ing.unidade}  →  R$${custoPorUnidade(ing).toFixed(4).replace('.', ',')}/${ing.unidade}`;
  meta.style.display = 'block';
  uDisp.value = ing.unidade;
}

function adicionarNoProduto() {
  const etapa    = document.getElementById('pdEtapa').value;
  const idx      = document.getElementById('pdSelect').value;
  const qtdUsada = parseFloat(document.getElementById('pdQtdUsada').value);

  if (idx === '') { toast('⚠️ Selecione um ingrediente', 'err'); return; }
  if (isNaN(qtdUsada) || qtdUsada <= 0) { toast('⚠️ Informe uma quantidade válida', 'err'); return; }

  const ing   = ingredientes[parseInt(idx)];
  const custo = arred(custoPorUnidade(ing) * qtdUsada);

  produtoEmEdicao[etapa].push({ nome: ing.nome, qtd: qtdUsada, unidade: ing.unidade, custo });
  renderEtapasProduto();

  document.getElementById('pdSelect').value          = '';
  document.getElementById('pdQtdUsada').value        = '';
  document.getElementById('pdUnidadeDisplay').value  = '';
  document.getElementById('pdMeta').style.display    = 'none';
  autoCalcularProduto();
  toast(`✓ ${ing.nome} adicionado`);
}

function delItemProduto(etapa, idx) {
  produtoEmEdicao[etapa].splice(idx, 1);
  renderEtapasProduto();
  autoCalcularProduto();
}

function renderListaEtapa(etapa, elId) {
  const el    = document.getElementById(elId);
  const itens = produtoEmEdicao[etapa];
  const vazio = { massa: 'Nenhum ingrediente na massa.', recheio: 'Nenhum ingrediente no recheio.',
                  cobertura: 'Nenhum ingrediente na cobertura.', decoracao: 'Nenhum ingrediente na decoração.' };

  if (!itens.length) {
    el.innerHTML = `<div class="empty-state" style="padding:8px 0;">${vazio[etapa]}</div>`;
    return;
  }
  el.innerHTML = itens.map((item, i) => `
    <div class="recipe-item">
      <div>
        <div class="recipe-name">${escapeHtml(item.nome)}</div>
        <div class="recipe-sub">${item.qtd}${escapeHtml(item.unidade)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="recipe-cost">${fmt(item.custo)}</span>
        <button class="btn-del" onclick="delItemProduto('${etapa}', ${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function renderEtapasProduto() {
  renderListaEtapa('massa',      'listaPdMassa');
  renderListaEtapa('recheio',    'listaPdRecheio');
  renderListaEtapa('cobertura',  'listaPdCobertura');
  renderListaEtapa('decoracao',  'listaPdDecoracao');
}

// Rendimento automático: peso final (kg) ÷ peso por porção (g) = nº de
// porções. Só entra em ação se os dois campos estiverem preenchidos; se
// "peso por porção" ficar vazio, o campo Rendimento volta a ser 100%
// manual (comportamento antigo).
function atualizarRendimentoAuto() {
  const pesoKg     = parseFloat(document.getElementById('pdPeso').value)       || 0;
  const pesoPorcaoG = parseFloat(document.getElementById('pdPesoPorcao').value) || 0;
  const tag = document.getElementById('pdRendimentoAutoTag');

  if (pesoKg > 0 && pesoPorcaoG > 0) {
    const porcoes = Math.max(1, Math.round((pesoKg * 1000) / pesoPorcaoG));
    document.getElementById('pdRendimento').value = porcoes;
    tag.textContent = '🔄 calculado automaticamente';
  } else {
    tag.textContent = '';
  }
  autoCalcularProduto();
}

function lerFormularioProduto() {
  produtoEmEdicao.nome       = document.getElementById('pdNome').value.trim();
  produtoEmEdicao.categoria  = document.getElementById('pdCategoria').value.trim();
  produtoEmEdicao.pesoFinal  = parseFloat(document.getElementById('pdPeso').value)       || 0;
  produtoEmEdicao.pesoPorcao = parseFloat(document.getElementById('pdPesoPorcao').value) || 0;
  produtoEmEdicao.rendimento = parseFloat(document.getElementById('pdRendimento').value) || 1;
  produtoEmEdicao.gas        = numNaoNegativo(document.getElementById('pdGas').value);
  produtoEmEdicao.energia    = numNaoNegativo(document.getElementById('pdEnergia').value);
  produtoEmEdicao.embalagem  = numNaoNegativo(document.getElementById('pdEmbalagem').value);
  produtoEmEdicao.valorHora  = numNaoNegativo(document.getElementById('pdValorHora').value);
  produtoEmEdicao.horas      = numNaoNegativo(document.getElementById('pdHoras').value);
  produtoEmEdicao.perda      = parseFloat(document.getElementById('pdPerda').value)      || 0;
  produtoEmEdicao.taxa       = parseFloat(document.getElementById('pdTaxa').value)       || 0;
  produtoEmEdicao.margem     = parseFloat(document.getElementById('pdMargem').value)     || 0;
}

function renderResultadoProduto(r) {
  document.getElementById('pdCustoMassa').textContent     = fmt(r.custoMassa);
  document.getElementById('pdCustoRecheio').textContent   = fmt(r.custoRecheio);
  document.getElementById('pdCustoCobertura').textContent = fmt(r.custoCobertura);
  document.getElementById('pdCustoIng').textContent       = fmt(r.custoIngBase);
  document.getElementById('pdCusto').textContent          = fmt(r.custoTotal);
  document.getElementById('pdCustoPorcao').textContent    = `${fmt(r.custoPorcao)} × ${r.porcoes} porç.`;
  document.getElementById('pdVenda').textContent           = `${fmt(r.vendaPorcao)}/porção`;

  const rowDecoracao = document.getElementById('pdRowDecoracao');
  if (r.custoDecoracao > 0) {
    document.getElementById('pdCustoDecoracao').textContent = fmt(r.custoDecoracao);
    rowDecoracao.style.display = 'flex';
  } else { rowDecoracao.style.display = 'none'; }

  const rowPerda = document.getElementById('pdRowPerda');
  if (r.valorPerda > 0) {
    document.getElementById('pdPerdaValor').textContent = `${fmt(r.valorPerda)} (${produtoEmEdicao.perda}%)`;
    rowPerda.style.display = 'flex';
  } else { rowPerda.style.display = 'none'; }

  const rowMaoObra = document.getElementById('pdRowMaoObra');
  if (r.maoObra > 0) {
    document.getElementById('pdMaoObra').textContent = fmt(r.maoObra);
    rowMaoObra.style.display = 'flex';
  } else { rowMaoObra.style.display = 'none'; }

  const rowExtras = document.getElementById('pdRowExtras');
  if (r.extras > 0) {
    document.getElementById('pdExtras').textContent = fmt(r.extras);
    rowExtras.style.display = 'flex';
  } else { rowExtras.style.display = 'none'; }

  const rowTotal = document.getElementById('pdRowVendaTotal');
  if (r.porcoes > 1) {
    document.getElementById('pdVendaTotal').textContent = fmt(r.vendaTotal);
    rowTotal.style.display = 'flex';
  } else { rowTotal.style.display = 'none'; }

  const rowTaxa = document.getElementById('pdRowTaxa');
  if (r.valorTaxa > 0) {
    document.getElementById('pdTaxaValor').textContent = `− ${fmt(r.valorTaxa)} (${produtoEmEdicao.taxa}%)`;
    rowTaxa.style.display = 'flex';
  } else { rowTaxa.style.display = 'none'; }

  document.getElementById('pdLucro').textContent = fmt(r.lucro);
  document.getElementById('pdLucro').className   = 'result-value ' + (r.lucro >= 0 ? 'green' : 'red');
  document.getElementById('pdRowLucro').style.display = 'flex';

  document.getElementById('pdResultFinal').style.display = 'block';
}

function calcularProduto() {
  lerFormularioProduto();

  if (!produtoEmEdicao.nome) { toast('⚠️ Informe o nome do produto', 'err'); return null; }
  const totalIngredientes = produtoEmEdicao.massa.length + produtoEmEdicao.recheio.length +
                             produtoEmEdicao.cobertura.length + produtoEmEdicao.decoracao.length;
  if (!totalIngredientes) { toast('⚠️ Adicione ao menos um ingrediente', 'err'); return null; }

  const r = calcularCustosProduto(produtoEmEdicao);
  renderResultadoProduto(r);
  return r;
}

// Precificação automática: recalcula em tempo real, sem toasts de erro,
// sempre que um campo muda ou um ingrediente é adicionado/removido.
function autoCalcularProduto() {
  lerFormularioProduto();
  const totalIngredientes = produtoEmEdicao.massa.length + produtoEmEdicao.recheio.length +
                             produtoEmEdicao.cobertura.length + produtoEmEdicao.decoracao.length;
  if (!produtoEmEdicao.nome || !totalIngredientes) {
    document.getElementById('pdResultFinal').style.display = 'none';
    return;
  }
  renderResultadoProduto(calcularCustosProduto(produtoEmEdicao));
}

// Valor da hora normalmente é um select fixo (R$20/25/30). Produtos salvos
// antes dessa mudança (ou vindos de um backup antigo) podem ter qualquer
// valor, tipo R$18,50. Antes, essa função arredondava pra cima até a opção
// mais próxima do dropdown — e se o usuário salvasse sem reparar, o valor
// original era perdido de vez. Agora, se o valor não bate com nenhuma
// opção padrão, ele vira uma opção extra "personalizada" no próprio select
// (selecionada), então nada é sobrescrito silenciosamente: ou o usuário
// mantém o valor original, ou troca conscientemente pra uma opção padrão.
function definirValorHoraSelect(elId, valor) {
  const sel      = document.getElementById(elId);
  const opcoes   = [20, 25, 30];
  const num      = parseFloat(valor);
  const valorFinal = isNaN(num) || num < 0 ? 20 : num;

  const antiga = sel.querySelector('option[data-personalizada="1"]');
  if (antiga) antiga.remove();

  if (!opcoes.includes(valorFinal)) {
    const opt = document.createElement('option');
    opt.value = String(valorFinal);
    opt.textContent = `${fmt(valorFinal)} (personalizado)`;
    opt.dataset.personalizada = '1';
    sel.appendChild(opt);
  }
  sel.value = String(valorFinal);
}

function preencherFormProduto(p) {
  produtoEmEdicao = JSON.parse(JSON.stringify(p));
  editandoProdutoId = p.id;

  document.getElementById('pdNome').value       = produtoEmEdicao.nome;
  document.getElementById('pdCategoria').value  = produtoEmEdicao.categoria || '';
  document.getElementById('pdPeso').value        = produtoEmEdicao.pesoFinal;
  document.getElementById('pdPesoPorcao').value  = produtoEmEdicao.pesoPorcao || '';
  document.getElementById('pdRendimento').value  = produtoEmEdicao.rendimento;
  document.getElementById('pdRendimentoAutoTag').textContent = produtoEmEdicao.pesoPorcao ? '🔄 calculado automaticamente' : '';
  document.getElementById('pdGas').value         = produtoEmEdicao.gas;
  document.getElementById('pdEnergia').value     = produtoEmEdicao.energia;
  document.getElementById('pdEmbalagem').value   = produtoEmEdicao.embalagem;
  definirValorHoraSelect('pdValorHora', produtoEmEdicao.valorHora);
  document.getElementById('pdHoras').value       = produtoEmEdicao.horas;
  document.getElementById('pdPerda').value       = produtoEmEdicao.perda;
  document.getElementById('pdTaxa').value        = produtoEmEdicao.taxa;
  document.getElementById('pdMargem').value      = produtoEmEdicao.margem;

  renderEtapasProduto();
  document.getElementById('produtoFormTitulo').textContent = `Editando: ${produtoEmEdicao.nome}`;
  document.getElementById('pdBtnCancelar').style.display   = 'block';
  autoCalcularProduto();
}

function resetFormProduto() {
  produtoEmEdicao   = criarProdutoVazio();
  editandoProdutoId = null;

  document.getElementById('pdNome').value       = '';
  document.getElementById('pdCategoria').value  = '';
  document.getElementById('pdPeso').value        = '';
  document.getElementById('pdPesoPorcao').value  = '';
  document.getElementById('pdRendimento').value  = '';
  document.getElementById('pdRendimentoAutoTag').textContent = '';
  document.getElementById('pdGas').value         = 2;
  document.getElementById('pdEnergia').value     = 0;
  document.getElementById('pdEmbalagem').value   = 2;
  definirValorHoraSelect('pdValorHora', 20);
  document.getElementById('pdHoras').value       = 0;
  document.getElementById('pdPerda').value       = 8;
  document.getElementById('pdTaxa').value        = 5;
  document.getElementById('pdMargem').value      = 50;

  renderEtapasProduto();
  document.getElementById('pdResultFinal').style.display = 'none';
  document.getElementById('produtoFormTitulo').textContent = 'Novo produto';
  document.getElementById('pdBtnCancelar').style.display   = 'none';
}

function cancelarEdicaoProduto() {
  resetFormProduto();
  toast('Edição cancelada');
}

function salvarProduto() {
  const r = calcularProduto();
  if (!r) return;

  if (editandoProdutoId) {
    const i = produtos.findIndex(p => p.id === editandoProdutoId);
    if (i !== -1) produtos[i] = { ...produtoEmEdicao, id: editandoProdutoId };
  } else {
    produtos.push({ ...produtoEmEdicao, id: 'produto_' + Date.now() });
  }

  salvarProdutos();
  renderProdutos();
  resetFormProduto();
  atualizarDashboard();
  toast('✓ Produto salvo');
}

function editarProduto(id) {
  const p = produtos.find(p => p.id === id);
  if (!p) return;
  preencherFormProduto(p);
  toast(`✎ Editando "${p.nome}"`);
  window.scrollTo({ top: document.getElementById('produtoFormTitulo').offsetTop, behavior: 'smooth' });
}

function duplicarProduto(id) {
  const p = produtos.find(p => p.id === id);
  if (!p) return;
  const copia = JSON.parse(JSON.stringify(p));
  copia.id   = 'produto_' + Date.now();
  copia.nome = `${p.nome} (cópia)`;
  produtos.push(copia);
  salvarProdutos();
  renderProdutos();
  toast(`✓ "${p.nome}" duplicado`);
}

function excluirProduto(id) {
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return;
  const p = produtos[idx];

  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();
  if (editandoProdutoId === id) resetFormProduto();
  renderProdutos();
  atualizarDashboard();

  // Sem confirm() — dá pra desfazer no toast por alguns segundos.
  toast(`✓ "${p.nome}" removido`, null, function desfazerRemocaoProduto() {
    produtos.splice(idx, 0, p);
    salvarProdutos();
    renderProdutos();
    atualizarDashboard();
    toast('✓ Produto restaurado');
  });
}
