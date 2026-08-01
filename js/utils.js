// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
// Funções pequenas usadas por praticamente todos os outros arquivos.
// Por isso este arquivo precisa ser carregado ANTES dos demais
// (veja a ordem dos <script> no index.html).
function arred(v) { return Math.round(v * 100) / 100; }
function fmt(v)   { return `R$ ${arred(v).toFixed(2).replace('.', ',')}`; }
function norm(s)  { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

// Nome de ingrediente/produto/cliente é digitado pelo usuário e vai
// parar dentro de innerHTML em vários lugares (listas, chips, toasts).
// Sem isso, digitar um "<" sem querer bagunça a tela inteira.
// Use SEMPRE que for jogar texto do usuário dentro de innerHTML.
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Normaliza kg → g e L → ml. O app SEMPRE guarda e calcula ingredientes
// nessa unidade "base" — kg e L continuam disponíveis no formulário só
// como conveniência de digitação (comprou 1kg, digita 1kg), mas o valor
// salvo já vira gramas/mililitros. Isso evita o erro clássico de cadastrar
// em kg e depois usar na receita pensando em gramas: sem essa conversão,
// "240" seria interpretado como 240kg e o custo saía 1000x maior.
function normalizarUnidade(qtd, unidade) {
  if (unidade === 'kg') return { qtd: Math.round(qtd * 1000 * 100) / 100, unidade: 'g' };
  if (unidade === 'L')  return { qtd: Math.round(qtd * 1000 * 100) / 100, unidade: 'ml' };
  return { qtd, unidade };
}

// Lê um campo numérico do formulário e nunca deixa passar valor negativo
// (ex: digitar "-5" em horas trabalhadas pra reduzir o custo artificialmente).
// O <input min="0"> do HTML não bloqueia isso sozinho porque o app nunca
// chama a validação nativa do navegador antes de ler o .value.
function numNaoNegativo(valor, padrao) {
  const n = parseFloat(valor);
  if (isNaN(n) || n < 0) return padrao || 0;
  return n;
}

function custoPorUnidade(ing) {
  // Não arredondar aqui: ingredientes baratos por unidade (ex: açúcar,
  // R$18/5000g = R$0,0036/g) ficariam com custo 0 se arredondássemos
  // pra centavos antes de multiplicar pela quantidade usada.
  // O arredondamento pra centavos acontece só no valor final em R$
  // (onde já é feito com arred() em cada lugar que usa esta função).
  return ing.precoTotal / ing.qtdTotal;
}

// Depende do array `ingredientes` (definido em dados.js), mas só é
// CHAMADA depois que dados.js já rodou — então a ordem de carregamento
// continua funcionando mesmo com a variável ainda não declarada aqui.
function buscarIngrediente(nomeAlvo) {
  const alvo = norm(nomeAlvo);
  let f = ingredientes.find(ing => norm(ing.nome) === alvo);
  if (f) return f;
  f = ingredientes.find(ing => alvo.startsWith(norm(ing.nome)));
  if (f) return f;
  f = ingredientes.find(ing => alvo.includes(norm(ing.nome)) || norm(ing.nome).includes(alvo));
  return f || null;
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
// toast(msg, tipo, desfazer) — passe uma função em `desfazer` para
// mostrar um botão "Desfazer" no toast (usado nas exclusões, no lugar
// do confirm() do navegador). O toast fica mais tempo na tela nesse caso,
// pra dar tempo de clicar.
let _toastTimer;
let _toastDesfazerFn = null;

function toast(msg, tipo, desfazer) {
  const el = document.getElementById('toast');
  _toastDesfazerFn = typeof desfazer === 'function' ? desfazer : null;

  el.innerHTML = `<span>${escapeHtml(msg)}</span>` +
    (_toastDesfazerFn ? `<button type="button" class="toast-undo" onclick="_toastAcionarDesfazer()">Desfazer</button>` : '');
  el.className = 'toast show' +
    (tipo === 'err' ? ' err' : tipo === 'warn' ? ' warn' : '') +
    (_toastDesfazerFn ? ' has-undo' : '');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.remove('show');
    _toastDesfazerFn = null;
  }, _toastDesfazerFn ? 5000 : 2400);
}

function _toastAcionarDesfazer() {
  const fn = _toastDesfazerFn;
  _toastDesfazerFn = null;
  clearTimeout(_toastTimer);
  document.getElementById('toast').classList.remove('show');
  if (fn) fn();
}
