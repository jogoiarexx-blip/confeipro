// ═══════════════════════════════════════════
// INGREDIENTES
// ═══════════════════════════════════════════
let editandoIngredienteIdx = null;

function limparFormularioIngrediente() {
  document.getElementById('iNome').value       = '';
  document.getElementById('iPrecoTotal').value = '';
  document.getElementById('iQtdTotal').value   = '';
  document.getElementById('iUnidade').value    = 'g';
}

function salvarIngrediente() {
  const nome           = document.getElementById('iNome').value.trim();
  const precoTotal     = parseFloat(document.getElementById('iPrecoTotal').value);
  const qtdTotalDigitada = parseFloat(document.getElementById('iQtdTotal').value);
  const unidadeDigitada  = document.getElementById('iUnidade').value;

  if (!nome) { toast('⚠️ Informe o nome do ingrediente', 'err'); return; }
  if (isNaN(precoTotal) || precoTotal <= 0) { toast('⚠️ Preço inválido', 'err'); return; }
  if (isNaN(qtdTotalDigitada) || qtdTotalDigitada <= 0) { toast('⚠️ Quantidade inválida', 'err'); return; }

  // Bloquear duplicados (case insensitive, sem acento) — ignora o próprio
  // item quando está em edição, senão ele nunca conseguiria salvar a si mesmo.
  const jaExiste = ingredientes.find((ing, i) => norm(ing.nome) === norm(nome) && i !== editandoIngredienteIdx);
  if (jaExiste) { toast(`⚠️ "${nome}" já está cadastrado`, 'err'); return; }

  // kg/L são só conveniência de digitação — o que fica salvo (e o que
  // as receitas/produtos usam pra calcular) é sempre g/ml.
  const { qtd: qtdTotal, unidade } = normalizarUnidade(qtdTotalDigitada, unidadeDigitada);
  const convertido = unidade !== unidadeDigitada;

  if (editandoIngredienteIdx !== null) {
    ingredientes[editandoIngredienteIdx] = { nome, precoTotal, qtdTotal, unidade };
    toast(convertido
      ? `✓ Ingrediente atualizado — convertido para ${qtdTotal}${unidade}`
      : '✓ Ingrediente atualizado — receitas e produtos já salvos mantêm o preço antigo');
  } else {
    ingredientes.push({ nome, precoTotal, qtdTotal, unidade });
    toast(convertido
      ? `✓ Ingrediente adicionado — convertido para ${qtdTotal}${unidade}`
      : '✓ Ingrediente adicionado');
  }

  salvarIng();
  renderIngredientes();
  atualizarSelect();
  atualizarSelectProduto();
  atualizarDashboard();
  cancelarEdicaoIngrediente();
}

// Mantido como apelido de salvarIngrediente() por compatibilidade.
function addIngrediente() { salvarIngrediente(); }

function editarIngrediente(idx) {
  const ing = ingredientes[idx];
  if (!ing) return;
  editandoIngredienteIdx = idx;

  document.getElementById('iNome').value       = ing.nome;
  document.getElementById('iPrecoTotal').value = ing.precoTotal;
  document.getElementById('iQtdTotal').value   = ing.qtdTotal;
  document.getElementById('iUnidade').value    = ing.unidade;

  document.getElementById('ingredienteFormTitulo').textContent = `Editando: ${ing.nome}`;
  document.getElementById('iBtnSalvar').textContent = '✓ Salvar alterações';
  document.getElementById('iBtnCancelar').style.display = 'block';

  acFechar();
  window.scrollTo({ top: document.getElementById('ingredienteFormTitulo').offsetTop, behavior: 'smooth' });
}

function cancelarEdicaoIngrediente() {
  editandoIngredienteIdx = null;
  limparFormularioIngrediente();
  document.getElementById('ingredienteFormTitulo').textContent = 'Cadastrar ingrediente';
  document.getElementById('iBtnSalvar').textContent = '+ Adicionar ingrediente';
  document.getElementById('iBtnCancelar').style.display = 'none';
  acFechar();
}

function delIngrediente(idx) {
  const ing = ingredientes[idx];
  if (!ing) return;

  ingredientes.splice(idx, 1);
  if (editandoIngredienteIdx === idx) cancelarEdicaoIngrediente();
  salvarIng();
  renderIngredientes();
  atualizarSelect();
  atualizarSelectProduto();
  atualizarDashboard();

  // Sem confirm() — dá pra desfazer no toast por alguns segundos.
  toast(`✓ "${ing.nome}" removido`, null, function desfazerRemocaoIngrediente() {
    ingredientes.splice(idx, 0, ing);
    salvarIng();
    renderIngredientes();
    atualizarSelect();
    atualizarSelectProduto();
    atualizarDashboard();
    toast('✓ Ingrediente restaurado');
  });
}

function renderIngredientes() {
  const el = document.getElementById('listaIngredientes');

  const buscaEl = document.getElementById('ingBusca');
  const ordemEl = document.getElementById('ingOrdem');
  const busca   = buscaEl ? norm(buscaEl.value.trim()) : '';
  const ordem   = ordemEl ? ordemEl.value : 'nome';

  if (!ingredientes.length) {
    el.innerHTML = '<div class="empty-state">🧂 Nenhum ingrediente ainda.<br>Cadastre o primeiro ali em cima!</div>';
    return;
  }

  // Guarda o índice original de cada ingrediente (usado nos botões de
  // editar/remover) antes de filtrar e ordenar a lista exibida.
  let itens = ingredientes.map((ing, i) => ({ ing, i }));

  if (busca) itens = itens.filter(({ ing }) => norm(ing.nome).includes(busca));

  if (ordem === 'recente') {
    itens = itens.slice().reverse();
  } else if (ordem === 'caro') {
    itens = itens.slice().sort((a, b) => custoPorUnidade(b.ing) - custoPorUnidade(a.ing));
  } else if (ordem === 'barato') {
    itens = itens.slice().sort((a, b) => custoPorUnidade(a.ing) - custoPorUnidade(b.ing));
  } else {
    itens = itens.slice().sort((a, b) => a.ing.nome.localeCompare(b.ing.nome, 'pt-BR'));
  }

  if (!itens.length) {
    el.innerHTML = `<div class="empty-state">🔍 Nenhum ingrediente encontrado para "${escapeHtml(buscaEl.value.trim())}".</div>`;
    return;
  }

  el.innerHTML = itens.map(({ ing, i }) => `
    <div class="ing-item">
      <div class="ing-info">
        <div class="ing-name">${escapeHtml(ing.nome)}</div>
        <div class="ing-meta">${ing.qtdTotal}${escapeHtml(ing.unidade)} · R$ ${ing.precoTotal.toFixed(2).replace('.', ',')}</div>
      </div>
      <div class="ing-unit-cost">R$${custoPorUnidade(ing).toFixed(4).replace('.', ',')}/${escapeHtml(ing.unidade)}</div>
      <button class="btn-edit" onclick="editarIngrediente(${i})" aria-label="Editar">✎</button>
      <button class="btn-del" onclick="delIngrediente(${i})" aria-label="Remover">✕</button>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
// AUTOCOMPLETE
// ═══════════════════════════════════════════
let acIndex = -1;

function acFiltrar() {
  const q    = norm(document.getElementById('iNome').value.trim());
  const list = document.getElementById('acList');
  if (!q) { acFechar(); return; }

  const matches = ingredientes.filter(ing => norm(ing.nome).includes(q)).slice(0, 6);
  if (!matches.length) { acFechar(); return; }

  acIndex = -1;
  // data-idx em vez de montar onclick com o nome do ingrediente:
  // nome é texto livre digitado pelo usuário, então cravar ele dentro
  // de um atributo onclick="..." é o mesmo tipo de problema do innerHTML
  // sem escapar — melhor nem colocar o valor ali.
  list.innerHTML = matches.map(ing => {
    const idxReal = ingredientes.indexOf(ing);
    return `<div class="ac-item" data-idx="${idxReal}">${escapeHtml(ing.nome)}</div>`;
  }).join('');
  list.classList.add('open');
}

function acSelecionar(nome, unidade) {
  document.getElementById('iNome').value    = nome;
  document.getElementById('iUnidade').value = unidade;
  acFechar();
}

function acFechar() {
  document.getElementById('acList').classList.remove('open');
  acIndex = -1;
}

function acKeydown(e) {
  const items = document.querySelectorAll('.ac-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    acIndex = Math.min(acIndex + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    acIndex = Math.max(acIndex - 1, 0);
  } else if (e.key === 'Enter' && acIndex >= 0) {
    items[acIndex].click(); e.preventDefault(); return;
  } else if (e.key === 'Escape') {
    acFechar(); return;
  }
  items.forEach((el, i) => el.classList.toggle('focused', i === acIndex));
}

document.addEventListener('click', function(e) {
  const item = e.target.closest('.ac-item');
  if (item && item.dataset.idx !== undefined) {
    const ing = ingredientes[parseInt(item.dataset.idx, 10)];
    if (ing) acSelecionar(ing.nome, ing.unidade);
  }
  if (!e.target.closest('.autocomplete-wrap')) acFechar();
});
