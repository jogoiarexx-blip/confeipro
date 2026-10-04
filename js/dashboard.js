// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function atualizarDashboard() {
  const validos = pedidos.filter(p => p.status !== 'cancelado');
  const total = arred(validos.reduce((s,p) => s + (parseFloat(p.valor)||0), 0));
  const custos = arred(validos.reduce((s,p) => s + (parseFloat(p.custoTotal)||0), 0));
  const lucro = arred(validos.reduce((s,p) => s + (p.lucroEstimado != null ? parseFloat(p.lucroEstimado)||0 : (parseFloat(p.valor)||0)-(parseFloat(p.custoTotal)||0)), 0));
  const ticket = validos.length ? arred(total / validos.length) : 0;

  const agora = new Date();
  const pedidosMes = validos.filter(p => {
    const base = p.dataPedido || (p.criadoEm ? String(p.criadoEm).slice(0,10) : '');
    if (!base) return false;
    const [a,m] = base.split('-').map(Number);
    return a === agora.getFullYear() && m === agora.getMonth()+1;
  });
  const mes = arred(pedidosMes.reduce((s,p) => s + (parseFloat(p.valor)||0),0));
  const lucroMes = arred(pedidosMes.reduce((s,p) => s + (p.lucroEstimado != null ? parseFloat(p.lucroEstimado)||0 : (parseFloat(p.valor)||0)-(parseFloat(p.custoTotal)||0)),0));
  const margemReal = total > 0 ? arred((lucro / total) * 100) : 0;

  let maisVendido = '—';
  let maisLucrativo = '—';
  if (produtos.length) {
    const ranked = produtos.map(p => ({p, qtd: contarVendasProduto(p.nome, p.id)})).sort((a,b)=>b.qtd-a.qtd);
    if (ranked[0]?.qtd > 0) maisVendido = ranked[0].p.nome + ' (' + ranked[0].qtd + ')';

    const lucroPorProduto = new Map();
    validos.forEach(ped => {
      if (!ped.produtoId) return;
      const l = ped.lucroEstimado != null ? parseFloat(ped.lucroEstimado)||0 : (parseFloat(ped.valor)||0)-(parseFloat(ped.custoTotal)||0);
      lucroPorProduto.set(ped.produtoId, (lucroPorProduto.get(ped.produtoId)||0) + l);
    });
    const top = [...lucroPorProduto.entries()].sort((a,b)=>b[1]-a[1])[0];
    if (top) {
      const prod = produtos.find(p=>p.id===top[0]);
      if (prod) maisLucrativo = prod.nome + ' (' + fmt(top[1]) + ')';
    }
  }

  document.getElementById('dFaturado').textContent = fmt(total);
  document.getElementById('dPedidos').textContent = validos.length;
  document.getElementById('dIngredientes').textContent = ingredientes.length;
  document.getElementById('dTicket').textContent = fmt(ticket);
  const dc = document.getElementById('dCustos'); if (dc) dc.textContent = fmt(custos);
  const dl = document.getElementById('dLucro'); if (dl) dl.textContent = fmt(lucro);
  const dm = document.getElementById('dMes'); if (dm) dm.textContent = fmt(mes);
  const dlm = document.getElementById('dLucroMes'); if (dlm) dlm.textContent = fmt(lucroMes);
  const dmr = document.getElementById('dMargemReal'); if (dmr) dmr.textContent = margemReal.toFixed(1).replace('.', ',') + '%';
  const dv = document.getElementById('dMaisVendido'); if (dv) dv.textContent = maisVendido;
  const dml = document.getElementById('dMaisLucrativo'); if (dml) dml.textContent = maisLucrativo;
}

// ═══════════════════════════════════════════
// BACKUP — EXPORTAR / IMPORTAR
// ═══════════════════════════════════════════
function exportarDados() {
  const dados = {
    schema: 2, ingredientes, pedidos, receita, produtos,
    clientes: typeof clientes !== 'undefined' ? clientes : [],
    receitasGerenciaveis: typeof receitasGerenciaveis !== 'undefined' ? receitasGerenciaveis : [],
    configReceita: JSON.parse(localStorage.getItem('cpConfigReceita') || '{}'),
    exportadoEm: new Date().toISOString()
  };
  const blob  = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `confeipro-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('cpUltimoBackupExportado', new Date().toISOString());
  if (typeof renderStatusBackup === 'function') renderStatusBackup();
  toast('✓ Backup exportado!');
}

// Unidades aceitas num ingrediente válido. kg/L continuam aceitos aqui
// (normalizarUnidade cuida da conversão pra g/ml logo abaixo).
const UNIDADES_INGREDIENTE_VALIDAS = ['g', 'ml', 'unidade', 'kg', 'L'];

// Antes isso só checava se `ingredientes` existia no JSON. Um ingrediente
// com qtdTotal 0 (ou ausente, ou negativo, ou preço faltando) passava
// direto e só explodia depois em custoPorUnidade() como Infinity/NaN,
// sem aviso nenhum na hora do import. Aqui validamos campo a campo e
// separamos o que é utilizável do que não é.
function validarIngredientesBackup(lista) {
  const validos = [];
  let invalidos = 0;

  lista.forEach(ing => {
    const nome       = typeof ing?.nome === 'string' ? ing.nome.trim() : '';
    const precoTotal = parseFloat(ing?.precoTotal);
    const qtdTotal   = parseFloat(ing?.qtdTotal);
    const unidade    = ing?.unidade;

    const valido = nome !== '' &&
      isFinite(precoTotal) && precoTotal > 0 &&
      isFinite(qtdTotal)   && qtdTotal   > 0 &&
      UNIDADES_INGREDIENTE_VALIDAS.includes(unidade);

    if (!valido) { invalidos++; return; }

    const norm = normalizarUnidade(qtdTotal, unidade);
    validos.push({
      ...ing,
      nome, precoTotal, qtdTotal: norm.qtd, unidade: norm.unidade,
      estoqueQtd: Math.max(0, parseFloat(ing?.estoqueQtd)||0),
      estoqueMin: Math.max(0, parseFloat(ing?.estoqueMin)||0),
      historicoPrecos: Array.isArray(ing?.historicoPrecos) ? ing.historicoPrecos : []
    });
  });

  return { validos, invalidos };
}

function importarDados() {
  const file = document.getElementById('importFile').files[0];
  if (!file) { toast('⚠️ Selecione um arquivo JSON', 'err'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dados = JSON.parse(e.target.result);
      if (!Array.isArray(dados.ingredientes) || !Array.isArray(dados.pedidos)) throw new Error('Formato inválido');

      const { validos: ingredientesValidos, invalidos: qtdInvalidos } = validarIngredientesBackup(dados.ingredientes);
      if (!ingredientesValidos.length && dados.ingredientes.length) {
        toast('⚠️ Nenhum ingrediente válido nesse arquivo — import cancelado', 'err');
        return;
      }

      abrirConfirmacao({
        titulo: 'Importar backup?',
        mensagem: 'Isso vai substituir todos os dados atuais (ingredientes, receita, produtos e pedidos) pelos dados desse arquivo.',
        textoConfirmar: 'Importar e substituir',
        icone: '⬇️',
        perigo: true,
        aoConfirmar: function() {
          ingredientes = ingredientesValidos;
          pedidos      = dados.pedidos;
          receita      = dados.receita || [];
          produtos     = dados.produtos || [];
          if (typeof clientes !== 'undefined') clientes = Array.isArray(dados.clientes) ? dados.clientes : [];
          if (typeof receitasGerenciaveis !== 'undefined') receitasGerenciaveis = Array.isArray(dados.receitasGerenciaveis) ? dados.receitasGerenciaveis : [];
          if (dados.configReceita) localStorage.setItem('cpConfigReceita', JSON.stringify(dados.configReceita));

          salvarIng(); salvarPedidos(); salvarReceita(); salvarProdutos();
          if (typeof salvarClientes === 'function') salvarClientes();
          if (typeof salvarReceitasGerenciaveis === 'function') salvarReceitasGerenciaveis();

          // O backup pode ser de uma versão antiga do app (com bugs já
          // corrigidos hoje, tipo custo zerado ou ingrediente padrão faltando).
          // Roda merge + todas as migrações de novo, do zero, pra garantir que
          // os dados importados fiquem no mesmo estado que os de quem já
          // estava usando o app.
          rodarMesclaEMigracoes(0);

          renderIngredientes(); atualizarSelect(); atualizarSelectProduto(); renderReceita(); renderPedidos(); renderProdutos(); atualizarDashboard();
          if (typeof renderClientes === 'function') renderClientes();
          if (typeof atualizarDatalistsGestao === 'function') atualizarDatalistsGestao();
          if (typeof renderReceitasGerenciaveis === 'function') renderReceitasGerenciaveis();
          if (typeof renderEstoqueResumo === 'function') renderEstoqueResumo();
          if (typeof gerarListaCompras === 'function') gerarListaCompras();

          toast(qtdInvalidos > 0
            ? `✓ Dados importados — ${qtdInvalidos} ingrediente(s) inválido(s) foram ignorados`
            : '✓ Dados importados com sucesso!');
        }
      });
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
    receita:  'Isso vai limpar todos os ingredientes da receita que você está montando agora.',
    pedidos:  'Isso vai apagar todos os pedidos registrados. Essa ação não pode ser desfeita.',
    produtos: 'Isso vai apagar todos os produtos cadastrados. Essa ação não pode ser desfeita.',
    tudo:     'Isso vai apagar TUDO: ingredientes, receita atual, produtos e pedidos. Essa ação não pode ser desfeita.',
  };
  const titulos = {
    receita:  'Limpar receita atual?',
    pedidos:  'Apagar todos os pedidos?',
    produtos: 'Apagar todos os produtos?',
    tudo:     'Apagar TUDO?',
  };

  abrirConfirmacao({
    titulo: titulos[tipo] || 'Confirmar',
    mensagem: msgs[tipo] || 'Tem certeza?',
    textoConfirmar: tipo === 'tudo' ? 'Apagar tudo' : 'Apagar',
    icone: '🗑',
    perigo: true,
    aoConfirmar: function() {
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
  });
}
