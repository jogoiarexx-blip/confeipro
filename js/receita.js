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
        <div class="recipe-sub">${item.qtd}${escapeHtml(item.unidade)}</div>
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
  const vendaPorcao = arred((custoPorcao * (1 + margem / 100)) / (1 - taxaPct / 100));
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
const CONFIG_RECEITA_IDS = ['xGas', 'xEnergia', 'xEmbalagem', 'xValorHora', 'xHoras', 'xPerda', 'xTaxa', 'fMargem', 'fPorcoes'];

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
