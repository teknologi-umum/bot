import { readFileSync } from 'fs';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { stackoverflow } from '../src/services/laodeai/stackoverflow.js';
import { gist } from '../src/services/laodeai/gist.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

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
If fish is a local variable, this code won't pass compilation, since fish must be initialized.

If fish is an instance variable, this code will throw NullPointerException, since the default value of fish will be null, and de-referencing a null reference throws this exception.
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
    `[](#pure-esm-package)Pure ESM package
=====================================

The package linked to from here is now pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). It cannot be \`require()\`'d from CommonJS.

This means you have the following choices:

1.  Use ESM yourself. **(preferred)**  
    Use \`import foo from 'foo'\` instead of \`const foo = require('foo')\` to import the package. Follow the below guide.
2.  If the package is used in an async context, you could use [\`await import(…)\`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) from CommonJS instead of \`require(…)\`.
3.  Stay on the existing version of the package until you can move to ESM.

**You also need to make sure you're on the latest minor version of Node.js. At minimum Node.js 12.20, 14.14, or 16.0.**

I would strongly recommend moving to ESM. ESM can still import CommonJS packages, but CommonJS packages cannot import ESM packages synchronously.

ESM is natively supported by Node.js 12 and later.

You can read more about my [ESM plans](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77).

**My repos are not the place to ask ESM/TypeScript/Webpack/Jest/ts-node/CRA support questions.**

[](#faq)FAQ
-----------

### [](#how-can-i-move-my-commonjs-project-to-esm)How can I move my CommonJS project to ESM?

*   Add \`"type": "module"\` to your package.json.
*   Replace \`"main": "index.js"\` with \`"exports": "./index.js"\` in your package.json.
*   Update the \`"engines"\` field in package.json to Node.js 12: \`"node": "^12.20.0 || ^14.13.1 || >=16.0.0"\`.
*   Remove \`'use strict';\` from all JavaScript files.
*   Replace all \`require()\`/\`module.export\` with \`import\`/\`export\`.
*   Use only full relative file paths for imports: \`import x from '.';\` → \`import x from './index.js';\`.
*   If you have a TypeScript type definition (for example, \`index.d.ts\`), update it to use ESM imports/exports.
*   Optional but recommended, use the [\`node:\` protocol](https://nodejs.org/api/esm.html#esm_node_imports) for imports.

### [](#can-i-import-esm-packages-in-my-typescript-project)Can I import ESM packages in my TypeScript project?

Yes, but you need to convert your project to output ESM. See below.

### [](#how-can-i-make-my-typescript-project-output-esm)How can I make my TypeScript project output ESM?

*   Add \`"type": "module"\` to your package.json.
*   Replace \`"main": "index.js"\` with \`"exports": "./index.js"\` in your package.json.
*   Update the \`"engines"\` field in package.json to Node.js 12: \`"node": "^12.20.0 || ^14.13.1 || >=16.0.0"\`.
*   Add [\`"module": "ES2020"\`](https://www.typescriptlang.org/tsconfig#module) to your tsconfig.json.
*   Use only full relative file paths for imports: \`import x from '.';\` → \`import x from './index.js';\`.
*   Remove \`namespace\` usage and use \`export\` instead.
*   Optional but recommended, use the [\`node:\` protocol](https://nodejs.org/api/esm.html#esm_node_imports) for imports.
*   **You must use a \`.js\` extension in relative imports even though you're importing \`.ts\` files.**

If you use \`ts-node\`, follow [this guide](https://github.com/TypeStrong/ts-node/issues/1007).

### [](#how-can-i-import-esm-in-electron)How can I import ESM in Electron?

[Electron doesn't yet support ESM natively.](https://github.com/electron/electron/issues/21457)

You have the following options:

1.  Stay on the previous version of the package in question.
2.  Bundle your dependencies with Webpack into a CommonJS bundle.
3.  Use the [\`esm\`](https://github.com/standard-things/esm) package.

### [](#im-having-problems-with-esm-and-webpack)I'm having problems with ESM and Webpack

The problem is either Webpack or your Webpack configuration. First, ensure you are on the latest version of Webpack. Please don't open an issue on my repo. Try asking on Stack Overflow or [open an issue the Webpack repo](https://github.com/webpack/webpack).

### [](#im-having-problems-with-esm-and-nextjs)I'm having problems with ESM and Next.js

You must enable the [experimental support for ESM](https://nextjs.org/blog/next-11-1#es-modules-support).

### [](#im-having-problems-with-esm-and-jest)I'm having problems with ESM and Jest

[Read this first.](https://github.com/facebook/jest/blob/64de4d7361367fd711a231d25c37f3be89564264/docs/ECMAScriptModules.md) The problem is either Jest ([#9771](https://github.com/facebook/jest/issues/9771)) or your Jest configuration. First, ensure you are on the latest version of Jest. Please don't open an issue on my repo. Try asking on Stack Overflow or [open an issue the Jest repo](https://github.com/facebook/jest).

### [](#im-having-problems-with-esm-and-typescript)I'm having problems with ESM and TypeScript

If you have decided to make your project ESM (\`"type": "module"\` in your package.json), make sure you have [\`"module": "ES2020"\`](https://www.typescriptlang.org/tsconfig#module) in your tsconfig.json and that all your import statements to local files use the \`.js\` extension, **not** \`.ts\` or no extension.

### [](#im-having-problems-with-esm-and-ts-node)I'm having problems with ESM and \`ts-node\`

Follow [this guide](https://github.com/TypeStrong/ts-node/issues/1007) and ensure you are on the latest version of \`ts-node\`.

### [](#im-having-problems-with-esm-and-create-react-app)I'm having problems with ESM and Create React App

Create React App doesn't yet fully support ESM. I would recommend opening an issue on their repo with the problem you have encountered. One known issue is [#10933](https://github.com/facebook/create-react-app/issues/10933).

### [](#how-can-i-use-typescript-with-ava-for-an-esm-project)How can I use TypeScript with AVA for an ESM project?

Follow [this guide](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#for-packages-with-type-module).

### [](#how-can-i-make-sure-i-dont-accidentally-use-commonjs-specific-conventions)How can I make sure I don't accidentally use CommonJS-specific conventions?

We got you covered with this [ESLint rule](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md). You should also use [this rule](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md).

### [](#what-do-i-use-instead-of-__dirname-and-__filename)What do I use instead of \`__dirname\` and \`__filename\`?

import {fileURLToPath} from 'node:url';
import path from 'node:path';

const \\_\\_filename \\= fileURLToPath(import.meta.url);
const \\_\\_dirname \\= path.dirname(fileURLToPath(import.meta.url));

However, in most cases, this is better:

import {fileURLToPath} from 'node:url';

const foo \\= fileURLToPath(new URL('foo.js', import.meta.url));

And many Node.js APIs accept URL directly, so you can just do this:

const foo \\= new URL('foo.js', import.meta.url);

### [](#how-can-i-import-a-module-and-bypass-the-cache-for-testing)How can I import a module and bypass the cache for testing?

There's no good way to do this yet. Not until we get [ESM loader hooks](https://github.com/nodejs/modules/issues/307). For now, this snippet can be useful:

const importFresh \\= async modulePath \\=> import(\\\`\${modulePath}?x=\${new Date()}\\\`);

const chalk \\= (await importFresh('chalk')).default;

__Note: This will cause memory leaks, so only use it for testing, not in production. Also, it will only reload the imported module, not its dependencies.__

### [](#how-can-i-import-json)How can I import JSON?

JavaScript Modules will eventually get [native support for JSON](https://github.com/tc39/proposal-json-modules), but for now, you can do this:

import {promises as fs} from 'node:fs';

const packageJson \\= JSON.parse(await fs.readFile('package.json'));

If you target Node.js 14 or later, you can import it using \`import fs from 'node:fs/promises';\` instead.

### [](#when-should-i-use-a-default-export-or-named-exports)When should I use a default export or named exports?

My general rule is that if something exports a single main thing, it should be a default export.

Keep in mind that you can combine a default export with named exports when it makes sense:

import readJson, {JSONError} from 'read-json';

Here, we had exported the main thing \`readJson\`, but we also exported an error as a named export.

#### [](#asynchronous-and-synchronous-api)Asynchronous and synchronous API

If your package has both an asynchronous and synchronous main API, I would recommend using named exports:

import {readJson, readJsonSync} from 'read-json';

This makes it clear to the reader that the package exports multiple main APIs. We also follow the Node.js convention of suffixing the synchronous API with \`Sync\`.

#### [](#readable-named-exports)Readable named exports

I have noticed a bad pattern of packages using overly generic names for named exports:

import {parse} from 'parse-json';

This forces the consumer to either accept the ambiguous name (which might cause naming conflicts) or rename it:

import {parse as parseJson} from 'parse-json';

Instead, make it easy for the user:

import {parseJson} from 'parse-json';

#### [](#examples)Examples

With ESM, I now prefer descriptive named exports more often than a namespace default export:

CommonJS (before):

const isStream \\= require('is-stream');

isStream.writable(…);

ESM (now):

import {isWritableStream} from 'is-stream';

isWritableStream(…);

`,
  );
});

test('should return error on empty github gist html', () => {
  const html = cheerio.load('<body></body>');
  const output = gist(html);
  assert.equal(output, { type: 'error', content: '' });
});

test.run();
