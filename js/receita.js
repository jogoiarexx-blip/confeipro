// ═══════════════════════════════════════════
// SELECT — TAB RECEITA
// ═══════════════════════════════════════════
function atualizarSelect() {
  const sel = document.getElementById('rSelect');
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

function aoSelecionarIngrediente() {
  const idx   = document.getElementById('rSelect').value;
  const meta  = document.getElementById('rMeta');
  const chip  = document.getElementById('rChip');
  const uDisp = document.getElementById('rUnidadeDisplay');

  if (idx === '') {
    meta.style.display = 'none';
    uDisp.value = '';
    document.getElementById('rCustoBox').style.display = 'none';
    return;
  }

  const ing = ingredientes[parseInt(idx)];
  chip.textContent = `R$${ing.precoTotal.toFixed(2).replace('.', ',')} / ${ing.qtdTotal}${ing.unidade}  →  R$${custoPorUnidade(ing).toFixed(4).replace('.', ',')}/${ing.unidade}`;
  meta.style.display = 'block';
  uDisp.value = ing.unidade;
  document.getElementById('rCustoBox').style.display = 'none';
}

function calcularIngrediente() {
  const idx      = document.getElementById('rSelect').value;
  const qtdUsada = parseFloat(document.getElementById('rQtdUsada').value);

  if (idx === '') { toast('⚠️ Selecione um ingrediente', 'err'); return null; }
  if (isNaN(qtdUsada) || qtdUsada <= 0) { toast('⚠️ Informe uma quantidade válida', 'err'); return null; }

  const ing   = ingredientes[parseInt(idx)];
  const custo = arred(custoPorUnidade(ing) * qtdUsada);

  document.getElementById('rCustoIngrediente').textContent = fmt(custo);
  document.getElementById('rCustoBox').style.display = 'block';
  return { ing, qtdUsada, custo };
}

function adicionarNaReceita() {
  const res = calcularIngrediente();
  if (!res) return;

  receita.push({ nome: res.ing.nome, qtd: res.qtdUsada, unidade: res.ing.unidade, custo: res.custo });
  salvarReceita();

  // Animação pop no último item
  renderReceita();
  const items = document.querySelectorAll('.recipe-item');
  if (items.length) items[items.length - 1].classList.add('pop-in');

  toast(`✓ ${res.ing.nome} adicionado à receita`);

  document.getElementById('rSelect').value          = '';
  document.getElementById('rQtdUsada').value        = '';
  document.getElementById('rUnidadeDisplay').value  = '';
  document.getElementById('rMeta').style.display    = 'none';
  document.getElementById('rCustoBox').style.display = 'none';
  document.getElementById('resultFinal').style.display = 'none';
}

function delItemReceita(idx) {
  const item = receita[idx];
  if (!item) return;

  receita.splice(idx, 1);
  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';

  toast(`✓ "${item.nome}" removido da receita`, null, function desfazerRemocaoReceita() {
    receita.splice(idx, 0, item);
    salvarReceita();
    renderReceita();
    toast('✓ Item restaurado');
  });
}

// Permite ajustar uma quantidade diretamente na receita atual.
// O custo por unidade já salvo é preservado, igual ao comportamento dos
// produtos, para não misturar preços antigos e novos sem o usuário pedir.
function atualizarQtdItemReceita(idx, valor) {
  const item = receita[idx];
  if (!item) return;

  const qtdNova = parseFloat(String(valor).replace(',', '.'));
  if (!isFinite(qtdNova) || qtdNova <= 0) {
    toast('⚠️ Informe uma quantidade maior que zero', 'err');
    renderReceita();
    return;
  }

  const qtdAnterior = parseFloat(item.qtd) || 0;
  const custoAnterior = parseFloat(item.custo) || 0;
  let custoUnitario = qtdAnterior > 0 ? custoAnterior / qtdAnterior : 0;

  if (!isFinite(custoUnitario) || custoUnitario <= 0) {
    const ing = buscarIngrediente(item.nome);
    custoUnitario = ing ? custoPorUnidade(ing) : 0;
  }

  item.qtd = qtdNova;
  item.custo = arred(custoUnitario * qtdNova);
  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';
}

function trocarIngredienteItemReceita(idx, ingredienteIdx) {
  const item = receita[idx];
  const ing = ingredientes[parseInt(ingredienteIdx, 10)];
  if (!item || !ing) return;
  item.nome = ing.nome;
  item.unidade = ing.unidade;
  item.custo = arred(custoPorUnidade(ing) * (parseFloat(item.qtd) || 0));
  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';
}

function renderReceita() {
  const lista    = document.getElementById('listaReceita');
  const totalDiv = document.getElementById('receitaTotal');

  if (!receita.length) {
    lista.innerHTML = '<div class="empty-state">🥣 Sua receita está vazia.<br>Escolha um ingrediente acima e clique em "Adicionar à receita".</div>';
    totalDiv.style.display = 'none';
    return;
  }

  lista.innerHTML = receita.map((item, i) => `
    <div class="recipe-item">
      <div>
        <div class="recipe-name">${escapeHtml(item.nome)}</div>
        <select class="recipe-inline-select" aria-label="Trocar ingrediente" onchange="trocarIngredienteItemReceita(${i}, this.value)">
          ${ingredientes.map((ing, idxIng) => `<option value="${idxIng}" ${norm(ing.nome)===norm(item.nome)?'selected':''}>${escapeHtml(ing.nome)}</option>`).join('')}
        </select>
        <div class="recipe-sub" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <input
            type="number"
            value="${item.qtd}"
            min="0.01"
            step="0.01"
            inputmode="decimal"
            aria-label="Quantidade de ${escapeHtml(item.nome)}"
            title="Altere a quantidade e saia do campo para recalcular"
            onchange="atualizarQtdItemReceita(${i}, this.value)"
            style="width:92px;padding:6px 8px;margin:0;"
          >
          <span>${escapeHtml(item.unidade)}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="recipe-cost">${fmt(item.custo)}</span>
        <button class="btn-del" onclick="delItemReceita(${i})">✕</button>
      </div>
    </div>
  `).join('');

  const total = arred(receita.reduce((s, r) => s + r.custo, 0));
  document.getElementById('totalReceita').textContent = fmt(total);
  totalDiv.style.display = 'block';
}

function calcularFinal() {
  if (!receita.length) { toast('⚠️ Adicione ingredientes à receita', 'err'); return; }

  const margem  = parseFloat(document.getElementById('fMargem').value);
  const porcoes = parseFloat(document.getElementById('fPorcoes').value) || 1;

  if (isNaN(margem) || margem < 0) { toast('⚠️ Informe a margem de lucro', 'err'); return; }

  const gas      = arred(numNaoNegativo(document.getElementById('xGas').value));
  const energia  = arred(numNaoNegativo(document.getElementById('xEnergia').value));
  const embal    = arred(numNaoNegativo(document.getElementById('xEmbalagem').value));
  const extras   = arred(gas + energia + embal);

  const valorHora = numNaoNegativo(document.getElementById('xValorHora').value);
  const horas     = numNaoNegativo(document.getElementById('xHoras').value);
  const maoObra   = arred(valorHora * horas);

  let perdaPct = parseFloat(document.getElementById('xPerda').value) || 0;
  if (perdaPct < 0) perdaPct = 0;
  if (perdaPct > 100) perdaPct = 100;

  let taxaPct = parseFloat(document.getElementById('xTaxa').value) || 0;
  if (taxaPct < 0) taxaPct = 0;
  if (taxaPct > 95) taxaPct = 95; // trava de segurança pra não dividir por ~0

  const custoIngBase = arred(receita.reduce((s, r) => s + r.custo, 0));
  const valorPerda    = arred(custoIngBase * (perdaPct / 100));
  const custoIng      = arred(custoIngBase + valorPerda); // ingredientes já com perda embutida

  const custoTotal  = arred(custoIng + extras + maoObra);
  const custoPorcao = arred(custoTotal / porcoes);

  // Preço já calculado pra cobrir a margem desejada MESMO DEPOIS da taxa do cartão/Pix/iFood
  const tipoMargem = document.getElementById('fTipoMargem')?.value || 'markup';
  let vendaPorcao;
  if (tipoMargem === 'liquida') {
    const divisor = 1 - (taxaPct / 100) - (margem / 100);
    if (divisor <= 0) { toast('⚠️ Margem líquida + taxa precisa ser menor que 100%', 'err'); return; }
    vendaPorcao = arred(custoPorcao / divisor);
  } else {
    vendaPorcao = arred((custoPorcao * (1 + margem / 100)) / (1 - taxaPct / 100));
  }
  const vendaTotal  = arred(vendaPorcao * porcoes);
  const valorTaxa   = arred(vendaTotal * (taxaPct / 100));
  const lucro       = arred(vendaTotal - custoTotal - valorTaxa);

  document.getElementById('fCustoIng').textContent    = fmt(custoIngBase);
  document.getElementById('fCusto').textContent       = fmt(custoTotal);
  document.getElementById('fCustoPorcao').textContent = `${fmt(custoPorcao)} × ${porcoes} porç.`;
  document.getElementById('fVenda').textContent       = `${fmt(vendaPorcao)}/porção`;

  // Perda/desperdício
  const rowPerda = document.getElementById('rowPerda');
  if (valorPerda > 0) {
    document.getElementById('fPerda').textContent = `${fmt(valorPerda)} (${perdaPct}%)`;
    rowPerda.style.display = 'flex';
  } else {
    rowPerda.style.display = 'none';
  }

  // Mão de obra
  const rowMaoObra = document.getElementById('rowMaoObra');
  if (maoObra > 0) {
    document.getElementById('fMaoObra').textContent = fmt(maoObra);
    rowMaoObra.style.display = 'flex';
  } else {
    rowMaoObra.style.display = 'none';
  }

  // Custos extras (gás/energia/embalagem)
  const rowExtras = document.getElementById('rowCustosExtras');
  if (extras > 0) {
    document.getElementById('fCustosExtras').textContent = fmt(extras);
    rowExtras.style.display = 'flex';
  } else {
    rowExtras.style.display = 'none';
  }

  // Venda total
  const rowTotal = document.getElementById('rowVendaTotal');
  if (porcoes > 1) {
    document.getElementById('fVendaTotal').textContent = fmt(vendaTotal);
    rowTotal.style.display = 'flex';
  } else {
    rowTotal.style.display = 'none';
  }

  // Taxa cartão/Pix/iFood
  const rowTaxa = document.getElementById('rowTaxa');
  if (valorTaxa > 0) {
    document.getElementById('fTaxa').textContent = `− ${fmt(valorTaxa)} (${taxaPct}%)`;
    rowTaxa.style.display = 'flex';
  } else {
    rowTaxa.style.display = 'none';
  }

  // Lucro líquido
  const rowLucro = document.getElementById('rowLucro');
  document.getElementById('fLucro').textContent = fmt(lucro);
  document.getElementById('fLucro').className = 'result-value ' + (lucro >= 0 ? 'green' : 'red');
  rowLucro.style.display = 'flex';

  document.getElementById('resultFinal').style.display = 'block';
}

// ═══════════════════════════════════════════
// RECEITAS PRONTAS
// ═══════════════════════════════════════════
const RECEITAS_PRONTAS = {
  chocolate: [
    { nome: 'Chocolate em pó 50%',   qtd: 50,  unidade: 'g'       },
    { nome: 'Cobertura meio amarga', qtd: 100, unidade: 'g'       },
    { nome: 'Leite integral',        qtd: 100, unidade: 'ml'      },
    { nome: 'Leite condensado',      qtd: 390, unidade: 'g'       },
    { nome: 'Creme de leite',        qtd: 600, unidade: 'g'       },
  ],
  coco: [
    { nome: 'Leite condensado',      qtd: 780, unidade: 'g'       },
    { nome: 'Creme de leite',        qtd: 600, unidade: 'g'       },
    { nome: 'Leite de coco',         qtd: 200, unidade: 'ml'      },
    { nome: 'Coco flocado',          qtd: 200, unidade: 'g'       },
  ],
  massa: [
    { nome: 'Leite integral',        qtd: 200, unidade: 'ml'      },
    { nome: 'Ovos',                  qtd: 4,   unidade: 'unidade' },
    { nome: 'Açúcar',                qtd: 200, unidade: 'g'       },
    { nome: 'Óleo',                  qtd: 120, unidade: 'ml'      },
    { nome: 'Chocolate em pó 50%',   qtd: 100, unidade: 'g'       },
    { nome: 'Farinha de trigo',      qtd: 240, unidade: 'g'       },
    { nome: 'Fermento em pó',        qtd: 10,  unidade: 'g'       },
    { nome: 'Bicarbonato de sódio',  qtd: 5,   unidade: 'g'       },
  ],
  // Bolo Indiano — massa de farinha de rosca com canela.
  indianoMassa: [
    { nome: 'Ovos',                  qtd: 5,   unidade: 'unidade' },
    { nome: 'Açúcar',                qtd: 100, unidade: 'g'       }, // açúcar refinado
    { nome: 'Açúcar mascavo',        qtd: 100, unidade: 'g'       },
    { nome: 'Óleo',                  qtd: 45,  unidade: 'ml'      },
    { nome: 'Farinha de rosca',      qtd: 120, unidade: 'g'       },
    { nome: 'Canela em pó',          qtd: 5,   unidade: 'g'       }, // 1 colher de chá
    { nome: 'Sal refinado',          qtd: 1.5, unidade: 'g'       }, // 1/4 colher de chá
    { nome: 'Fermento em pó',        qtd: 10,  unidade: 'g'       }, // 1 colher de sopa
  ],
  // Bolo Indiano — recheio e cobertura de leite condensado (brigadeiro mole).
  indianoCobertura: [
    { nome: 'Leite condensado',      qtd: 790, unidade: 'g'       }, // 2 latas
    { nome: 'Gemas',                 qtd: 2,   unidade: 'unidade' },
    { nome: 'Manteiga sem sal',      qtd: 15,  unidade: 'g'       }, // 1 colher de sopa
    { nome: 'Creme de leite',        qtd: 100, unidade: 'g'       },
    { nome: 'Leite integral',        qtd: 240, unidade: 'ml'      }, // pra molhar a massa
    { nome: 'Canela em pó',          qtd: 2,   unidade: 'g'       }, // finalizar, a gosto
  ],
  // Brownie de forma 25x25x3, cortado em cubos de 5x5cm (25 pedaços)
  brownie: [
    { nome: 'Ovos',                  qtd: 4,   unidade: 'unidade' },
    { nome: 'Açúcar',                qtd: 500, unidade: 'g'       },
    { nome: 'Óleo',                  qtd: 210, unidade: 'ml'      },
    { nome: 'Chocolate em pó 50%',   qtd: 140, unidade: 'g'       },
    { nome: 'Farinha de trigo',      qtd: 185, unidade: 'g'       },
  ],
  // Sonho de padaria — massa frita recheada com creme de confeiteiro.
  // Rendimento de referência: 20 unidades grandes (~60g) ou 60 pequenas (~20g).
  sonhoMassa: [
    { nome: 'Leite integral',          qtd: 250, unidade: 'ml'      },
    { nome: 'Fermento biológico seco', qtd: 20,  unidade: 'g'       }, // 2 colheres de sopa
    { nome: 'Açúcar',                  qtd: 50,  unidade: 'g'       }, // 4 colheres de sopa
    { nome: 'Manteiga sem sal',        qtd: 30,  unidade: 'g'       }, // 2 colheres de sopa
    { nome: 'Ovos',                    qtd: 3,   unidade: 'unidade' },
    { nome: 'Sal refinado',            qtd: 3,   unidade: 'g'       }, // 1/2 colher de chá
    { nome: 'Farinha de trigo',        qtd: 600, unidade: 'g'       }, // 5 xícaras de chá
  ],
  sonhoRecheio: [
    { nome: 'Leite integral',          qtd: 1000, unidade: 'ml'      }, // 1 litro
    { nome: 'Farinha de trigo',        qtd: 180,  unidade: 'g'       }, // 1 1/2 xícara de chá
    { nome: 'Açúcar',                  qtd: 200,  unidade: 'g'       }, // 1 xícara de chá
    { nome: 'Gemas',                   qtd: 3,    unidade: 'unidade' },
    { nome: 'Essência de baunilha',    qtd: 5,    unidade: 'ml'      }, // 1 colher de chá
  ],
  // Pão de mel — massa levada ao forno + banho de doce de leite.
  paoDeMel: [
    { nome: 'Ovos',                  qtd: 2,   unidade: 'unidade' },
    { nome: 'Açúcar mascavo',        qtd: 150, unidade: 'g'       },
    { nome: 'Mel',                   qtd: 150, unidade: 'g'       },
    { nome: 'Leite integral',        qtd: 240, unidade: 'ml'      },
    { nome: 'Manteiga sem sal',      qtd: 50,  unidade: 'g'       },
    { nome: 'Chocolate em pó 50%',   qtd: 20,  unidade: 'g'       },
    { nome: 'Farinha de trigo',      qtd: 240, unidade: 'g'       },
    { nome: 'Fermento em pó',        qtd: 12,  unidade: 'g'       },
    { nome: 'Especiarias',           qtd: 5,   unidade: 'g'       }, // canela/cravo/gengibre a gosto
    { nome: 'Doce de leite',         qtd: 400, unidade: 'g'       }, // banho/cobertura
  ],
};

function getBolo() {
  const todos = [
    ...RECEITAS_PRONTAS.massa,
    ...RECEITAS_PRONTAS.chocolate,
    ...RECEITAS_PRONTAS.coco,
  ];
  const mapa = {};
  todos.forEach(item => {
    if (mapa[item.nome]) mapa[item.nome].qtd += item.qtd;
    else mapa[item.nome] = { ...item };
  });
  return Object.values(mapa);
}

function getBoloNuvem() {
  const todos = [
    ...MASSA_BAUNILHA_PADRAO,
    ...CHANTININHO_NINHO_PADRAO,   // cobertura (sem recheio)
  ];
  const mapa = {};
  todos.forEach(item => {
    if (mapa[item.nome]) mapa[item.nome].qtd += item.qtd;
    else mapa[item.nome] = { ...item };
  });
  return Object.values(mapa);
}

function getBoloIndiano() {
  const todos = [
    ...RECEITAS_PRONTAS.indianoMassa,
    ...RECEITAS_PRONTAS.indianoCobertura,
  ];
  const mapa = {};
  todos.forEach(item => {
    if (mapa[item.nome]) mapa[item.nome].qtd += item.qtd;
    else mapa[item.nome] = { ...item };
  });
  return Object.values(mapa);
}

function getSonho() {
  const todos = [
    ...RECEITAS_PRONTAS.sonhoMassa,
    ...RECEITAS_PRONTAS.sonhoRecheio,
  ];
  const mapa = {};
  todos.forEach(item => {
    if (mapa[item.nome]) mapa[item.nome].qtd += item.qtd;
    else mapa[item.nome] = { ...item };
  });
  return Object.values(mapa);
}

const RENDIMENTO_INFO = {
  bolo:        { nome: '🍫 Bolo de Prestígio', peso: '~3 kg (bolo inteiro)',   fracionado: '12 potes de 250g', porcoes: 12 },
  boloNuvem:   { nome: '🍰 Bolo Nuvem',         peso: '~1.5 kg (bolo inteiro)', fracionado: '12 fatias',         porcoes: 12 },
  boloIndiano: { nome: '🇮🇳 Bolo Indiano',      peso: '~1.2 kg (forma 27x18cm)', fracionado: '10-12 fatias',    porcoes: 10 },
  brownie:     { nome: '🍫 Brownie',            peso: '~1.2 kg (forma 25x25x3cm)', fracionado: '25 pedaços 5x5cm', porcoes: 25 },
  sonho:       { nome: '🍩 Sonho',              peso: '~1.2 kg (massa + recheio)', fracionado: '20 unidades (~60g cada)', porcoes: 20 },
  paoDeMel:    { nome: '🍯 Pão de Mel',         peso: '~1.7 kg (massa + banho de doce de leite)', fracionado: '15 unidades (~115g cada)', porcoes: 15 },
};

function carregarReceita(tipo) {
  const itens = tipo === 'bolo' ? getBolo() : tipo === 'boloNuvem' ? getBoloNuvem() : tipo === 'boloIndiano' ? getBoloIndiano() : tipo === 'sonho' ? getSonho() : RECEITAS_PRONTAS[tipo];
  const nomes = { chocolate: '🍫 Recheio Chocolate', coco: '🥥 Recheio Coco', massa: '🎂 Massa', bolo: '🍫 Bolo de Prestígio', boloNuvem: '🍰 Bolo Nuvem', indianoMassa: '🍞 Massa Indiana', indianoCobertura: '🍮 Cobertura Indiana', boloIndiano: '🇮🇳 Bolo Indiano', brownie: '🍫 Brownie', sonhoMassa: '🍩 Massa do Sonho', sonhoRecheio: '🍮 Recheio do Sonho', sonho: '🍩 Sonho (completo)', paoDeMel: '🍯 Pão de Mel' };

  const faltando = itens.filter(item => !buscarIngrediente(item.nome));
  if (faltando.length) {
    toast(`⚠️ Não encontrado: ${faltando[0].nome}`, 'err');
    return;
  }

  receita = itens.map(item => {
    const ing   = buscarIngrediente(item.nome);
    const custo = arred(custoPorUnidade(ing) * item.qtd);
    return { nome: ing.nome, qtd: item.qtd, unidade: item.unidade, custo };
  });

  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';

  const cardRend = document.getElementById('cardRendimento');
  const info = RENDIMENTO_INFO[tipo];
  if (info) {
    cardRend.style.display = 'block';
    document.getElementById('fPorcoes').value = info.porcoes;
    document.getElementById('rendTitulo').textContent      = `${info.nome} — Rendimento`;
    document.getElementById('rendNome').textContent        = info.nome;
    document.getElementById('rendPeso').textContent        = info.peso;
    document.getElementById('rendFracionado').textContent  = info.fracionado;
  } else {
    cardRend.style.display = 'none';
    document.getElementById('fPorcoes').value = '';
  }

  toast(`✓ ${nomes[tipo]} carregada!`);
}

function limparReceita() {
  if (!receita.length) return;
  receita = [];
  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';
  document.getElementById('cardRendimento').style.display = 'none';
  toast('🗑 Receita limpa');
}

// ═══════════════════════════════════════════
// CONFIGURAÇÕES DA ABA RECEITA (margem, perda, taxa, porções, extras...)
// ═══════════════════════════════════════════
// Antes esses campos ficavam só no HTML, com valor padrão fixo no
// atributo `value`. Como nada salvava, todo reload jogava tudo de
// volta pro padrão. Agora fica salvo no localStorage, igual ao resto.
const CONFIG_RECEITA_IDS = ['xGas', 'xEnergia', 'xEmbalagem', 'xValorHora', 'xHoras', 'xPerda', 'xTaxa', 'fMargem', 'fPorcoes', 'fTipoMargem'];

function salvarConfigReceita() {
  const cfg = {};
  CONFIG_RECEITA_IDS.forEach(id => { cfg[id] = document.getElementById(id).value; });
  localStorage.setItem('cpConfigReceita', JSON.stringify(cfg));
}

function restaurarConfigReceita() {
  const cfg = JSON.parse(localStorage.getItem('cpConfigReceita') || 'null');
  if (!cfg) return;
  CONFIG_RECEITA_IDS.forEach(id => {
    if (cfg[id] !== undefined && cfg[id] !== '') document.getElementById(id).value = cfg[id];
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restaurarConfigReceita();
  CONFIG_RECEITA_IDS.forEach(id => {
    document.getElementById(id).addEventListener('input', salvarConfigReceita);
    document.getElementById(id).addEventListener('change', salvarConfigReceita);
  });
});

// ═══════════════════════════════════════════
// UI RETRÁTIL E BUSCA — ABA RECEITA
// ═══════════════════════════════════════════
function normalizarBuscaReceita(txt) {
  return String(txt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function toggleSecaoReceitasProntas(forcarAberto) {
  const conteudo = document.getElementById('conteudoReceitasProntas');
  const icone = document.getElementById('iconeReceitasProntas');
  const cabecalho = conteudo && conteudo.previousElementSibling;
  if (!conteudo) return;

  const abrir = typeof forcarAberto === 'boolean' ? forcarAberto : conteudo.hidden;
  conteudo.hidden = !abrir;
  conteudo.classList.toggle('open', abrir);
  if (icone) icone.classList.toggle('open', abrir);
  if (cabecalho) cabecalho.setAttribute('aria-expanded', String(abrir));

  if (abrir) {
    const busca = document.getElementById('pesquisaReceita');
    if (busca && !busca.value) setTimeout(() => busca.focus(), 30);
  }
}

function filtrarReceitasProntas() {
  const campo = document.getElementById('pesquisaReceita');
  const termo = normalizarBuscaReceita(campo ? campo.value : '');
  const botoes = Array.from(document.querySelectorAll('#listaReceitasProntas .receita-preset'));
  let visiveis = 0;

  botoes.forEach(btn => {
    const base = normalizarBuscaReceita(`${btn.dataset.recipeName || ''} ${btn.textContent || ''}`);
    const mostrar = !termo || base.includes(termo);
    btn.style.display = mostrar ? '' : 'none';
    if (mostrar) visiveis++;
  });

  const vazio = document.getElementById('semReceitasEncontradas');
  if (vazio) vazio.style.display = visiveis ? 'none' : 'block';
}

function toggleIngredientesReceita(forcarAberto) {
  const conteudo = document.getElementById('conteudoIngredientesReceita');
  const icone = document.getElementById('iconeIngredientesReceita');
  const cabecalho = conteudo && conteudo.previousElementSibling;
  if (!conteudo) return;

  const estaAberto = !conteudo.hidden;
  const abrir = typeof forcarAberto === 'boolean' ? forcarAberto : !estaAberto;
  conteudo.hidden = !abrir;
  conteudo.classList.toggle('open', abrir);
  if (icone) icone.classList.toggle('open', abrir);
  if (cabecalho) cabecalho.setAttribute('aria-expanded', String(abrir));
}

function atualizarContadoresReceitaUI() {
  const qtdIng = document.getElementById('qtdIngredientesReceita');
  if (qtdIng) qtdIng.textContent = receita.length;

  const qtdProntas = document.getElementById('qtdReceitasProntas');
  if (qtdProntas) qtdProntas.textContent = document.querySelectorAll('#listaReceitasProntas .receita-preset').length;
}

// Mantém os contadores sincronizados sem alterar a lógica original.
const _renderReceitaOriginal = renderReceita;
renderReceita = function() {
  _renderReceitaOriginal();
  atualizarContadoresReceitaUI();
};

document.addEventListener('DOMContentLoaded', function() {
  atualizarContadoresReceitaUI();
  filtrarReceitasProntas();
});


// ═══════════════════════════════════════════════════════════
// BIBLIOTECA GERENCIÁVEL DE RECEITAS + ESCALA
// ═══════════════════════════════════════════════════════════
let receitasGerenciaveis = JSON.parse(localStorage.getItem('cpReceitasGerenciaveis') || '[]');
let receitaGerenciavelEditandoId = null;

function salvarReceitasGerenciaveis() {
  localStorage.setItem('cpReceitasGerenciaveis', JSON.stringify(receitasGerenciaveis));
  if (typeof registrarSnapshotAutomatico === 'function') registrarSnapshotAutomatico();
}

function nomeReceitaAtualSugerido() {
  const rend = document.getElementById('rendNome')?.textContent?.trim();
  return rend && rend !== '—' ? rend.replace(/^[^\p{L}\p{N}]+/u, '') : 'Minha receita';
}

function novaReceitaGerenciavelDaAtual() {
  if (!receita.length) { toast('⚠️ Monte ou carregue uma receita primeiro', 'err'); return; }
  const nome = prompt('Nome da receita salva:', nomeReceitaAtualSugerido());
  if (!nome || !nome.trim()) return;
  receitasGerenciaveis.push({
    id: typeof cpUid === 'function' ? cpUid('rec') : 'rec_' + Date.now(),
    nome: nome.trim(),
    itens: JSON.parse(JSON.stringify(receita)),
    porcoes: parseFloat(document.getElementById('fPorcoes')?.value) || 1,
    config: CONFIG_RECEITA_IDS.reduce((o,id) => { o[id] = document.getElementById(id)?.value ?? ''; return o; }, {}),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  });
  salvarReceitasGerenciaveis();
  renderReceitasGerenciaveis();
  atualizarContadoresReceitaUI();
  toast('✓ Receita salva na biblioteca');
}

function carregarReceitaGerenciavel(id, editar) {
  const r = receitasGerenciaveis.find(x => x.id === id);
  if (!r) return;
  receita = JSON.parse(JSON.stringify(r.itens || []));
  salvarReceita();
  renderReceita();
  if (r.config) {
    CONFIG_RECEITA_IDS.forEach(k => {
      if (r.config[k] !== undefined && document.getElementById(k)) document.getElementById(k).value = r.config[k];
    });
  }
  if (r.porcoes && document.getElementById('fPorcoes')) document.getElementById('fPorcoes').value = r.porcoes;
  document.getElementById('resultFinal').style.display = 'none';
  receitaGerenciavelEditandoId = editar ? id : null;
  const btn = document.getElementById('btnSalvarReceitaEditada');
  if (btn) btn.style.display = editar ? 'block' : 'none';
  toggleIngredientesReceita(true);
  toast(editar ? `✎ Editando "${r.nome}"` : `✓ "${r.nome}" carregada`);
}

function salvarEdicaoReceitaGerenciavel() {
  const r = receitasGerenciaveis.find(x => x.id === receitaGerenciavelEditandoId);
  if (!r) { toast('⚠️ Nenhuma receita da biblioteca em edição', 'err'); return; }
  r.itens = JSON.parse(JSON.stringify(receita));
  r.porcoes = parseFloat(document.getElementById('fPorcoes')?.value) || 1;
  r.config = CONFIG_RECEITA_IDS.reduce((o,id) => { o[id] = document.getElementById(id)?.value ?? ''; return o; }, {});
  r.atualizadoEm = new Date().toISOString();
  salvarReceitasGerenciaveis();
  renderReceitasGerenciaveis();
  receitaGerenciavelEditandoId = null;
  const btn = document.getElementById('btnSalvarReceitaEditada');
  if (btn) btn.style.display = 'none';
  toast('✓ Alterações da receita salvas');
}

function renomearReceitaGerenciavel(id, nome) {
  const r = receitasGerenciaveis.find(x => x.id === id);
  const novo = String(nome || '').trim();
  if (!r || !novo) { renderReceitasGerenciaveis(); return; }
  r.nome = novo;
  r.atualizadoEm = new Date().toISOString();
  salvarReceitasGerenciaveis();
  renderReceitasGerenciaveis();
}

function duplicarReceitaGerenciavel(id) {
  const r = receitasGerenciaveis.find(x => x.id === id);
  if (!r) return;
  const copia = JSON.parse(JSON.stringify(r));
  copia.id = typeof cpUid === 'function' ? cpUid('rec') : 'rec_' + Date.now();
  copia.nome = r.nome + ' (cópia)';
  copia.criadoEm = new Date().toISOString();
  receitasGerenciaveis.push(copia);
  salvarReceitasGerenciaveis();
  renderReceitasGerenciaveis();
  toast('✓ Receita duplicada');
}

function excluirReceitaGerenciavel(id) {
  const i = receitasGerenciaveis.findIndex(x => x.id === id);
  if (i < 0) return;
  const r = receitasGerenciaveis[i];
  receitasGerenciaveis.splice(i,1);
  salvarReceitasGerenciaveis();
  renderReceitasGerenciaveis();
  atualizarContadoresReceitaUI();
  toast(`✓ "${r.nome}" removida`, null, () => {
    receitasGerenciaveis.splice(i,0,r);
    salvarReceitasGerenciaveis();
    renderReceitasGerenciaveis();
    atualizarContadoresReceitaUI();
  });
}

function renderReceitasGerenciaveis() {
  const el = document.getElementById('listaReceitasGerenciaveis');
  if (!el) return;
  if (!receitasGerenciaveis.length) {
    el.innerHTML = '<div class="empty-state compact-empty">💾 Salve a receita atual para criar sua biblioteca editável.</div>';
    return;
  }
  el.innerHTML = receitasGerenciaveis.map(r => `
    <div class="managed-recipe-card">
      <input class="managed-recipe-name" value="${escapeHtml(r.nome)}" onchange="renomearReceitaGerenciavel('${r.id}', this.value)" aria-label="Nome da receita">
      <div class="managed-recipe-meta">${(r.itens||[]).length} ingrediente(s) · ${r.porcoes||1} porção(ões)</div>
      <div class="mini-actions">
        <button class="btn btn-primary" onclick="carregarReceitaGerenciavel('${r.id}', false)">Carregar</button>
        <button class="btn btn-outline" onclick="carregarReceitaGerenciavel('${r.id}', true)">✎ Editar</button>
        <button class="btn btn-outline" onclick="duplicarReceitaGerenciavel('${r.id}')">⧉</button>
        <button class="btn btn-red" onclick="excluirReceitaGerenciavel('${r.id}')">🗑</button>
      </div>
    </div>`).join('');
}

function atualizarCustosReceitaAtual() {
  if (!receita.length) return;
  const antes = arred(receita.reduce((s,i) => s + (parseFloat(i.custo)||0),0));
  let n = 0;
  receita.forEach(item => {
    const ing = buscarIngrediente(item.nome);
    if (!ing) return;
    const novo = arred(custoPorUnidade(ing) * (parseFloat(item.qtd)||0));
    if (novo !== item.custo) n++;
    item.nome = ing.nome;
    item.unidade = ing.unidade;
    item.custo = novo;
  });
  salvarReceita();
  renderReceita();
  const depois = arred(receita.reduce((s,i) => s + (parseFloat(i.custo)||0),0));
  document.getElementById('resultFinal').style.display = 'none';
  toast(`✓ ${n} custo(s) atualizado(s): ${fmt(antes)} → ${fmt(depois)}`);
}

function escalarReceita(fator) {
  fator = parseFloat(fator);
  if (!receita.length || !isFinite(fator) || fator <= 0) return;
  receita = receita.map(i => ({
    ...i,
    qtd: Math.round((parseFloat(i.qtd)||0) * fator * 100) / 100,
    custo: arred((parseFloat(i.custo)||0) * fator)
  }));
  const p = document.getElementById('fPorcoes');
  if (p && parseFloat(p.value) > 0) p.value = Math.max(1, Math.round(parseFloat(p.value) * fator));
  salvarReceita();
  renderReceita();
  document.getElementById('resultFinal').style.display = 'none';
  toast(`✓ Receita ajustada para ${String(fator).replace('.',',')}×`);
}

function escalarReceitaParaPorcoes() {
  const atual = parseFloat(document.getElementById('fPorcoes')?.value);
  const alvo = parseFloat(document.getElementById('escalaPorcoesAlvo')?.value);
  if (!receita.length || !isFinite(atual) || atual <= 0 || !isFinite(alvo) || alvo <= 0) {
    toast('⚠️ Informe o rendimento atual e o rendimento desejado', 'err'); return;
  }
  const fator = alvo / atual;
  escalarReceita(fator);
  document.getElementById('fPorcoes').value = Math.round(alvo);
  salvarConfigReceita();
}

document.addEventListener('DOMContentLoaded', function() {
  renderReceitasGerenciaveis();
});
