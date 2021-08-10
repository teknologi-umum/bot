import { test } from 'uvu';
import * as assert from 'uvu/assert';
// kalo ESM, harus ada embel-embel .js nya, path nya harus lengkap
// bahkan kalo import index, nggak bisa /src/services/eval
// tapi harus /src/services/eval/index.js
import { isAllowed, safeEval } from '../src/services/eval/parser.js';

test('should do something', () => {
  const result = safeEval('1+1');
  assert.equal(result, '2');
});

test('should split a family lol', () => {
  const result = safeEval(`[...'👨‍👩‍👧‍👦']`);
  assert.equal(result, '["👨","‍","👩","‍","👧","‍","👦"]');
});

test('should be racist', () => {
  const result = safeEval(`Array.from('👦🏾')`);
  assert.equal(result, '["👦","🏾"]');
});

test('should be able to map array', () => {
  const result = safeEval(`[].map(x => x)`);
  assert.equal(result, '[]');
});

test('binary operators are allowed', () => {
  const result = [
    '+',
    '&',
    '|',
    '^',
    '/',
    '==',
    '**',
    '>=',
    '>',
    'in',
    '!=',
    '<<',
    '<=',
    '<',
    '&&',
    '||',
    '*',
    '%',
    '>>',
    '===',
    '!==',
    '-',
    '>>>',
  ].every((op) => isAllowed(`0 ${op} 0`));
  assert.is(result, true);
});

test('should not be able to access unlisted member', () => {
  const allowed = isAllowed('[].constructor');
  assert.is(allowed, false);
});

test.run();
