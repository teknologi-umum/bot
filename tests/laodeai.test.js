import { readFileSync } from 'fs';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';
import { stackoverflow } from '../src/services/laodeai/handlers/stackoverflow.js';
import { gist } from '../src/services/laodeai/handlers/gist.js';
import { wikipedia } from '../src/services/laodeai/handlers/wikipedia.js';
import { wikihow } from '../src/services/laodeai/handlers/wikihow.js';
import { stackexchange } from '../src/services/laodeai/handlers/stackexchange.js';
import { foodnetwork } from '../src/services/laodeai/handlers/foodnetwork.js';
import { knowyourmeme } from '../src/services/laodeai/handlers/knowyourmeme.js';
import { urbandictionary } from '../src/services/laodeai/handlers/urbandictionary.js';
import { bonappetit } from '#services/laodeai/handlers/bonappetit.js';
import { cookingNytimes } from '#services/laodeai/handlers/cooking_nytimes.js';
import { zeroclick } from '#services/laodeai/handlers/zeroclick.js';

const readFile = (path) => readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), path), { encoding: 'utf-8' });

test('should be able to parse a stackoverflow code output', () => {
  const file = readFile('./laodeai_fixture/stackoverflow_code.html');
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'image');
  assert.fixture(output.content, readFile('./laodeai_snapshot/stackoverflow_code'));
});

test('should be able to parse a stackoverflow text output', () => {
  const file = readFile('./laodeai_fixture/stackoverflow_text.html');
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/stackoverflow_text'));
});

test('should be able to output stackoverflow text if code is deemed too short', () => {
  const file = readFile('./laodeai_fixture/stackoverflow_next.html');
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/stackoverflow_next'));
});

test('should return error on empty stackoverflow html', () => {
  const html = cheerio.load('<body></body>');
  const output = stackoverflow(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse github gist code output', () => {
  const file = readFile('./laodeai_fixture/gist_code.html');
  const html = cheerio.load(file);
  const output = gist(html);

  assert.equal(output.type, 'image');
  assert.fixture(output.content, readFile('./laodeai_snapshot/gist_code'));
});

test('should be able to parse github gist markdown output', () => {
  const file = readFile('./laodeai_fixture/gist_markdown.html');
  const html = cheerio.load(file);
  const output = gist(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/gist_markdown'));
});

test('should return error on empty github gist html', () => {
  const html = cheerio.load('<body></body>');
  const output = gist(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse wikipedia output', () => {
  const file = readFile('./laodeai_fixture/wikipedia.html');
  const html = cheerio.load(file);
  const output = wikipedia(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/wikipedia'));
});

test('should return error on empty wikipedia html', () => {
  const html = cheerio.load('<body></body>');
  const output = wikipedia(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse wikihow output', () => {
  const file = readFile('./laodeai_fixture/wikihow.html');
  const html = cheerio.load(file);
  const output = wikihow(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/wikihow'));
});

test('should return error on empty wikihow html', () => {
  const html = cheerio.load('<body></body>');
  const output = wikihow(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse stackexchange output', () => {
  const file = readFile('./laodeai_fixture/stackexchange.html');
  const html = cheerio.load(file);
  const output = stackexchange(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/stackexchange'));
});

test('should return error on empty stackexchange html', () => {
  const html = cheerio.load('<body></body>');
  const output = stackexchange(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse foodnetwork output', () => {
  const file = readFile('./laodeai_fixture/foodnetwork.html');
  const html = cheerio.load(file);
  const output = foodnetwork(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/foodnetwork'));
});

test('should return error on empty foodnetwork html', () => {
  const html = cheerio.load('<body></body>');
  const output = foodnetwork(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse knowyourmeme output', () => {
  const file = readFile('./laodeai_fixture/knowyourmeme.html');
  const html = cheerio.load(file);
  const output = knowyourmeme(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/knowyourmeme'));
});

test('should return error on empty knowyourmeme html', () => {
  const html = cheerio.load('<body></body>');
  const output = knowyourmeme(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse urban dictionary output', () => {
  const file = readFile('./laodeai_fixture/urbandictionary.html');
  const html = cheerio.load(file);
  const output = urbandictionary(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/urbandictionary'));
});

test('should return error on empty urban dictionary html', () => {
  const html = cheerio.load('<body></body>');
  const output = urbandictionary(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse bonappetit output', () => {
  const file = readFile('./laodeai_fixture/bonappetit.html');
  const html = cheerio.load(file);
  const output = bonappetit(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/bonappetit'));
});

test('should return error on empty bonappetit html', () => {
  const html = cheerio.load('<body></body>');
  const output = bonappetit(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse cooking nytimes output', () => {
  const file = readFile('./laodeai_fixture/cooking_nytimes.html');
  const html = cheerio.load(file);
  const output = cookingNytimes(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/cooking_nytimes'));
});

test('should return error on empty cooking nytimes html', () => {
  const html = cheerio.load('<body></body>');
  const output = cookingNytimes(html);

  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse zeroclick output', () => {
  const file = readFile('./laodeai_fixture/zeroclick.html');
  const html = cheerio.load(file);
  const output = zeroclick(html);

  assert.equal(output.type, 'text');
  assert.fixture(output.content, readFile('./laodeai_snapshot/zeroclick'));
});

test('should return error on empty zeroclick html', () => {
  const html = cheerio.load('<body></body>');
  const output = zeroclick(html);

  assert.equal(output, { type: 'error', content: '' });
});

test.run();
