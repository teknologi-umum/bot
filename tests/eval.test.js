import { test } from 'uvu';
import * as esprima from 'esprima';
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
  ].every((op) => {
    try {
      return isAllowed(esprima.parse(`0 ${op} 0`));
    } catch {
      return false;
    }
  });
  assert.is(result, true);
});

test('should not be able to access unlisted member', () => {
  let allowed;
  try {
    allowed = isAllowed(esprima.parse('[].constructor'));
  } catch {
    allowed = false;
  }
  assert.is(allowed, false);
});

test('should be able to serialize BigInt', () => {
  const result = safeEval('BigInt(1)');
  assert.equal(result, '"1n"');
});

test('should be able to serialize string', () => {
  const result = safeEval('"foo"');
  assert.equal(result, '"foo"');
});

test('should throw error when evaluating 0n because of esprima bug', () => {
  const result = safeEval('0n');
  assert.equal(result, 'Error: Unexpected token ILLEGAL at 1:1');
});

test('should not be able to evaluate require', () => {
  const result = safeEval('require("fs")');
  assert.equal(result, 'Tidak boleh mengakses require');
});

test.run();
