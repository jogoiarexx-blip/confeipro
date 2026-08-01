// ═══════════════════════════════════════════
// RE-MESCLAGEM AUTOMÁTICA DE DADOS PADRÃO
// ═══════════════════════════════════════════
// Fonte da verdade dos produtos padrão. Pra adicionar um novo produto
// padrão no futuro, só criar a função (tipo criarProdutoBoloNuvemPadrao)
// e incluir aqui — o merge abaixo cuida do resto.
function produtosPadrao() {
  return [criarProdutoBoloNuvemPadrao()];
}

// Adiciona em `ingredientes` qualquer item de EXEMPLOS que ainda não
// exista (comparando nome normalizado). Nunca sobrescreve o que já
// está salvo — só complementa o que falta.
function mesclarIngredientesPadrao() {
  let mudou = false;
  EXEMPLOS.forEach(padrao => {
    if (!ingredientes.find(ing => norm(ing.nome) === norm(padrao.nome))) {
      ingredientes.push({ ...padrao });
      mudou = true;
    }
  });
  if (mudou) salvarIng();
}

// Mesma lógica pra produtos padrão, comparando por id.
function mesclarProdutosPadrao() {
  let mudou = false;
  produtosPadrao().forEach(padrao => {
    if (!produtos.find(p => p.id === padrao.id)) {
      produtos.push(padrao);
      mudou = true;
    }
  });
  if (mudou) salvarProdutos();
}

// Migração pontual (v5): corrige o Bolo Nuvem padrão salvo por uma versão
// anterior que indevidamente duplicava o chantininho como recheio E
// cobertura (500ml + 500ml), e ajusta a embalagem antiga (R$5) pro novo
// padrão (R$2). Só mexe se o produto ainda não foi customizado pelo usuário.
// Migrações assim (correção de dado específico, não "adicionar padrão
// novo") continuam precisando de código manual — mas só rodam uma vez,
// e o merge genérico acima resolve sozinho o caso mais comum.
function migrarBoloNuvemPadrao() {
  const p = produtos.find(p => p.id === 'produto_bolo_nuvem_padrao');
  if (!p) return;
  let mudou = false;
  // Compara por nome+quantidade (não por custo), pra não depender do preço
  // atual dos ingredientes — se o preço mudou desde a versão com bug, uma
  // comparação por custo deixaria de reconhecer o duplicado.
  const assinatura = lista => lista.map(i => `${norm(i.nome)}:${i.qtd}`).sort().join('|');
  const recheioAntigoEsperado = assinatura(CHANTININHO_NINHO_PADRAO);
  if (p.recheio && p.recheio.length && assinatura(p.recheio) === recheioAntigoEsperado) {
    p.recheio = [];
    mudou = true;
  }
  if (p.embalagem === 5) {
    p.embalagem = 2;
    mudou = true;
  }
  if (mudou) salvarProdutos();
}

// Migração pontual (v6): custoPorUnidade() arredondava pra centavos antes
// de multiplicar pela quantidade usada — ingredientes baratos por unidade
// (ex: açúcar, R$18/5000g = R$0,0036/g) davam custo R$0,00 e ficaram assim
// salvos em produtos/receita. Aqui a gente recalcula só os itens que estão
// zerados (e deveriam ter custo, porque tem quantidade > 0 e o ingrediente
// existe), sem mexer em nada que já esteja correto.
function corrigirCustosZerados() {
  let mudouProdutos = false;
  produtos.forEach(p => {
    ['massa', 'recheio', 'cobertura', 'decoracao'].forEach(etapa => {
      (p[etapa] || []).forEach(item => {
        if (item.custo === 0 && item.qtd > 0) {
          const ing = buscarIngrediente(item.nome);
          if (ing) {
            const novoCusto = arred(custoPorUnidade(ing) * item.qtd);
            if (novoCusto > 0) { item.custo = novoCusto; mudouProdutos = true; }
          }
        }
      });
    });
  });
  if (mudouProdutos) salvarProdutos();

  let mudouReceita = false;
  receita.forEach(item => {
    if (item.custo === 0 && item.qtd > 0) {
      const ing = buscarIngrediente(item.nome);
      if (ing) {
        const novoCusto = arred(custoPorUnidade(ing) * item.qtd);
        if (novoCusto > 0) { item.custo = novoCusto; mudouReceita = true; }
      }
    }
  });
  if (mudouReceita) salvarReceita();
}

// Migração pontual (v7): a caixinha de leite condensado é 390g, não 395g
// — e a cobertura padrão do Bolo Nuvem usava só meia caixinha (200g) por
// engano; o certo é a caixinha inteira (390g). Corrige o ingrediente
// padrão só se ele ainda estiver no valor antigo (395g/R$7,50), e corrige
// a cobertura do Bolo Nuvem só se ela ainda for exatamente a receita
// padrão original — em nenhum dos dois casos mexe em customização feita
// pelo usuário.
function corrigirLeiteCondensado() {
  const ing = ingredientes.find(i => norm(i.nome) === norm('Leite condensado'));
  if (ing && ing.qtdTotal === 395 && ing.precoTotal === 7.5) {
    ing.qtdTotal = 390;
    salvarIng();
  }

  const p = produtos.find(p => p.id === 'produto_bolo_nuvem_padrao');
  if (p && p.cobertura && p.cobertura.length) {
    const assinatura = lista => lista.map(i => `${norm(i.nome)}:${i.qtd}`).sort().join('|');
    const coberturaAntiga = assinatura([
      { nome: 'Chantilly',        qtd: 500 },
      { nome: 'Leite em pó',      qtd: 100 },
      { nome: 'Leite condensado', qtd: 200 },
    ]);
    if (assinatura(p.cobertura) === coberturaAntiga) {
      p.cobertura = itensParaEtapa(CHANTININHO_NINHO_PADRAO);
      salvarProdutos();
    }
  }
}

// Migração pontual (v9): receita do Bolo Nuvem corrigida pra bater com a
// receita de referência — massa agora leva 3 ovos (não 4), 270g de açúcar
// (não 200g), 100ml de óleo (não 120ml) e ganhou 100g de leite em pó que
// faltava; cobertura ganhou 200g de creme de leite (que faltava) e foi de
// 100g pra 120g de leite em pó. Só mexe se massa/cobertura ainda forem
// exatamente a receita padrão anterior (não customizada pelo usuário).
function corrigirReceitaBoloNuvemV9() {
  const p = produtos.find(p => p.id === 'produto_bolo_nuvem_padrao');
  if (!p) return;
  let mudou = false;
  const assinatura = lista => lista.map(i => `${norm(i.nome)}:${i.qtd}`).sort().join('|');

  const massaAntigaEsperada = assinatura([
    { nome: 'Leite integral',       qtd: 200 },
    { nome: 'Ovos',                 qtd: 4   },
    { nome: 'Açúcar',               qtd: 200 },
    { nome: 'Óleo',                 qtd: 120 },
    { nome: 'Farinha de trigo',     qtd: 240 },
    { nome: 'Fermento em pó',       qtd: 10  },
    { nome: 'Essência de baunilha', qtd: 5   },
  ]);
  if (p.massa && p.massa.length && assinatura(p.massa) === massaAntigaEsperada) {
    p.massa = itensParaEtapa(MASSA_BAUNILHA_PADRAO);
    mudou = true;
  }

  const coberturaAntigaEsperada = assinatura([
    { nome: 'Chantilly',        qtd: 500 },
    { nome: 'Leite em pó',      qtd: 100 },
    { nome: 'Leite condensado', qtd: 390 },
  ]);
  if (p.cobertura && p.cobertura.length && assinatura(p.cobertura) === coberturaAntigaEsperada) {
    p.cobertura = itensParaEtapa(CHANTININHO_NINHO_PADRAO);
    mudou = true;
  }

  if (mudou) salvarProdutos();
}

// Migração pontual (v10): ingredientes cadastrados em kg ou L (antes da
// conversão automática existir) ficavam com custoPorUnidade() calculado
// "por kg"/"por L" — e quem usava a receita digitando a quantidade em
// gramas/ml (o mais comum) acabava com o custo 1000x maior sem nenhum
// aviso. Aqui só convertemos o CADASTRO do ingrediente (qtdTotal/unidade)
// pra g/ml; itens de receita/produto já salvos mantêm o custo congelado
// de quando foram adicionados, igual às outras migrações deste arquivo.
function corrigirUnidadesKgLitro() {
  let mudou = false;
  ingredientes.forEach(ing => {
    if (ing.unidade === 'kg' || ing.unidade === 'L') {
      const { qtd, unidade } = normalizarUnidade(ing.qtdTotal, ing.unidade);
      ing.qtdTotal = qtd;
      ing.unidade  = unidade;
      mudou = true;
    }
  });
  if (mudou) salvarIng();
}

// Lista de migrações pontuais, associadas à versão em que passaram a existir.
// Ao subir o APP_VERSION, só rodam as migrações com versao > versão salva.
const MIGRACOES = [
  { versao: 5,  executar: migrarBoloNuvemPadrao },
  { versao: 6,  executar: corrigirCustosZerados },
  { versao: 7,  executar: corrigirLeiteCondensado },
  { versao: 9,  executar: corrigirReceitaBoloNuvemV9 },
  { versao: 10, executar: corrigirUnidadesKgLitro },
];

function rodarMesclaEMigracoes(versaoBase) {
  mesclarIngredientesPadrao();
  mesclarProdutosPadrao();
  MIGRACOES
    .filter(m => m.versao > versaoBase && m.versao <= APP_VERSION)
    .forEach(m => m.executar());
  localStorage.setItem('cpVersion', String(APP_VERSION));
}

(function atualizarApp() {
  const versaoSalva = parseInt(localStorage.getItem('cpVersion') || '0', 10);
  if (versaoSalva >= APP_VERSION) return;
  rodarMesclaEMigracoes(versaoSalva);
})();
