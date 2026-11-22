// CONFEIPRO — sobremesas e recheios-base de Natal (imagens recebidas em 22/11/2026).
// Os totais das sobremesas são a soma das camadas nas imagens (antes de perdas).
// Sub-receitas como creme branco, brigadeiro e brownie são cadastradas como receitas
// independentes. Não inventar custo nem vender com custos parciais como se completos.
// O preparo das montagens é SUGERIDO; as fotos informam apenas suas camadas.

const SOBREMESAS_NATAL_NOV2026 = [
  {
    chave:'bombom-morango-travessa-1650g',
    nome:'🍓 Bombom de morango na travessa — 1.650 g',
    porcoes:1, unidadeRendimento:'1 travessa; 1.650 g de camadas antes de perdas',
    itens:[
      ['Creme branco pronto',700,'g'],
      ['Morangos picados',450,'g'],
      ['Brigadeiro 50% cacau pronto',400,'g'],
      ['Morangos para decoração',100,'g']
    ],
    preparo:[
      'Montagem sugerida: use os recheios já preparados e frios. As quantidades são da imagem: 700 g de creme branco, 450 g de morangos picados, 400 g de brigadeiro 50% cacau e 100 g de morangos para decorar.',
      'Higienize os morangos e seque bem. Espalhe parte do creme branco no fundo da travessa; distribua os morangos picados e cubra com o restante do creme.',
      'Finalize com o brigadeiro 50% cacau em temperatura adequada para espalhar e com os morangos da decoração.',
      'Refrigere até firmar. Os recheios são receitas-base separadas; seu custo depende do cadastro dos componentes prontos. Peso de camadas: 1.650 g, sem considerar perdas.'
    ]
  },
  {
    chave:'bombom-uva-travessa-1700g',
    nome:'🍇 Bombom de uva na travessa — 1.700 g',
    porcoes:1, unidadeRendimento:'1 travessa; 1.700 g de camadas antes de perdas',
    itens:[
      ['Creme branco pronto',700,'g'],
      ['Uvas sem sementes',500,'g'],
      ['Brigadeiro 50% cacau pronto',400,'g'],
      ['Uvas para decorar',100,'g']
    ],
    preparo:[
      'Montagem sugerida: prepare e esfrie os recheios. As quantidades da imagem são 700 g de creme branco, 500 g de uvas sem sementes, 400 g de brigadeiro 50% cacau e 100 g de uvas para decorar.',
      'Lave e seque muito bem as uvas. Coloque parte do creme branco na travessa, espalhe as uvas e cubra com o creme restante.',
      'Espalhe o brigadeiro 50% cacau sobre o creme e finalize com as uvas reservadas.',
      'Leve à geladeira até firmar. Os recheios são receitas-base cadastradas em separado e exigem custo próprio. Peso das camadas: 1.700 g.'
    ]
  },
  {
    chave:'chocobrownie-travessa-1800g',
    nome:'🍫 Chocobrownie na travessa — 1.800 g',
    porcoes:1, unidadeRendimento:'1 travessa; 1.800 g de camadas antes de perdas',
    itens:[
      ['Brownie em cubos',450,'g'],
      ['Creme branco pronto',550,'g'],
      ['Brigadeiro 50% cacau pronto',500,'g'],
      ['Morangos',200,'g'],
      ['Brownie para decoração',100,'g']
    ],
    preparo:[
      'Montagem sugerida: separe 450 g de brownie em cubos, 550 g de creme branco, 500 g de brigadeiro 50% cacau, 200 g de morangos e 100 g de brownie para decoração, conforme a imagem.',
      'Em uma travessa, distribua o brownie em cubos, intercalando com o creme branco frio. Acrescente os morangos higienizados e bem secos.',
      'Cubra com o brigadeiro 50% cacau em ponto de espalhar e decore com os 100 g de brownie reservados.',
      'Leve à geladeira até firmar. A imagem também traz uma receita-base alternativa de brigadeiro mole, cadastrada separadamente: não some os dois brigadeiros à montagem. A receita da massa do brownie não foi informada; use brownie já pronto/cadastrado.'
    ]
  },
  {
    chave:'banoffee-travessa-1755g',
    nome:'🍌 Banoffee na travessa — 1.755 g',
    porcoes:1, unidadeRendimento:'1 travessa; 1.755 g de camadas antes de perdas',
    itens:[
      ['Biscoito triturado',250,'g'],
      ['Manteiga',100,'g'],
      ['Doce de leite',450,'g'],
      ['Banana',450,'g'],
      ['Chantilly batido',500,'g'],
      ['Canela em pó',5,'g']
    ],
    preparo:[
      'Montagem sugerida: misture os 250 g de biscoito triturado com os 100 g de manteiga derretida para formar uma base úmida.',
      'Pressione a mistura no fundo da travessa e refrigere brevemente. Espalhe os 450 g de doce de leite.',
      'Distribua os 450 g de banana fatiada e cubra com os 500 g de chantilly já batido.',
      'Finalize com os 5 g de canela e conserve refrigerada até servir. Os valores da imagem somam 1.755 g de camadas, sem perdas.'
    ]
  },
  {
    chave:'creme-branco-2-cremes-80a100g-leite-po',
    nome:'🥛 Creme branco para bombons — 2 caixas de creme de leite',
    porcoes:1, unidadeRendimento:'aproximadamente 1 kg pronto (conforme imagem; pesar após cozinhar)',
    itens:[
      ['Leite condensado',790,'g'],
      ['Creme de leite',400,'g'],
      ['Leite em pó',80,'g']
    ],
    preparo:[
      'Receita-base enviada para bombom de morango e bombom de uva: 2 caixas de leite condensado (395 g cada), 2 caixas de creme de leite (200 g cada) e 80 a 100 g de leite em pó.',
      'O cadastro utiliza o limite inferior de 80 g de leite em pó; ajuste para até 100 g antes de calcular o custo, se for usar o limite superior.',
      'Leve ao fogo baixo, mexendo sempre, até ficar consistente, porém cremoso para montagem.',
      'Deixe esfriar completamente. A imagem indica rendimento aproximado de 1 kg, variável conforme perda de água no cozimento. Pese a produção pronta.'
    ]
  },
  {
    chave:'creme-branco-3-cremes-100g-leite-po',
    nome:'🥛 Creme branco para sobremesas — 3 caixas de creme de leite',
    porcoes:1, unidadeRendimento:'1 receita-base (rendimento final variável; pesar pronto)',
    itens:[
      ['Leite condensado',790,'g'],
      ['Creme de leite',600,'g'],
      ['Leite em pó',100,'g']
    ],
    preparo:[
      'Segunda versão da imagem: 2 caixas de leite condensado (790 g), 3 caixas de creme de leite (600 g) e 100 g de leite em pó.',
      'Misture os ingredientes e cozinhe em fogo baixo, mexendo sempre, até ficar cremoso, consistente, mas ainda macio para a montagem.',
      'Deixe esfriar completamente antes de empregar nas sobremesas. O rendimento depende da evaporação; pese o creme pronto para precificar por grama.',
      'Esta versão é alternativa à versão com 2 caixas de creme de leite. Não misture automaticamente as duas fórmulas.'
    ]
  },
  {
    chave:'brigadeiro-50-cacau-base-1300g',
    nome:'🍫 Brigadeiro 50% cacau — base para três sobremesas',
    porcoes:1, unidadeRendimento:'meta da imagem: aproximadamente 1.300 g prontos (verificar peso real)',
    itens:[
      ['Leite condensado',1185,'g'],
      ['Creme de leite',600,'g'],
      ['Chocolate em pó 50%',120,'g']
    ],
    preparo:[
      'Receita-base da imagem: 3 caixas de leite condensado (395 g cada), 3 caixas de creme de leite (200 g cada) e 120 g de chocolate em pó 50% cacau.',
      'Misture os ingredientes e leve ao fogo baixo, mexendo sempre, até obter brigadeiro cremoso em ponto adequado para espalhar nas travessas.',
      'Esfrie antes de montar. A imagem planeja cerca de 1.300 g prontos para as três sobremesas: 400 g no bombom de uva, 400 g no bombom de morango e 500 g no Chocobrownie.',
      'O peso inicial dos ingredientes é 1.905 g; o peso final depende da perda de água no cozimento. Pese o lote pronto e ajuste o rendimento e os custos, em vez de assumir automaticamente 1.300 g.'
    ]
  },
  {
    chave:'brigadeiro-mole-chocobrownie-base',
    nome:'🍫 Brigadeiro mole para Chocobrownie — receita-base',
    porcoes:1, unidadeRendimento:'1 preparo de brigadeiro mole (peso final variável)',
    itens:[
      ['Leite condensado',395,'g'],
      ['Creme de leite',200,'g'],
      ['Chocolate em pó 50%',50,'g']
    ],
    preparo:[
      'Ingredientes da imagem: 1 caixa de leite condensado, 1 caixa de creme de leite e 50 g de chocolate em pó OU chocolate derretido. O cadastro assume caixas de 395 g e 200 g e a opção chocolate em pó 50%; modifique se escolher chocolate derretido.',
      'Preparo sugerido: cozinhe em fogo baixo, mexendo sempre, até obter consistência mole e cremosa, adequada para cobertura. Esfrie antes de usar.',
      'É uma base alternativa para o Chocobrownie. Não adicionar junto com os 500 g do brigadeiro 50% cacau da montagem sem recalcular os ingredientes.'
    ]
  }
];

function inicializarSobremesasNatalNov2026() {
  const chaveInstalacao = 'cpSobremesasNatalNov2026InicializadasV1';
  if (localStorage.getItem(chaveInstalacao) === '1') return;

  const data = new Date().toISOString();
  let adicionadas = 0;
  SOBREMESAS_NATAL_NOV2026.forEach(modelo => {
    const id = 'rec_natal_' + modelo.chave;
    if (receitasGerenciaveis.some(r => r.id === id)) return;
    const itens = modelo.itens.map(([nome, qtd, unidade]) => {
      // Não trocar silenciosamente unidade (ex.: kg -> g) nem inventar preço.
      const ing = ingredientes.find(x =>
        norm(x.nome) === norm(nome) && x.unidade === unidade
      );
      return {
        nome: ing ? ing.nome : nome,
        qtd, unidade,
        custo: ing ? arred(custoPorUnidade(ing) * qtd) : 0
      };
    });
    receitasGerenciaveis.push({
      id, nome:modelo.nome, pasta:'natal', itens, porcoes:modelo.porcoes,
      unidadeRendimento:modelo.unidadeRendimento,
      modoPreparo:modelo.preparo.map((passo, i) => (i + 1) + '. ' + passo).join('\n\n'),
      config:{}, padrao:true, criadoEm:data, atualizadoEm:data
    });
    adicionadas++;
  });

  // Após instalação, não ressuscitar exclusões nem sobrescrever edições.
  localStorage.setItem(chaveInstalacao, '1');
  if (adicionadas) {
    salvarReceitasGerenciaveis();
    renderReceitasGerenciaveis();
  }
}
document.addEventListener('DOMContentLoaded', inicializarSobremesasNatalNov2026);
