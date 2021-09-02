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

test('should be able to serialize NaN', () => {
  const result = safeEval('parseInt("a")');
  assert.equal(result, '"NaN"');
});

test('should be able to serialize Infinity', () => {
  const result = safeEval('1/0');
  assert.equal(result, '"Infinity"');
});

test('should not be able to access String.repeat', () => {
  const result = safeEval('"a".repeat(10)');
  assert.equal(result, 'Tidak boleh mengakses repeat');
});

test('should be able to use local in arrow function', () => {
  const result = safeEval('["a", "b"].map(x => x.toUpperCase())');
  assert.equal(result, '["A","B"]');
});

test('should not be able to access property of identifiers that are not whitelisted', () => {
  const result = safeEval('foo.toString()');
  assert.equal(result, 'Tidak boleh mengakses foo');
});

test('should not be able to access properties that are not whitelisted', () => {
  const result = safeEval('Math.clamp(1, 2, 3)');
  assert.equal(result, 'Tidak boleh mengakses Math.clamp');
});

test('should not be able to use functions that are not whitelisted in HOF', () => {
  const result = safeEval('["100"].map(Math.clamp)');
  assert.equal(result, 'Tidak boleh mengakses Math.clamp');
});

test('should not be able to use disallowed expression in string template', () => {
  const result = safeEval('`${foo.toString()}`');
  assert.equal(result, 'Tidak boleh mengakses foo');
});

test('should not be able to declare method in object notation', () => {
  const result = safeEval('({foo(){}})');
  assert.equal(result, 'Tidak boleh membuat function di dalam object');
});

test('should not be able to declare accessor in object notation', () => {
  const result = safeEval('({get foo() { return 1; }})');
  assert.equal(result, 'Tidak boleh mengevaluasi FunctionExpression');
});

test('should be able to evaluate ternary expression', () => {
  const result = safeEval('true ? 1 : 0');
  assert.equal(result, '1');
});

test('should be able to evaluate unary expression', () => {
  const result = safeEval('+"1"');
  assert.equal(result, '1');
});

test('should be able to create new Date', () => {
  const result = safeEval('new Date().getFullYear()');
  assert.equal(result, new Date().getFullYear().toString());
});

test('should not be able to use isAllowed with no argument', () => {
  const result = isAllowed();
  assert.equal(result, false);
});

test('should not be able to evaluate empty string', () => {
  const result = safeEval('');
  assert.equal(result, 'Tidak bisa mengevaluasi code');
});

test('should not be able to pass module ast into isAllowed', () => {
  let result;
  try {
    result = isAllowed(esprima.parseModule(''));
  } catch (error) {
    result = error;
  }
  assert.equal(result, 'Bukan program Javascript');
});

test('should not be able to create instance using member access expression', () => {
  const result = safeEval('new foo.bar()');
  assert.equal(result, 'New expression hanya boleh menggunakan symbol yang jelas');
});

test('should not be able to create instance of classes that are not whitelisted', () => {
  const result = safeEval('new Crypto()');
  assert.equal(result, 'Tidak boleh new Crypto');
});

test('should not be able to declare property using computed expression', () => {
  const result = safeEval('({["foo"]: "bar"})');
  assert.equal(result, 'Tidak boleh membuat property menggunakan accessor');
});

test.run();
