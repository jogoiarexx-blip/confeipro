const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function contexto(arquivos, extra={}) {
  const c=vm.createContext({URLSearchParams, Date, console,
    localStorage:{getItem:()=>null}, document:{addEventListener(){}},
    window:{addEventListener(){},location:{search:''}}, navigator:{}, ...extra});
  for(const f of arquivos) vm.runInContext(fs.readFileSync(f,'utf8'),c);
  return c;
}
test('URL sem tab abre Início; atalhos válidos são preservados',()=>{
  const c=contexto(['js/app.js'],{goTab:i=>c.aba=i});
  for(const [query,expected] of [['',3],['?tab=0',0],['?tab=2',2],['?tab=',3],['?tab=abc',3],['?tab=8',3]]) {
    c.window.location.search=query; c.aplicarAtalhoDaURL(); assert.equal(c.aba,expected,query);
  }
});
function estoque(baixado=false) {
  const c=contexto(['js/utils.js','js/gestao.js']);
  vm.runInContext(`let ingredientes=[{nome:'Farinha',unidade:'g',estoqueQtd:100,estoqueMin:0}];
    let produtos=[{id:'p1',rendimento:12,massa:[{nome:'Farinha',qtd:240,unidade:'g'}]}];
    let pedidos=[{id:'v1',produtoId:'p1',quantidade:3,status:'confirmado',estoqueBaixado:${baixado}}];`,c);
  for(const f of ['salvarIng','salvarPedidos','renderIngredientes','renderPedidos','renderEstoqueResumo','gerarListaCompras','atualizarDashboard','toast']) c[f]=()=>{};
  return c;
}
test('lista de compras usa a fração do rendimento vendida',()=>{
  const c=estoque();
  vm.runInContext('ingredientes[0].estoqueQtd=0',c);
  assert.equal(c.calcularListaCompras()[0].requerido,60);
});
test('pedido com baixa feita não volta à lista de compras',()=>{
  const c=estoque(true); assert.equal(c.calcularListaCompras().length,0);
});
test('baixa de 3 porções de 12 usa 60g, não 720g; segunda baixa não repete',()=>{
  const c=estoque(); c.baixarEstoquePedido('v1');
  assert.equal(vm.runInContext('ingredientes[0].estoqueQtd',c),40);
  c.baixarEstoquePedido('v1');
  assert.equal(vm.runInContext('ingredientes[0].estoqueQtd',c),40);
});
test('backup em kg converte também estoque e mínimo para gramas',()=>{
  const c=contexto(['js/utils.js','js/dashboard.js']);
  const ing=c.validarIngredientesBackup([{nome:'Farinha',precoTotal:10,qtdTotal:1,unidade:'kg',estoqueQtd:2,estoqueMin:0.5}]).validos[0];
  assert.equal(ing.qtdTotal,1000); assert.equal(ing.estoqueQtd,2000); assert.equal(ing.estoqueMin,500);
});
test('compras somam pedidos pendentes, ignoram cancelados e respeitam mínimo',()=>{
  const c=estoque();
  vm.runInContext(`ingredientes[0].estoqueMin=150; pedidos.push({produtoId:'p1',quantidade:12,status:'cancelado'});`,c);
  assert.equal(c.calcularListaCompras()[0].comprar,50);
});
test('rendimento ausente mantém compatibilidade com receita de uma unidade',()=>{
  const c=estoque(); vm.runInContext('delete produtos[0].rendimento',c);
  assert.equal(c.calcularListaCompras()[0].requerido,720);
});
test('backup em litros converte estoque para ml',()=>{
  const c=contexto(['js/utils.js','js/dashboard.js']);
  const ing=c.validarIngredientesBackup([{nome:'Leite',precoTotal:6,qtdTotal:1,unidade:'L',estoqueQtd:1.5,estoqueMin:0.25}]).validos[0];
  assert.equal(ing.estoqueQtd,1500); assert.equal(ing.estoqueMin,250);
});
test('worker entrega HTML e scripts da mesma versão, sem buscar nova cópia na rede',async()=>{
  const handlers={}; let rede=0;
  const cache={match:async key=>({body:key.includes('app.js')?'script v22':'html v22'})};
  contexto(['service-worker.js'],{URL, self:{location:{href:'https://example.com/confeipro/service-worker.js',origin:'https://example.com'}, addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>cache}, fetch:()=>{rede++;throw Error('sem rede');}});
  for(const [url,mode,body] of [['https://example.com/confeipro/?tab=2','navigate','html v22'],['https://example.com/confeipro/js/app.js','cors','script v22']]) {
    let resposta; handlers.fetch({request:{url,mode,method:'GET'},respondWith:p=>resposta=p});
    assert.equal((await resposta).body,body);
  }
  assert.equal(rede,0);
});


test('V2.5: orçamento e pedido cancelado não compõem o financeiro', () => {
  const c=contexto(['js/utils.js','js/dashboard.js']);
  const resumo=c.calcularResumoFinanceiro([
    {status:'orcamento',valor:1000,sinal:500},
    {status:'cancelado',valor:999,sinal:999},
    {status:'confirmado',valor:200,sinal:50},
    {status:'entregue',valor:150,sinal:150}
  ]);
  assert.equal(resumo.vendido,350);
  assert.equal(resumo.recebido,200);
  assert.equal(resumo.receber,150);
  assert.equal(resumo.quitados,1);
  assert.equal(resumo.quantidade,2);
});
test('V2.5: pagamentos excedentes e valores inconsistentes não geram recebimento maior que venda', () => {
  const c=contexto(['js/utils.js','js/dashboard.js']);
  const resumo=c.calcularResumoFinanceiro([
    {status:'confirmado',valor:50,sinal:100},
    {status:'producao',valor:25,sinal:-10},
    {status:'pronto',valor:0,sinal:20}
  ]);
  assert.equal(resumo.vendido,75);
  assert.equal(resumo.recebido,50);
  assert.equal(resumo.receber,25);
  assert.equal(resumo.quitados,1);
});


test('V2.6: pasta Natal preserva receitas antigas e permite mover receitas salvas', () => {
  const memoria = new Map([['cpReceitasGerenciaveis', JSON.stringify([{id:'r1',nome:'Bolo antigo',itens:[],porcoes:1}])]]);
  const elementos = {
    listaReceitasGerenciaveis:{innerHTML:''},
    listaReceitasProntas:{style:{}},
    modelosOriginaisDivider:{style:{}},
    pesquisaReceita:{value:''},
    semReceitasEncontradas:{style:{},textContent:''},
    qtdReceitasNatal:{textContent:''},
    qtdReceitasProntas:{textContent:''}
  };
  const c = contexto(['js/receita.js'], {
    localStorage:{getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)},
    document:{addEventListener(){},getElementById:id=>elementos[id]||null,querySelectorAll:()=>[]},
    escapeHtml:x=>String(x),toast:()=>{}
  });
  assert.equal(c.pastaDaReceita({nome:'Antiga'}), 'geral');
  c.alterarPastaReceitaGerenciavel('r1','natal');
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis'))[0].pasta,'natal');
  assert.equal(elementos.qtdReceitasNatal.textContent,1);
  assert.match(elementos.listaReceitasGerenciaveis.innerHTML,/data-recipe-pasta="natal"/);
  c.alterarPastaReceitaGerenciavel('r1','geral');
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis'))[0].pasta,'geral');
  assert.equal(elementos.qtdReceitasNatal.textContent,0);
});


test('V2.7: alterna o tema com um toque e mantém a escolha salva', () => {
  const memoria = new Map();
  const quick = {textContent:'',title:'',setAttribute(k,v){this[k]=v;}};
  const botoes = ['light','dark'].map(choice => ({dataset:{themeChoice:choice},classList:{toggle(k,v){this[k]=v;}},setAttribute(k,v){this[k]=v;}}));
  const meta = {setAttribute(k,v){this[k]=v;}};
  const html = {atributos:{'data-theme':'dark'},getAttribute(k){return this.atributos[k];},setAttribute(k,v){this.atributos[k]=v;}};
  const c = contexto(['js/tema.js'], {
    document:{documentElement:html,addEventListener(){},getElementById:k=>k==='mobileThemeQuick'?quick:null,
      querySelectorAll:()=>botoes,querySelector:()=>meta},
    localStorage:{getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)}
  });
  c.aplicarTema('dark');
  assert.equal(quick.textContent,'☀ Modo claro');
  c.alternarTema();
  assert.equal(memoria.get('cpTema'),'light');
  assert.equal(html.getAttribute('data-theme'),'light');
  assert.equal(quick.textContent,'🌙 Modo escuro');
  assert.equal(meta.content,'#FFF8F0');
  c.alternarTema();
  assert.equal(memoria.get('cpTema'),'dark');
  assert.equal(quick.textContent,'☀ Modo claro');
});


test('V2.8: notificações somem sozinhas e podem ser fechadas manualmente', () => {
  const timers = [];
  const cancelados = new Set();
  let idAtual = 0;
  const el = {
    innerHTML:'',className:'toast',
    classList:{remove(nome) { el.className=el.className.split(' ').filter(x=>x!==nome).join(' '); }}
  };
  const c = contexto(['js/utils.js'], {
    document:{getElementById:k=>k==='toast'?el:null},
    setTimeout:(fn,delay)=>{const id=++idAtual;timers.push({id,fn,delay});return id;},
    clearTimeout:id=>cancelados.add(id)
  });
  c.toast('🌙 Tema escuro ativado');
  assert.equal(el.className.includes('show'),true);
  assert.match(el.innerHTML,/Fechar notificação/);
  assert.equal(timers[0].delay,2600);
  timers[0].fn();
  assert.equal(el.className.includes('show'),false);
  c.toast('☀ Tema claro ativado');
  c.fecharToast();
  assert.equal(el.className.includes('show'),false);
  assert.ok(cancelados.has(timers[1].id));
});

test('V2.8: novo aviso substitui anterior e mantém Desfazer funcionando', () => {
  const timers=[];const cancelados=new Set();let id=0;
  const el={innerHTML:'',className:'toast',classList:{remove:n=>{el.className=el.className.replace(' '+n,'');}}};
  const c=contexto(['js/utils.js'],{
    document:{getElementById:()=>el},
    setTimeout:(fn,delay)=>{timers.push({id:++id,fn,delay});return id;},
    clearTimeout:x=>cancelados.add(x)
  });
  let desfez=false;
  c.toast('Excluir',null,()=>{desfez=true;});
  assert.equal(timers[0].delay,5000);
  c.toast('Nova mensagem');
  assert.ok(cancelados.has(timers[0].id));
  c.toast('Excluir novamente',null,()=>{desfez=true;});
  c._toastAcionarDesfazer();
  assert.equal(desfez,true);
  assert.equal(el.className.includes('show'),false);
});


test('V2.9: 12 receitas natalinas são instaladas uma única vez sem apagar as antigas', () => {
  const memoria=new Map([['cpReceitasBibliotecaInicializada','1']]);
  const elem={innerHTML:'',style:{}};
  const el={getElementById:()=>elem,addEventListener(){},querySelectorAll:()=>[]};
  const localStorage={getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)};
  const c=contexto(['js/utils.js','js/receita.js','js/receitas-natal.js'],{document:el,localStorage});
  vm.runInContext("let receita=[];let ingredientes=[{nome:'Farinha de trigo',unidade:'g',precoTotal:6,qtdTotal:1000}];receitasGerenciaveis.push({id:'minha_receita',nome:'Minha receita',itens:[]});",c);
  c.inicializarReceitasNatal();
  let todas=JSON.parse(memoria.get('cpReceitasGerenciaveis'));
  assert.equal(todas.filter(r=>r.pasta==='natal').length,12);
  assert.equal(todas.find(r=>r.id==='minha_receita').nome,'Minha receita');
  assert.ok(todas.every(r=>r.id==='minha_receita'||r.modoPreparo));
  assert.ok(todas.find(r=>r.id==='rec_natal_panetone').itens.some(i=>i.nome==='Frutas cristalizadas'&&i.custo===0));
  c.inicializarReceitasNatal();
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis')).length,13);
});

test('V2.9: ingredientes sem preço impedem preço de venda incompleto', () => {
  const c=contexto(['js/utils.js','js/receita.js'],{
    localStorage:{getItem:()=>null},
    document:{addEventListener(){},getElementById:()=>null}
  });
  let aviso='';
  c.toast=mensagem=>aviso=mensagem;
  vm.runInContext("let receita=[{nome:'Frutas cristalizadas',qtd:150,unidade:'g',custo:0}];let ingredientes=[];",c);
  c.calcularFinal();
  assert.match(aviso,/Cadastre os ingredientes/);
});


test('Pudim grande da imagem: atualiza instalações existentes sem mudar o pudim antigo', () => {
  const antiga = {
    id:'rec_natal_pudim', nome:'🍮 Pudim natalino de leite condensado',
    pasta:'natal', itens:[{nome:'Leite condensado',qtd:390,unidade:'g',custo:0}]
  };
  const memoria=new Map([
    ['cpReceitasNatal2026Inicializadas','1'],
    ['cpReceitasGerenciaveis',JSON.stringify([
      antiga,{id:'minha_receita',nome:'Receita pessoal',pasta:'geral',itens:[]}
    ])]
  ]);
  const el={getElementById:()=>({innerHTML:'',style:{}}),addEventListener(){},querySelectorAll:()=>[]};
  const localStorage={getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)};
  const c=contexto(['js/utils.js','js/receita.js','js/receitas-natal.js'],{document:el,localStorage});
  vm.runInContext("let receita=[];let ingredientes=[{nome:'Leite condensado',unidade:'g',precoTotal:8,qtdTotal:395}];",c);
  c.inicializarReceitasNatal(); // catálogo antigo já estava instalado
  c.inicializarPudimGrandeNatal();

  const todas=JSON.parse(memoria.get('cpReceitasGerenciaveis'));
  assert.equal(todas.length,3);
  assert.equal(todas.find(r=>r.id==='rec_natal_pudim').itens[0].qtd,390);
  assert.equal(todas.find(r=>r.id==='minha_receita').nome,'Receita pessoal');

  const pudim=todas.find(r=>r.id==='rec_natal_pudim-grande-1100ml');
  assert.ok(pudim);
  assert.equal(pudim.pasta,'natal');
  assert.match(pudim.unidadeRendimento,/1,1 L/);
  assert.equal(pudim.itens.length,5);
  assert.deepEqual(pudim.itens.map(i=>i.qtd),[790,600,5,150,80]);
  assert.deepEqual(pudim.itens.map(i=>i.unidade),['g','ml','unidade','g','ml']);
  assert.ok(pudim.itens[0].custo > 0);
  assert.equal(pudim.itens[1].custo,0); // sem cadastro, nunca inventar preço
  assert.match(pudim.modoPreparo,/Modo de preparo sugerido/);

  c.inicializarPudimGrandeNatal();
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis')).length,3);
  assert.equal(memoria.get('cpReceitaPudimGrandeNatal2026Inicializada'),'1');
});

test('Pudim grande: não é restaurado depois de exclusão voluntária', () => {
  const memoria=new Map([['cpReceitasNatal2026Inicializadas','1']]);
  const el={getElementById:()=>({innerHTML:'',style:{}}),addEventListener(){},querySelectorAll:()=>[]};
  const localStorage={getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)};
  const c=contexto(['js/utils.js','js/receita.js','js/receitas-natal.js'],{document:el,localStorage});
  vm.runInContext("let receita=[];let ingredientes=[];",c);
  c.inicializarPudimGrandeNatal();
  vm.runInContext("receitasGerenciaveis.length=0;",c);
  c.salvarReceitasGerenciaveis();
  c.inicializarPudimGrandeNatal();
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis')).length,0);
});


test('Pudim pequeno: usa 395g + 395ml + 3 ovos e mantém grande e anterior', () => {
  const grandes=[
    {id:'rec_natal_pudim',nome:'Pudim anterior',itens:[{nome:'Leite condensado',qtd:390}]},
    {id:'rec_natal_pudim-grande-1100ml',nome:'Pudim grande',itens:[{nome:'Leite condensado',qtd:790}]},
    {id:'usuario',nome:'Minha receita',pasta:'geral',itens:[]}
  ];
  const memoria=new Map([
    ['cpReceitasNatal2026Inicializadas','1'],
    ['cpReceitaPudimGrandeNatal2026Inicializada','1'],
    ['cpReceitasGerenciaveis',JSON.stringify(grandes)]
  ]);
  const el={getElementById:()=>({innerHTML:'',style:{}}),addEventListener(){},querySelectorAll:()=>[]};
  const localStorage={getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)};
  const c=contexto(['js/utils.js','js/receita.js','js/receitas-natal.js'],{document:el,localStorage});
  vm.runInContext("let receita=[];let ingredientes=[{nome:'Leite condensado',unidade:'g',precoTotal:8,qtdTotal:395}];",c);
  c.inicializarPudimPequenoNatal();
  const atual=JSON.parse(memoria.get('cpReceitasGerenciaveis'));
  assert.equal(atual.length,4);
  assert.equal(atual.find(r=>r.id==='rec_natal_pudim').itens[0].qtd,390);
  assert.equal(atual.find(r=>r.id==='rec_natal_pudim-grande-1100ml').itens[0].qtd,790);
  const pequeno=atual.find(r=>r.id==='rec_natal_pudim-pequeno-395g-395ml');
  assert.ok(pequeno);
  assert.equal(pequeno.pasta,'natal');
  assert.deepEqual(pequeno.itens.map(i=>i.qtd),[395,395,3,100,50]);
  assert.deepEqual(pequeno.itens.map(i=>i.unidade),['g','ml','unidade','g','ml']);
  assert.match(pequeno.modoPreparo,/apenas uma sugestão/);
  assert.equal(pequeno.itens[1].custo,0); // não inventar preço sem cadastro
  c.inicializarPudimPequenoNatal();
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis')).length,4);
  assert.equal(memoria.get('cpReceitaPudimPequenoNatal2026Inicializada'),'1');
});

test('Pudim pequeno: exclusão permanece após reiniciar', () => {
  const memoria=new Map([
    ['cpReceitasNatal2026Inicializadas','1'],
    ['cpReceitaPudimGrandeNatal2026Inicializada','1']
  ]);
  const el={getElementById:()=>({innerHTML:'',style:{}}),addEventListener(){},querySelectorAll:()=>[]};
  const localStorage={getItem:k=>memoria.get(k)||null,setItem:(k,v)=>memoria.set(k,v)};
  const c=contexto(['js/utils.js','js/receita.js','js/receitas-natal.js'],{document:el,localStorage});
  vm.runInContext("let receita=[];let ingredientes=[];",c);
  c.inicializarPudimPequenoNatal();
  vm.runInContext("receitasGerenciaveis.length=0;",c);
  c.salvarReceitasGerenciaveis();
  c.inicializarPudimPequenoNatal();
  assert.equal(JSON.parse(memoria.get('cpReceitasGerenciaveis')).length,0);
});
