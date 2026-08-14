// ═══════════════════════════════════════════
// ESTADO + PERSISTÊNCIA
// ═══════════════════════════════════════════
// Toda vez que você adicionar um novo ingrediente ou produto padrão:
//   1) adicione no array (EXEMPLOS / produtosPadrao)
//   2) suba o número abaixo
// O app detecta sozinho que a versão mudou e mescla o que falta nos
// dados de quem já usava o app, sem apagar nada que o usuário já
// tenha customizado. Nada de migração manual.
const APP_VERSION = 12;

const EXEMPLOS = [
  { nome: 'Chocolate em pó 50%',   precoTotal: 15,  qtdTotal: 200,  unidade: 'g'       },
  { nome: 'Cobertura meio amarga', precoTotal: 70,  qtdTotal: 1000, unidade: 'g'       },
  { nome: 'Chocolate branco (cobertura)', precoTotal: 71, qtdTotal: 1000, unidade: 'g' },
  { nome: 'Leite integral',        precoTotal: 6,   qtdTotal: 1000, unidade: 'ml'      },
  { nome: 'Leite condensado',      precoTotal: 7.5, qtdTotal: 390,  unidade: 'g'       },
  { nome: 'Creme de leite',        precoTotal: 3.5, qtdTotal: 200,  unidade: 'g'       },
  { nome: 'Leite de coco',         precoTotal: 4.5, qtdTotal: 200,  unidade: 'ml'      },
  { nome: 'Coco flocado',          precoTotal: 6.5, qtdTotal: 200,  unidade: 'g'       },
  { nome: 'Ovos',                  precoTotal: 30,  qtdTotal: 30,   unidade: 'unidade' },
  { nome: 'Açúcar',                precoTotal: 18,  qtdTotal: 5000, unidade: 'g'       },
  { nome: 'Açúcar de confeiteiro', precoTotal: 8,   qtdTotal: 1000, unidade: 'g'       },
  { nome: 'Farinha de trigo',      precoTotal: 6,   qtdTotal: 1000, unidade: 'g'       },
  { nome: 'Óleo',                  precoTotal: 8,   qtdTotal: 900,  unidade: 'ml'      },
  { nome: 'Manteiga sem sal',      precoTotal: 10,  qtdTotal: 200,  unidade: 'g'       },
  { nome: 'Fermento em pó',        precoTotal: 14,  qtdTotal: 250,  unidade: 'g'       },
  { nome: 'Fermento biológico seco', precoTotal: 11, qtdTotal: 125, unidade: 'g'       },
  { nome: 'Bicarbonato de sódio',  precoTotal: 6,   qtdTotal: 150,  unidade: 'g'       },
  { nome: 'Amido de milho',        precoTotal: 9,   qtdTotal: 500,  unidade: 'g'       },
  { nome: 'Sal refinado',          precoTotal: 4,   qtdTotal: 1000, unidade: 'g'       },
  { nome: 'Limão',                 precoTotal: 1.5, qtdTotal: 1,    unidade: 'unidade' },
  { nome: 'Chantilly',             precoTotal: 30,  qtdTotal: 1000, unidade: 'ml'      },
  { nome: 'Leite em pó',           precoTotal: 25,  qtdTotal: 380,  unidade: 'g'       },
  { nome: 'Essência de baunilha',  precoTotal: 8,   qtdTotal: 30,   unidade: 'ml'      },
  { nome: 'Chocolate granulado',   precoTotal: 10,  qtdTotal: 500,  unidade: 'g'       },
  { nome: 'Doce de leite',         precoTotal: 13,  qtdTotal: 400,  unidade: 'g'       },
  { nome: 'Açúcar mascavo',        precoTotal: 8,   qtdTotal: 1000, unidade: 'g'       },
  { nome: 'Farinha de rosca',      precoTotal: 7,   qtdTotal: 500,  unidade: 'g'       },
  { nome: 'Canela em pó',          precoTotal: 6,   qtdTotal: 50,   unidade: 'g'       },
  { nome: 'Gemas',                 precoTotal: 30,  qtdTotal: 30,   unidade: 'unidade' },
  { nome: 'Mel',                   precoTotal: 28,  qtdTotal: 1000, unidade: 'g'       }, // comprado a R$28/litro
  { nome: 'Especiarias',           precoTotal: 65,  qtdTotal: 1000, unidade: 'g'       }, // mix (cravo/gengibre/etc.) a R$65/kg
];

let ingredientes = JSON.parse(localStorage.getItem('cpIngredientes') || 'null');
if (!ingredientes) { ingredientes = [...EXEMPLOS]; salvarIng(); }

let pedidos = JSON.parse(localStorage.getItem('cpPedidos') || '[]');
let receita = JSON.parse(localStorage.getItem('cpReceita') || '[]');

// ═══════════════════════════════════════════
// PRODUTOS — RECEITA PADRÃO "BOLO NUVEM"
// ═══════════════════════════════════════════
// Atualizado conforme receita de referência (post "Com Prato Cheio"):
// 3 ovos, 1½ xícara de açúcar (~180g/xícara ≈ 270g), 100ml óleo,
// 200ml leite morno, 100g leite em pó, 240g farinha, 1 colher de
// sopa de fermento (~10g), essência de baunilha opcional.
const MASSA_BAUNILHA_PADRAO = [
  { nome: 'Leite integral',       qtd: 200, unidade: 'ml'      }, // leite morno
  { nome: 'Ovos',                 qtd: 3,   unidade: 'unidade' },
  { nome: 'Açúcar',               qtd: 270, unidade: 'g'       },
  { nome: 'Óleo',                 qtd: 100, unidade: 'ml'      },
  { nome: 'Leite em pó',          qtd: 100, unidade: 'g'       },
  { nome: 'Farinha de trigo',     qtd: 240, unidade: 'g'       },
  { nome: 'Fermento em pó',       qtd: 10,  unidade: 'g'       },
  { nome: 'Essência de baunilha', qtd: 5,   unidade: 'ml'      },
];
// Cobertura: 1 caixa de chantilly, 1 caixa de creme de leite gelado,
// 1 caixa de leite condensado gelado, 120g de leite em pó.
const CHANTININHO_NINHO_PADRAO = [
  { nome: 'Chantilly',        qtd: 500, unidade: 'ml' },
  { nome: 'Creme de leite',   qtd: 200, unidade: 'g'  }, // 1 caixinha
  { nome: 'Leite condensado', qtd: 390, unidade: 'g'  }, // 1 caixinha inteira
  { nome: 'Leite em pó',      qtd: 120, unidade: 'g'  },
];

function itensParaEtapa(lista) {
  return lista.map(item => {
    const ing = buscarIngrediente(item.nome);
    if (!ing) return null;
    return { nome: ing.nome, qtd: item.qtd, unidade: item.unidade, custo: arred(custoPorUnidade(ing) * item.qtd) };
  }).filter(Boolean);
}

function criarProdutoBoloNuvemPadrao() {
  return {
    id: 'produto_bolo_nuvem_padrao',
    nome: 'Bolo Nuvem',
    pesoFinal: 1.5,
    rendimento: 12,
    massa:      itensParaEtapa(MASSA_BAUNILHA_PADRAO),
    recheio:    [],
    cobertura:  itensParaEtapa(CHANTININHO_NINHO_PADRAO),
    decoracao:  [],
    embalagem:  2,
    gas:        2,
    energia:    0,
    valorHora:  20,
    horas:      1.5,
    perda:      8,
    taxa:       5,
    margem:     50,
  };
}

let produtos = JSON.parse(localStorage.getItem('cpProdutos') || 'null');
if (!produtos) { produtos = [criarProdutoBoloNuvemPadrao()]; salvarProdutos(); }
function salvarProdutos() { localStorage.setItem('cpProdutos', JSON.stringify(produtos)); }

function salvarIng()     { localStorage.setItem('cpIngredientes', JSON.stringify(ingredientes)); }
function salvarPedidos() { localStorage.setItem('cpPedidos',      JSON.stringify(pedidos));      }
function salvarReceita() { localStorage.setItem('cpReceita',      JSON.stringify(receita));      }
