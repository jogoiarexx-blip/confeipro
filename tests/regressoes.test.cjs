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
