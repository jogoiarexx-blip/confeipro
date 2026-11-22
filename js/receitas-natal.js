// CONFEIPRO — COLEÇÃO NATALINA 2026
// As quantidades e o preparo são sugestões editáveis. Preços de ingredientes
// não cadastrados NUNCA são inventados; permanecem pendentes até o cadastro.
const RECEITAS_NATAL_2026 = [
  {
    chave:'panetone', nome:'🎄 Panetone tradicional com frutas',
    porcoes:2, unidadeRendimento:'2 panetones de aproximadamente 500 g', tempoMinutos:210,
    itens:[
      ['Farinha de trigo',500,'g'],['Leite integral',200,'ml'],['Ovos',3,'unidade'],
      ['Manteiga sem sal',100,'g'],['Açúcar',100,'g'],['Fermento biológico seco',10,'g'],
      ['Sal refinado',5,'g'],['Essência de baunilha',5,'ml'],
      ['Frutas cristalizadas',180,'g'],['Uvas-passas',120,'g']
    ],
    preparo:[
      'Misture o fermento, o leite morno e uma parte da farinha. Deixe descansar por 15 minutos.',
      'Junte os ovos, o açúcar, a farinha restante, o sal e a baunilha. Sove e incorpore a manteiga aos poucos até obter massa elástica.',
      'Cubra e deixe crescer até dobrar de tamanho (aproximadamente 60 a 90 minutos, conforme a temperatura).',
      'Misture as frutas cristalizadas e as passas. Divida em 2 formas de papel para panetone de 500 g e deixe crescer novamente.',
      'Asse em forno preaquecido a 180 °C por cerca de 35 a 45 minutos, até dourar e cozinhar por dentro. Esfrie antes de embalar.'
    ]
  },
  {
    chave:'chocotone', nome:'🍫 Chocotone artesanal',
    porcoes:2, unidadeRendimento:'2 chocotones de aproximadamente 500 g', tempoMinutos:210,
    itens:[
      ['Farinha de trigo',500,'g'],['Leite integral',200,'ml'],['Ovos',3,'unidade'],
      ['Manteiga sem sal',100,'g'],['Açúcar',100,'g'],['Fermento biológico seco',10,'g'],
      ['Sal refinado',5,'g'],['Essência de baunilha',5,'ml'],
      ['Chocolate em gotas',250,'g']
    ],
    preparo:[
      'Prepare a esponja com fermento, leite morno e um pouco da farinha. Aguarde 15 minutos.',
      'Junte os ovos, açúcar, farinha restante, sal e baunilha; sove. Incorpore a manteiga e trabalhe até a massa ficar elástica.',
      'Deixe crescer coberta até dobrar de volume. Incorpore as gotas de chocolate sem aquecer a massa.',
      'Distribua em 2 formas de 500 g, espere crescer quase até a borda e asse a 180 °C por 35 a 45 minutos.',
      'Deixe esfriar completamente antes de cortar ou embalar.'
    ]
  },
  {
    chave:'rabanada', nome:'🍞 Rabanada tradicional',
    porcoes:12, unidadeRendimento:'12 fatias', tempoMinutos:35,
    itens:[
      ['Pão para rabanada',600,'g'],['Leite integral',400,'ml'],['Ovos',3,'unidade'],
      ['Açúcar',120,'g'],['Canela em pó',8,'g'],['Óleo',150,'ml']
    ],
    preparo:[
      'Corte o pão amanhecido em 12 fatias grossas. Misture o leite com 20 g do açúcar.',
      'Passe as fatias rapidamente no leite e depois nos ovos batidos, sem encharcar.',
      'Frite aos poucos em óleo quente até dourarem dos dois lados. Escorra em papel absorvente.',
      'Misture o açúcar restante com a canela e passe as rabanadas ainda mornas.',
      'O óleo listado corresponde a uma estimativa de consumo, não ao volume total necessário para a frigideira.'
    ]
  },
  {
    chave:'pave-chocolate', nome:'🍫 Pavê natalino de chocolate',
    porcoes:12, unidadeRendimento:'12 porções', tempoMinutos:30,
    itens:[
      ['Biscoito maisena',350,'g'],['Leite condensado',390,'g'],
      ['Leite integral',500,'ml'],['Creme de leite',400,'g'],
      ['Chocolate em pó 50%',70,'g'],['Amido de milho',30,'g'],
      ['Cobertura meio amarga',150,'g']
    ],
    preparo:[
      'Misture o leite condensado, 350 ml de leite, o chocolate em pó e o amido. Cozinhe mexendo até engrossar.',
      'Desligue o fogo e misture metade do creme de leite. Deixe amornar.',
      'Monte camadas de creme e biscoito maisena umedecido no restante do leite.',
      'Derreta a cobertura meio amarga e misture ao creme de leite restante para fazer a ganache.',
      'Espalhe a ganache por cima. Refrigere por pelo menos 4 horas antes de servir.'
    ]
  },
  {
    chave:'pave-doce-leite', nome:'🥄 Pavê de doce de leite',
    porcoes:10, unidadeRendimento:'10 porções', tempoMinutos:25,
    itens:[
      ['Biscoito maisena',350,'g'],['Doce de leite',600,'g'],
      ['Creme de leite',400,'g'],['Leite integral',300,'ml'],
      ['Leite em pó',60,'g'],['Canela em pó',3,'g']
    ],
    preparo:[
      'Misture o doce de leite com o creme de leite até formar um creme uniforme.',
      'Dissolva o leite em pó no leite. Use essa mistura para umedecer brevemente os biscoitos.',
      'Monte camadas de biscoito e creme de doce de leite em uma travessa.',
      'Finalize com uma camada de creme e polvilhe canela.',
      'Leve à geladeira por pelo menos 4 horas antes de servir.'
    ]
  },
  {
    chave:'biscoitos', nome:'⭐ Biscoitos natalinos decorados',
    porcoes:30, unidadeRendimento:'aproximadamente 30 biscoitos', tempoMinutos:90,
    itens:[
      ['Farinha de trigo',350,'g'],['Manteiga sem sal',180,'g'],
      ['Açúcar',150,'g'],['Ovos',1,'unidade'],
      ['Essência de baunilha',5,'ml'],['Canela em pó',6,'g'],
      ['Fermento em pó',5,'g'],['Açúcar de confeiteiro',120,'g'],
      ['Limão',1,'unidade']
    ],
    preparo:[
      'Bata a manteiga e o açúcar. Misture o ovo e a baunilha.',
      'Acrescente farinha, canela e fermento. Misture até obter massa lisa, sem sovar demais.',
      'Refrigere por 30 minutos. Abra entre folhas de papel-manteiga e corte com moldes natalinos.',
      'Asse a 180 °C por 10 a 14 minutos, até as bordas começarem a dourar. Deixe esfriar.',
      'Faça glacê simples com açúcar de confeiteiro e suco de limão, ajustando a consistência com gotas de água. Decore os biscoitos frios.'
    ]
  },
  {
    chave:'brownie', nome:'🎁 Brownie natalino com doce de leite',
    porcoes:16, unidadeRendimento:'16 quadrados', tempoMinutos:55,
    itens:[
      ['Cobertura meio amarga',220,'g'],['Manteiga sem sal',180,'g'],
      ['Ovos',3,'unidade'],['Açúcar',280,'g'],
      ['Farinha de trigo',150,'g'],['Canela em pó',3,'g'],
      ['Doce de leite',200,'g']
    ],
    preparo:[
      'Derreta o chocolate com a manteiga e deixe amornar.',
      'Misture os ovos e o açúcar com um fouet sem incorporar ar em excesso.',
      'Junte o chocolate derretido, a farinha e a canela. Misture até ficar uniforme.',
      'Transfira para forma de aproximadamente 20 x 30 cm forrada. Distribua colheradas de doce de leite e faça leves desenhos com uma faca.',
      'Asse a 180 °C por cerca de 25 a 35 minutos. O centro deve permanecer úmido. Espere esfriar antes de cortar.'
    ]
  },
  {
    chave:'bolo-especiarias', nome:'🍰 Bolo natalino de especiarias',
    porcoes:12, unidadeRendimento:'12 fatias', tempoMinutos:70,
    itens:[
      ['Farinha de trigo',260,'g'],['Açúcar mascavo',180,'g'],
      ['Manteiga sem sal',120,'g'],['Ovos',3,'unidade'],
      ['Leite integral',180,'ml'],['Fermento em pó',12,'g'],
      ['Canela em pó',5,'g'],['Especiarias',4,'g'],
      ['Açúcar de confeiteiro',60,'g']
    ],
    preparo:[
      'Bata a manteiga com o açúcar mascavo. Adicione os ovos, um por vez.',
      'Incorpore alternadamente farinha e leite. Misture a canela e as especiarias.',
      'Adicione o fermento por último, mexendo delicadamente.',
      'Despeje em forma untada de cerca de 22 cm e asse a 180 °C por 35 a 45 minutos, até um palito sair limpo.',
      'Deixe esfriar e finalize com açúcar de confeiteiro peneirado.'
    ]
  },
  {
    chave:'brigadeiro-canela', nome:'🍬 Brigadeiro natalino de canela',
    porcoes:30, unidadeRendimento:'aproximadamente 30 docinhos', tempoMinutos:45,
    itens:[
      ['Leite condensado',780,'g'],['Creme de leite',200,'g'],
      ['Chocolate branco (cobertura)',150,'g'],
      ['Manteiga sem sal',20,'g'],['Canela em pó',6,'g'],
      ['Açúcar',70,'g']
    ],
    preparo:[
      'Leve ao fogo baixo o leite condensado, creme de leite, manteiga e chocolate branco, mexendo sem parar.',
      'Adicione 4 g de canela e continue mexendo até atingir ponto de enrolar, soltando do fundo da panela.',
      'Transfira para um prato untado, cubra em contato e deixe esfriar completamente.',
      'Enrole porções iguais e passe em uma mistura do açúcar com os 2 g restantes de canela.',
      'Conserve refrigerado e embale apenas depois de firmar.'
    ]
  },
  {
    chave:'trufa', nome:'🍫 Trufas de chocolate e especiarias',
    porcoes:24, unidadeRendimento:'aproximadamente 24 trufas', tempoMinutos:75,
    itens:[
      ['Cobertura meio amarga',500,'g'],['Creme de leite',200,'g'],
      ['Mel',25,'g'],['Canela em pó',3,'g'],
      ['Chocolate em pó 50%',50,'g']
    ],
    preparo:[
      'Aqueça o creme de leite sem ferver e despeje sobre o chocolate picado.',
      'Misture até derreter completamente. Junte mel e canela.',
      'Refrigere a ganache até ficar firme o suficiente para modelar (1 a 2 horas).',
      'Faça 24 bolinhas de tamanho parecido e passe no chocolate em pó.',
      'Mantenha refrigeradas e retire pouco antes de servir.'
    ]
  },
  {
    chave:'pudim', nome:'🍮 Pudim natalino de leite condensado',
    porcoes:10, unidadeRendimento:'10 fatias', tempoMinutos:90,
    itens:[
      ['Leite condensado',390,'g'],['Leite integral',400,'ml'],
      ['Ovos',3,'unidade'],['Açúcar',180,'g'],
      ['Canela em pó',2,'g']
    ],
    preparo:[
      'Derreta o açúcar e caramelize uma forma com furo central (aproximadamente 20 cm).',
      'Misture suavemente o leite condensado, o leite e os ovos até homogeneizar. Adicione a canela, se desejar.',
      'Passe a mistura por peneira e despeje na forma caramelizada. Cubra com papel-alumínio.',
      'Asse em banho-maria, a 160 a 180 °C, por aproximadamente 60 a 80 minutos, até firmar nas bordas e manter leve tremor no centro.',
      'Esfrie e refrigere por pelo menos 6 horas antes de desenformar.'
    ]
  },
  {
    chave:'bolo-frutas', nome:'🍊 Bolo de frutas e nozes de Natal',
    porcoes:12, unidadeRendimento:'12 fatias', tempoMinutos:75,
    itens:[
      ['Farinha de trigo',260,'g'],['Manteiga sem sal',140,'g'],
      ['Açúcar mascavo',150,'g'],['Ovos',3,'unidade'],
      ['Leite integral',150,'ml'],['Fermento em pó',12,'g'],
      ['Canela em pó',5,'g'],['Nozes',120,'g'],
      ['Frutas cristalizadas',150,'g'],['Uvas-passas',100,'g']
    ],
    preparo:[
      'Bata manteiga e açúcar até formar creme. Acrescente os ovos aos poucos.',
      'Misture alternadamente a farinha e o leite. Acrescente canela e fermento.',
      'Envolva as frutas, passas e nozes em um pouco de farinha, incorporando-as à massa sem bater demais.',
      'Coloque em forma untada de aproximadamente 22 cm e asse a 180 °C por 40 a 50 minutos, até o centro ficar assado.',
      'Espere esfriar antes de desenformar, fatiar e embalar.'
    ]
  }
];

function inicializarReceitasNatal() {
  const chaveVersao = 'cpReceitasNatal2026Inicializadas';
  if (localStorage.getItem(chaveVersao) === '1') return;
  const data = new Date().toISOString();
  let adicionadas = 0;
  RECEITAS_NATAL_2026.forEach(modelo => {
    const id = 'rec_natal_' + modelo.chave;
    if (receitasGerenciaveis.some(r => r.id === id)) return;
    const itens = modelo.itens.map(([nome,qtd,unidade]) => {
      // Buscar o nome exato impede que um preço de ingrediente semelhante seja usado por engano.
      const ing = ingredientes.find(x => norm(x.nome) === norm(nome));
      return {
        nome: ing ? ing.nome : nome,
        qtd, unidade: ing ? ing.unidade : unidade,
        custo: ing ? arred(custoPorUnidade(ing) * qtd) : 0
      };
    });
    receitasGerenciaveis.push({
      id, nome:modelo.nome, pasta:'natal', itens, porcoes:modelo.porcoes,
      unidadeRendimento:modelo.unidadeRendimento, tempoMinutos:modelo.tempoMinutos,
      modoPreparo:modelo.preparo.map((passo,indice) => (indice+1) + '. ' + passo).join('\n\n'),
      config:{}, padrao:true, criadoEm:data, atualizadoEm:data
    });
    adicionadas++;
  });
  // A marca impede ressuscitar receitas excluídas/editadas pelo usuário.
  localStorage.setItem(chaveVersao, '1');
  if (adicionadas) {
    salvarReceitasGerenciaveis();
    renderReceitasGerenciaveis();
  }
}

document.addEventListener('DOMContentLoaded', inicializarReceitasNatal);


// Receita enviada pelo usuário em novembro/2026.
// Tem ID e marca de instalação próprios: usuários que já instalaram a coleção
// natalina anterior recebem esta novidade sem resetar nem duplicar as 12 receitas.
// Esta versão não modifica o pudim natalino menor já existente.
const PUDIM_GRANDE_NATAL_2026 = {
  chave:'pudim-grande-1100ml',
  nome:'🍮 Pudim de leite condensado grande (aprox. 1,1 L)',
  porcoes:12,
  unidadeRendimento:'aproximadamente 1,1 L (volume final pode variar)',
  tempoMinutos:120,
  itens:[
    ['Leite condensado',790,'g'],['Leite integral',600,'ml'],
    ['Ovos',5,'unidade'],['Açúcar',150,'g'],['Água',80,'ml']
  ],
  preparo:[
    'Modo de preparo sugerido (a imagem enviada informa apenas os ingredientes e o rendimento estimado).',
    'Para a calda, derreta os 150 g de açúcar em fogo baixo até obter caramelo dourado. Acrescente cuidadosamente os 80 ml de água quente, aos poucos, e mexa até dissolver os torrões. Espalhe na forma com furo central.',
    'Misture os 790 g de leite condensado, os 600 ml de leite integral e os 5 ovos até homogeneizar, evitando bater demais para manter a textura cremosa. Se desejar, passe por uma peneira.',
    'Despeje na forma caramelizada, deixando espaço para a expansão, e cubra com papel-alumínio. Use forma alta com capacidade suficiente para a mistura.',
    'Asse em banho-maria no forno preaquecido a 160–180 °C por aproximadamente 70–100 minutos. O tempo varia com o forno e a forma: as bordas devem estar firmes, com leve tremor no centro.',
    'Deixe esfriar e leve à geladeira por pelo menos 6 horas antes de desenformar. O rendimento aproximado de 1,1 L pode variar conforme a forma e a cocção. O tempo cadastrado não inclui o resfriamento.'
  ]
};

function inicializarPudimGrandeNatal() {
  const chaveInstalacao = 'cpReceitaPudimGrandeNatal2026Inicializada';
  if (localStorage.getItem(chaveInstalacao) === '1') return;

  const modelo = PUDIM_GRANDE_NATAL_2026;
  const id = 'rec_natal_' + modelo.chave;
  let adicionada = false;
  if (!receitasGerenciaveis.some(r => r.id === id)) {
    const data = new Date().toISOString();
    const itens = modelo.itens.map(([nome, qtd, unidade]) => {
      // Usar preços somente de ingredientes realmente cadastrados.
      const ing = ingredientes.find(x => norm(x.nome) === norm(nome));
      return {
        nome: ing ? ing.nome : nome, qtd,
        unidade: ing ? ing.unidade : unidade,
        custo: ing ? arred(custoPorUnidade(ing) * qtd) : 0
      };
    });
    receitasGerenciaveis.push({
      id, nome:modelo.nome, pasta:'natal', itens, porcoes:modelo.porcoes,
      unidadeRendimento:modelo.unidadeRendimento, tempoMinutos:modelo.tempoMinutos,
      modoPreparo:modelo.preparo.map((passo, indice) => (indice+1) + '. ' + passo).join('\n\n'),
      config:{}, padrao:true, criadoEm:data, atualizadoEm:data
    });
    adicionada = true;
  }

  // Impede ressuscitar a receita após exclusão ou alteração voluntária.
  localStorage.setItem(chaveInstalacao, '1');
  if (adicionada) {
    salvarReceitasGerenciaveis();
    renderReceitasGerenciaveis();
  }
}

document.addEventListener('DOMContentLoaded', inicializarPudimGrandeNatal);
