import { test } from 'uvu';
import * as esprima from 'esprima';
import * as assert from 'uvu/assert';
// kalo ESM, harus ada embel-embel .js nya, path nya harus lengkap
// bahkan kalo import index, nggak bisa /src/services/eval
// tapi harus /src/services/eval/index.js
import { isAllowed, safeEval } from '../src/services/eval/parser.js';
import { resolveStocks } from '../src/services/eval/superpowers.js';

test('should do something', async () => {
  const result = await safeEval('1+1');
  assert.equal(result, '2');
});

test('should split a family lol', async () => {
  const result = await safeEval(`[...'👨‍👩‍👧‍👦']`);
  assert.equal(result, '["👨","‍","👩","‍","👧","‍","👦"]');
});

test('should be racist', async () => {
  const result = await safeEval(`Array.from('👦🏾')`);
  assert.equal(result, '["👦","🏾"]');
});

test('should be able to map array', async () => {
  const result = await safeEval(`[].map(x => x)`);
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

test('should be able to serialize BigInt', async () => {
  const result = await safeEval('BigInt(1)');
  assert.equal(result, '"1n"');
});

test('should be able to serialize string', async () => {
  const result = await safeEval('"foo"');
  assert.equal(result, '"foo"');
});

test('should throw error when evaluating 0n because of esprima bug', async () => {
  const result = await safeEval('0n');
  assert.equal(result, 'Error: Unexpected token ILLEGAL at 1:1');
});

test('should not be able to evaluate require', async () => {
  const result = await safeEval('require("fs")');
  assert.equal(result, 'Tidak boleh mengakses require');
});

test('should be able to serialize NaN', async () => {
  const result = await safeEval('parseInt("a")');
  assert.equal(result, '"NaN"');
});

test('should be able to serialize Infinity', async () => {
  const result = await safeEval('1/0');
  assert.equal(result, '"Infinity"');
});

test('should not be able to access String.repeat', async () => {
  const result = await safeEval('"a".repeat(10)');
  assert.equal(result, 'Tidak boleh mengakses repeat');
});

test('should be able to use local in arrow function', async () => {
  const result = await safeEval('["a", "b"].map(x => x.toUpperCase())');
  assert.equal(result, '["A","B"]');
});

test('should not be able to access property of identifiers that are not whitelisted', async () => {
  const result = await safeEval('foo.toString()');
  assert.equal(result, 'Tidak boleh mengakses foo');
});

test('should not be able to access properties that are not whitelisted', async () => {
  const result = await safeEval('Math.clamp(1, 2, 3)');
  assert.equal(result, 'Tidak boleh mengakses Math.clamp');
});

test('should not be able to use functions that are not whitelisted in HOF', async () => {
  const result = await safeEval('["100"].map(Math.clamp)');
  assert.equal(result, 'Tidak boleh mengakses Math.clamp');
});

test('should not be able to use disallowed expression in string template', async () => {
  const result = await safeEval('`${foo.toString()}`');
  assert.equal(result, 'Tidak boleh mengakses foo');
});

test('should not be able to declare method in object notation', async () => {
  const result = await safeEval('({foo(){}})');
  assert.equal(result, 'Tidak boleh membuat function di dalam object');
});

test('should not be able to declare accessor in object notation', async () => {
  const result = await safeEval('({get foo() { return 1; }})');
  assert.equal(result, 'Tidak boleh mengevaluasi FunctionExpression');
});

test('should be able to evaluate ternary expression', async () => {
  const result = await safeEval('true ? 1 : 0');
  assert.equal(result, '1');
});

test('should be able to evaluate unary expression', async () => {
  const result = await safeEval('+"1"');
  assert.equal(result, '1');
});

test('should be able to create new Date', async () => {
  const result = await safeEval('new Date().getFullYear()');
  assert.equal(result, new Date().getFullYear().toString());
});

test('should not be able to use isAllowed with no argument', () => {
  const result = isAllowed();
  assert.equal(result, false);
});

test('should not be able to evaluate empty string', async () => {
  const result = await safeEval('');
  assert.equal(result, 'Tidak bisa mengevaluasi code');
});

test('should be able to evaluate sequence expression', async () => {
  const result = await safeEval('(1, 2, 3)');
  assert.equal(result, '3');
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

test('should not be able to create instance using member access expression', async () => {
  const result = await safeEval('new foo.bar()');
  assert.equal(result, 'New expression hanya boleh menggunakan symbol yang jelas');
});

test('should not be able to create instance of classes that are not whitelisted', async () => {
  const result = await safeEval('new Crypto()');
  assert.equal(result, 'Tidak boleh new Crypto');
});

test('should not be able to declare property using computed expression', async () => {
  const result = await safeEval('({["foo"]: "bar"})');
  assert.equal(result, 'Tidak boleh membuat property menggunakan accessor');
});

test('should execute superpowers before eval', async () => {
  const result = await safeEval('1', [
    async function (source) {
      return source + '+1';
    },
  ]);
  assert.equal(result, '2');
});

test('should not be able to evaluate ASII without dollar sign', async () => {
  let result;
  try {
    result = await safeEval('ASII', [resolveStocks]);
  } catch (error) {
    result = error;
  }
  assert.equal(result, 'Tidak boleh mengakses ASII');
});

test('should not be able to evaluate more than 3 cashtags', async () => {
  let result;
  try {
    result = await safeEval('$ASII + $BBCA + $GGRM + $TLKM', [resolveStocks]);
  } catch (error) {
    result = error;
  }
  assert.equal(result, 'Terlalu banyak kode saham');
});

// test('should be able to evaluate $ASPI-W', async () => {
//   let result;
//   try {
//     result = await safeEval('$ASPI-W', [resolveStocks]);
//   } catch (error) {
//     result = error;
//   }
//   assert.equal(isNaN(parseInt(result)), false);
// });

// test('should be able to evaluate $BBCA.name', async () => {
//   let result;
//   try {
//     result = await safeEval('$BBCA.name.length', [resolveStocks]);
//   } catch (error) {
//     result = error;
//   }
//   assert.equal(result, '29');
// });

// test('should be able to evaluate $BTCIDR', async () => {
//   let result;
//   try {
//     result = await safeEval('$BTCIDR', [resolveCryptoCurrencies]);
//   } catch (error) {
//     result = error;
//   }
//   assert.equal(typeof result, 'string');
//   const price = parseFloat(result);
//   assert.equal(isNaN(price), false);
// });

// test('should be able to evaluate $USDIDR', async () => {
//   let result;
//   try {
//     result = await safeEval('$USDIDR', [resolveCurrencyRates]);
//   } catch (error) {
//     result = error;
//   }
//   assert.equal(typeof result, 'string');
//   const rate = parseFloat(result);
//   assert.equal(isNaN(rate), false);
// });

test.run();
