// ═══════════════════════════════════════════
// INGREDIENTES
// ═══════════════════════════════════════════
function addIngrediente() {
  const nome       = document.getElementById('iNome').value.trim();
  const precoTotal = parseFloat(document.getElementById('iPrecoTotal').value);
  const qtdTotal   = parseFloat(document.getElementById('iQtdTotal').value);
  const unidade    = document.getElementById('iUnidade').value;

  if (!nome) { toast('⚠️ Informe o nome do ingrediente', 'err'); return; }
  if (isNaN(precoTotal) || precoTotal <= 0) { toast('⚠️ Preço inválido', 'err'); return; }
  if (isNaN(qtdTotal)   || qtdTotal   <= 0) { toast('⚠️ Quantidade inválida', 'err'); return; }

  // Bloquear duplicados (case insensitive, sem acento)
  const jaExiste = ingredientes.find(ing => norm(ing.nome) === norm(nome));
  if (jaExiste) { toast(`⚠️ "${nome}" já está cadastrado`, 'err'); return; }

  ingredientes.push({ nome, precoTotal, qtdTotal, unidade });
  salvarIng();
  renderIngredientes();
  atualizarSelect();
  atualizarSelectProduto();
  atualizarDashboard();

  document.getElementById('iNome').value       = '';
  document.getElementById('iPrecoTotal').value = '';
  document.getElementById('iQtdTotal').value   = '';
  acFechar();
  toast('✓ Ingrediente adicionado');
}

function delIngrediente(idx) {
  if (!confirm(`Remover "${ingredientes[idx].nome}"?`)) return;
  ingredientes.splice(idx, 1);
  salvarIng();
  renderIngredientes();
  atualizarSelect();
  atualizarSelectProduto();
  atualizarDashboard();
  toast('✓ Ingrediente removido');
}

function renderIngredientes() {
  const el = document.getElementById('listaIngredientes');
  if (!ingredientes.length) {
    el.innerHTML = '<div class="empty-state">🧂 Nenhum ingrediente ainda.<br>Cadastre o primeiro ali em cima!</div>';
    return;
  }
  el.innerHTML = ingredientes.map((ing, i) => `
    <div class="ing-item">
      <div class="ing-info">
        <div class="ing-name">${ing.nome}</div>
        <div class="ing-meta">${ing.qtdTotal}${ing.unidade} · R$ ${ing.precoTotal.toFixed(2)}</div>
      </div>
      <div class="ing-unit-cost">R$${custoPorUnidade(ing).toFixed(4)}/${ing.unidade}</div>
      <button class="btn-del" onclick="delIngrediente(${i})">✕</button>
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
  list.innerHTML = matches.map((ing, i) =>
    `<div class="ac-item" onclick="acSelecionar('${ing.nome.replace(/'/g,"\\'")}', '${ing.unidade}')">${ing.nome}</div>`
  ).join('');
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
  if (!e.target.closest('.autocomplete-wrap')) acFechar();
});
