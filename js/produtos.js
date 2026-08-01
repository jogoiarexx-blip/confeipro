// ═══════════════════════════════════════════
// PRODUTOS
// ═══════════════════════════════════════════
function criarProdutoVazio() {
  return {
    id: null, nome: '', pesoFinal: '', rendimento: '',
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

  const extras   = arred((parseFloat(p.gas) || 0) + (parseFloat(p.energia) || 0) + (parseFloat(p.embalagem) || 0));
  const maoObra  = arred((parseFloat(p.valorHora) || 0) * (parseFloat(p.horas) || 0));

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

function renderProdutos() {
  const el = document.getElementById('listaProdutos');
  if (!produtos.length) {
    el.innerHTML = '<div class="empty-state">🎂 Nenhum produto ainda.<br>Cadastre um novo produto ali em baixo!</div>';
    return;
  }
  el.innerHTML = produtos.map(p => {
    const r = calcularCustosProduto(p);
    return `
    <div class="produto-card">
      <div class="produto-card-top">
        <div>
          <div class="produto-nome">🎂 ${p.nome}</div>
          <div class="produto-meta">${p.pesoFinal ? `⚖️ ${p.pesoFinal}kg · ` : ''}🥄 ${p.rendimento || 1} porç.</div>
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
  chip.textContent = `R$${ing.precoTotal.toFixed(2)} / ${ing.qtdTotal}${ing.unidade}  →  R$${custoPorUnidade(ing).toFixed(4)}/${ing.unidade}`;
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
        <div class="recipe-name">${item.nome}</div>
        <div class="recipe-sub">${item.qtd}${item.unidade}</div>
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

function lerFormularioProduto() {
  produtoEmEdicao.nome       = document.getElementById('pdNome').value.trim();
  produtoEmEdicao.pesoFinal  = parseFloat(document.getElementById('pdPeso').value)       || 0;
  produtoEmEdicao.rendimento = parseFloat(document.getElementById('pdRendimento').value) || 1;
  produtoEmEdicao.gas        = parseFloat(document.getElementById('pdGas').value)        || 0;
  produtoEmEdicao.energia    = parseFloat(document.getElementById('pdEnergia').value)    || 0;
  produtoEmEdicao.embalagem  = parseFloat(document.getElementById('pdEmbalagem').value)  || 0;
  produtoEmEdicao.valorHora  = parseFloat(document.getElementById('pdValorHora').value)  || 0;
  produtoEmEdicao.horas      = parseFloat(document.getElementById('pdHoras').value)      || 0;
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

// Valor da hora agora é um select fixo (R$20/25/30 — mínimo R$20).
// Produtos salvos antes dessa mudança podem ter qualquer valor (ex: R$18,50).
// Essa função sempre cai numa opção válida do dropdown, arredondando pra
// cima até a opção mais próxima, em vez de deixar o select em branco
// (o que zeraria o custo de mão de obra silenciosamente).
function definirValorHoraSelect(elId, valor) {
  const opcoes = [20, 25, 30];
  const num    = parseFloat(valor);
  const ajustado = isNaN(num) ? 20 : (opcoes.find(o => o >= num) || opcoes[opcoes.length - 1]);
  document.getElementById(elId).value = String(ajustado);
}

function preencherFormProduto(p) {
  produtoEmEdicao = JSON.parse(JSON.stringify(p));
  editandoProdutoId = p.id;

  document.getElementById('pdNome').value       = produtoEmEdicao.nome;
  document.getElementById('pdPeso').value        = produtoEmEdicao.pesoFinal;
  document.getElementById('pdRendimento').value  = produtoEmEdicao.rendimento;
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
  document.getElementById('pdPeso').value        = '';
  document.getElementById('pdRendimento').value  = '';
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
  const p = produtos.find(p => p.id === id);
  if (!p) return;
  if (!confirm(`Remover o produto "${p.nome}"?`)) return;
  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();
  if (editandoProdutoId === id) resetFormProduto();
  renderProdutos();
  atualizarDashboard();
  toast('✓ Produto removido');
}
