import { readFileSync } from 'fs';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';
import { stackoverflow } from '../src/services/laodeai/stackoverflow.js';
import { gist } from '../src/services/laodeai/gist.js';
import { wikipedia } from '../src/services/laodeai/wikipedia.js';

test('should be able to parse a stackoverflow code output', () => {
  const file = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/stackoverflow_code.html'),
  );
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'image');
  assert.fixture(
    output.content,
    `var string = "this is a string";
var length = 7;
var trimmedString = string.substring(0, length);
`,
  );
});

test('should be able to parse a stackoverflow text output', () => {
  const file = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/stackoverflow_text.html'),
  );
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'text');
  assert.fixture(
    output.content,
    `
If <code>fish</code> is a local variable, this code won't pass compilation, since <code>fish</code> must be initialized.

If <code>fish</code> is an instance variable, this code will throw NullPointerException, since the default value of <code>fish</code> will be null, and de-referencing a null reference throws this exception.
`,
  );
});

test('should return error on empty stackoverflow html', () => {
  const html = cheerio.load('<body></body>');
  const output = stackoverflow(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse github gist code output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/gist_code.html'));
  const html = cheerio.load(file);
  const output = gist(html);
  assert.equal(output.type, 'image');
  assert.fixture(
    output.content,
    `/*
Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


// Compute the edit distance between the two given strings
exports.getEditDistance = function(a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 


  var matrix = [];


  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }


  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }


  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }


  return matrix[b.length][a.length];
};`,
  );
});

test('should be able to parse github gist markdown output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/gist_markdown.html'));
  const html = cheerio.load(file);
  const output = gist(html);
  assert.equal(output.type, 'text');
  assert.fixture(
    output.content,
    `<a href="#pure-esm-package"></a>Pure ESM package
The package linked to from here is now pure <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">ESM</a>. It cannot be <code>require()</code>'d from CommonJS.
This means you have the following choices:

Use ESM yourself. <strong>(preferred)</strong>
  Use <code>import foo from 'foo'</code> instead of <code>const foo = require('foo')</code> to import the package. Follow the below guide.
If the package is used in an async context, you could use <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports"><code>await import(…)</code></a> from CommonJS instead of <code>require(…)</code>.
Stay on the existing version of the package until you can move to ESM.

<strong>You also need to make sure you're on the latest minor version of Node.js. At minimum Node.js 12.20, 14.14, or 16.0.</strong>
I would strongly recommend moving to ESM. ESM can still import CommonJS packages, but CommonJS packages cannot import ESM packages synchronously.
ESM is natively supported by Node.js 12 and later.
You can read more about my <a href="https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77">ESM plans</a>.
<strong>My repos are not the place to ask ESM/TypeScript/Webpack/Jest/ts-node/CRA support questions.</strong>
<a href="#faq"></a>FAQ
<a href="#how-can-i-move-my-commonjs-project-to-esm"></a>How can I move my CommonJS project to ESM?

Add <code>"type": "module"</code> to your package.json.
Replace <code>"main": "index.js"</code> with <code>"exports": "./index.js"</code> in your package.json.
Update the <code>"engines"</code> field in package.json to Node.js 12: <code>"node": "^12.20.0 || ^14.13.1 || &gt;=16.0.0"</code>.
Remove <code>'use strict';</code> from all JavaScript files.
Replace all <code>require()</code>/<code>module.export</code> with <code>import</code>/<code>export</code>.
Use only full relative file paths for imports: <code>import x from '.';</code> → <code>import x from './index.js';</code>.
If you have a TypeScript type definition (for example, <code>index.d.ts</code>), update it to use ESM imports/exports.
Optional but recommended, use the <a href="https://nodejs.org/api/esm.html#esm_node_imports"><code>node:</code> protocol</a> for imports.

<a href="#can-i-import-esm-packages-in-my-typescript-project"></a>Can I import ESM packages in my TypeScript project?
Yes, but you need to convert your project to output ESM. See below.
<a href="#how-can-i-make-my-typescript-project-output-esm"></a>How can I make my TypeScript project output ESM?

Add <code>"type": "module"</code> to your package.json.
Replace <code>"main": "index.js"</code> with <code>"exports": "./index.js"</code> in your package.json.
Update the <code>"engines"</code> field in package.json to Node.js 12: <code>"node": "^12.20.0 || ^14.13.1 || &gt;=16.0.0"</code>.
Add <a href="https://www.typescriptlang.org/tsconfig#module"><code>"module": "ES2020"</code></a> to your tsconfig.json.
Use only full relative file paths for imports: <code>import x from '.';</code> → <code>import x from './index.js';</code>.
Remove <code>namespace</code> usage and use <code>export</code> instead.
Optional but recommended, use the <a href="https://nodejs.org/api/esm.html#esm_node_imports"><code>node:</code> protocol</a> for imports.
<strong>You must use a <code>.js</code> extension in relative imports even though you're importing <code>.ts</code> files.</strong>

If you use <code>ts-node</code>, follow <a href="https://github.com/TypeStrong/ts-node/issues/1007">this guide</a>.
<a href="#how-can-i-import-esm-in-electron"></a>How can I import ESM in Electron?
<a href="https://github.com/electron/electron/issues/21457">Electron doesn't yet support ESM natively.</a>
You have the following options:

Stay on the previous version of the package in question.
Bundle your dependencies with Webpack into a CommonJS bundle.
Use the <a href="https://github.com/standard-things/esm"><code>esm</code></a> package.

<a href="#im-having-problems-with-esm-and-webpack"></a>I'm having problems with ESM and Webpack
The problem is either Webpack or your Webpack configuration. First, ensure you are on the latest version of Webpack. Please don't open an issue on my repo. Try asking on Stack Overflow or <a href="https://github.com/webpack/webpack">open an issue the Webpack repo</a>.
<a href="#im-having-problems-with-esm-and-nextjs"></a>I'm having problems with ESM and Next.js
You must enable the <a href="https://nextjs.org/blog/next-11-1#es-modules-support">experimental support for ESM</a>.
<a href="#im-having-problems-with-esm-and-jest"></a>I'm having problems with ESM and Jest
<a href="https://github.com/facebook/jest/blob/64de4d7361367fd711a231d25c37f3be89564264/docs/ECMAScriptModules.md">Read this first.</a> The problem is either Jest (<a href="https://github.com/facebook/jest/issues/9771">#9771</a>) or your Jest configuration. First, ensure you are on the latest version of Jest. Please don't open an issue on my repo. Try asking on Stack Overflow or <a href="https://github.com/facebook/jest">open an issue the Jest repo</a>.
<a href="#im-having-problems-with-esm-and-typescript"></a>I'm having problems with ESM and TypeScript
If you have decided to make your project ESM (<code>"type": "module"</code> in your package.json), make sure you have <a href="https://www.typescriptlang.org/tsconfig#module"><code>"module": "ES2020"</code></a> in your tsconfig.json and that all your import statements to local files use the <code>.js</code> extension, <strong>not</strong> <code>.ts</code> or no extension.
<a href="#im-having-problems-with-esm-and-ts-node"></a>I'm having problems with ESM and <code>ts-node</code>
Follow <a href="https://github.com/TypeStrong/ts-node/issues/1007">this guide</a> and ensure you are on the latest version of <code>ts-node</code>.
<a href="#im-having-problems-with-esm-and-create-react-app"></a>I'm having problems with ESM and Create React App
Create React App doesn't yet fully support ESM. I would recommend opening an issue on their repo with the problem you have encountered. One known issue is <a href="https://github.com/facebook/create-react-app/issues/10933">#10933</a>.
<a href="#how-can-i-use-typescript-with-ava-for-an-esm-project"></a>How can I use TypeScript with AVA for an ESM project?
Follow <a href="https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#for-packages-with-type-module">this guide</a>.
<a href="#how-can-i-make-sure-i-dont-accidentally-use-commonjs-specific-conventions"></a>How can I make sure I don't accidentally use CommonJS-specific conventions?
We got you covered with this <a href="https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md">ESLint rule</a>. You should also use <a href="https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md">this rule</a>.
<a href="#what-do-i-use-instead-of-__dirname-and-__filename"></a>What do I use instead of <code>__dirname</code> and <code>__filename</code>?
<pre>import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));</pre>
However, in most cases, this is better:
<pre>import {fileURLToPath} from 'node:url';

const foo = fileURLToPath(new URL('foo.js', import.meta.url));</pre>
And many Node.js APIs accept URL directly, so you can just do this:
<pre>const foo = new URL('foo.js', import.meta.url);</pre>
<a href="#how-can-i-import-a-module-and-bypass-the-cache-for-testing"></a>How can I import a module and bypass the cache for testing?
There's no good way to do this yet. Not until we get <a href="https://github.com/nodejs/modules/issues/307">ESM loader hooks</a>. For now, this snippet can be useful:
<pre>const importFresh = async modulePath =&gt; import(\`\${modulePath}?x=\${new Date()}\`);

const chalk = (await importFresh('chalk')).default;</pre>
<em>Note: This will cause memory leaks, so only use it for testing, not in production. Also, it will only reload the imported module, not its dependencies.</em>
<a href="#how-can-i-import-json"></a>How can I import JSON?
JavaScript Modules will eventually get <a href="https://github.com/tc39/proposal-json-modules">native support for JSON</a>, but for now, you can do this:
<pre>import {promises as fs} from 'node:fs';

const packageJson = JSON.parse(await fs.readFile('package.json'));</pre>
If you target Node.js 14 or later, you can import it using <code>import fs from 'node:fs/promises';</code> instead.
<a href="#when-should-i-use-a-default-export-or-named-exports"></a>When should I use a default export or named exports?
My general rule is that if something exports a single main thing, it should be a default export.
Keep in mind that you can combine a default export with named exports when it makes sense:
<pre>import readJson, {JSONError} from 'read-json';</pre>
Here, we had exported the main thing <code>readJson</code>, but we also exported an error as a named export.
<a href="#asynchronous-and-synchronous-api"></a>Asynchronous and synchronous API
If your package has both an asynchronous and synchronous main API, I would recommend using named exports:
<pre>import {readJson, readJsonSync} from 'read-json';</pre>
This makes it clear to the reader that the package exports multiple main APIs. We also follow the Node.js convention of suffixing the synchronous API with <code>Sync</code>.
<a href="#readable-named-exports"></a>Readable named exports
I have noticed a bad pattern of packages using overly generic names for named exports:
<pre>import {parse} from 'parse-json';</pre>
This forces the consumer to either accept the ambiguous name (which might cause naming conflicts) or rename it:
<pre>import {parse as parseJson} from 'parse-json';</pre>
Instead, make it easy for the user:
<pre>import {parseJson} from 'parse-json';</pre>
<a href="#examples"></a>Examples
With ESM, I now prefer descriptive named exports more often than a namespace default export:
CommonJS (before):
<pre>const isStream = require('is-stream');

isStream.writable(…);</pre>
ESM (now):
<pre>import {isWritableStream} from 'is-stream';

isWritableStream(…);</pre>
`,
  );
});

test('should return error on empty github gist html', () => {
  const html = cheerio.load('<body></body>');
  const output = gist(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse wikipedia output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/wikipedia.html'));
  const html = cheerio.load(file);
  const output = wikipedia(html);
  assert.equal(output.type, 'text');
  const contents = output.content.split('\n');
  assert.is(contents.length, 3);
});

test('should return error on empty wikipedia html', () => {
  const html = cheerio.load('<body></body>');
  const output = wikipedia(html);
  assert.equal(output, { type: 'error', content: '' });
});

test.run();
