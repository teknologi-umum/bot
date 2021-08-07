import { test } from 'uvu';
import * as assert from 'uvu/assert';
// kalo ESM, harus ada embel-embel .js nya, path nya harus lengkap
// bahkan kalo import index, nggak bisa /src/services/eval
// tapi harus /src/services/eval/index.js
import { safeEval } from '../src/services/eval/parser.js';

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

test.run();
