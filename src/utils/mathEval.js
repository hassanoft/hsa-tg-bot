// Évaluateur d'expressions mathématiques sûr (sans eval()).
// Supporte : + - * / % ^ ( ) et nombres décimaux, priorité des opérateurs.

const TOKEN_REGEX = /\s*([()+\-*/%^]|\d+\.?\d*)\s*/g;

function tokenize(expr) {
  const tokens = [];
  let match;
  let lastIndex = 0;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(expr)) !== null) {
    if (match.index !== lastIndex) throw new Error('Expression invalide.');
    tokens.push(match[1]);
    lastIndex = TOKEN_REGEX.lastIndex;
  }
  if (lastIndex !== expr.length) throw new Error('Caractère invalide dans l\'expression.');
  return tokens;
}

const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
const RIGHT_ASSOC = new Set(['^']);

function toRPN(tokens) {
  const output = [];
  const ops = [];
  let prevToken = null;

  for (const token of tokens) {
    if (!Number.isNaN(Number(token))) {
      output.push(Number(token));
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop());
      if (!ops.length) throw new Error('Parenthèses non équilibrées.');
      ops.pop();
    } else if (PRECEDENCE[token]) {
      // gestion du moins unaire
      if (token === '-' && (prevToken === null || prevToken === '(' || PRECEDENCE[prevToken])) {
        output.push(0);
      }
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        (PRECEDENCE[ops[ops.length - 1]] > PRECEDENCE[token] ||
          (PRECEDENCE[ops[ops.length - 1]] === PRECEDENCE[token] && !RIGHT_ASSOC.has(token)))
      ) {
        output.push(ops.pop());
      }
      ops.push(token);
    } else {
      throw new Error('Token inconnu.');
    }
    prevToken = token;
  }

  while (ops.length) {
    const op = ops.pop();
    if (op === '(') throw new Error('Parenthèses non équilibrées.');
    output.push(op);
  }

  return output;
}

function evalRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (typeof token === 'number') {
      stack.push(token);
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) throw new Error('Expression invalide.');
    switch (token) {
      case '+': stack.push(a + b); break;
      case '-': stack.push(a - b); break;
      case '*': stack.push(a * b); break;
      case '/':
        if (b === 0) throw new Error('Division par zéro.');
        stack.push(a / b);
        break;
      case '%': stack.push(a % b); break;
      case '^': stack.push(a ** b); break;
      default: throw new Error('Opérateur inconnu.');
    }
  }
  if (stack.length !== 1) throw new Error('Expression invalide.');
  return stack[0];
}

export function safeEvaluate(expression) {
  const cleaned = String(expression).trim();
  if (!cleaned) throw new Error('Expression vide.');
  if (cleaned.length > 200) throw new Error('Expression trop longue.');
  const tokens = tokenize(cleaned);
  const rpn = toRPN(tokens);
  return evalRPN(rpn);
}
