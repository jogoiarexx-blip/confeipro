// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
// Funções pequenas usadas por praticamente todos os outros arquivos.
// Por isso este arquivo precisa ser carregado ANTES dos demais
// (veja a ordem dos <script> no index.html).
function arred(v) { return Math.round(v * 100) / 100; }
function fmt(v)   { return `R$ ${arred(v).toFixed(2)}`; }
function norm(s)  { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

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
let _toastTimer;
function toast(msg, tipo) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (tipo === 'err' ? ' err' : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
