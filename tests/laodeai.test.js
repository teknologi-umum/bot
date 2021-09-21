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

test('should be able to output stackoverflow text if code is deemed too short', () => {
  const file = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/stackoverflow_next.html'),
  );
  const html = cheerio.load(file);
  const output = stackoverflow(html);

  assert.equal(output.type, 'text');
  assert.fixture(
    output.content,
    `
In 5.7 the sqlmode is set by default to:

<pre><code> ONLY_FULL_GROUP_BY,NO_AUTO_CREATE_USER,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
</code></pre>

To remove the clause ONLY_FULL_GROUP_BY you can do this:

<pre><code>SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
</code></pre>

This supposed you need to make that GROUP BY with non aggregated columns.

Regards
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

test('should be able to parse wikihow output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/wikihow.html'));
  const html = cheerio.load(file);
  const output = wikihow(html);
  assert.equal(output.type, 'text');
  assert.equal(
    output.content,
    `<b>Method 1 of 3:  Treating Momentary Ringing in the Ears</b>
1. Try the skull-thumping trick.
2. Try waiting it out.
3. Avoid loud noises and protect your ears when you are exposed to noise.

<b>Method 2 of 3:  Treating Chronic Ringing in the Ears</b>
1. See your doctor about treating underlying conditions.
2. Look into biofeedback therapy for your tinnitus.
3. Treat tinnitus with noise-suppression tactics.
4. Take medications to relieve some of the tinnitus symptoms.
5. Try ginkgo extract.

<b>Method 3 of 3:  Preventing Tinnitus</b>
1. Avoid situations in which damage to the cochlea could cause tinnitus.
2. Find an outlet for your stress.
3. Consume less alcohol and nicotine.
`,
  );
});

test('should return error on empty wikihow html', () => {
  const html = cheerio.load('<body></body>');
  const output = wikihow(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse stackexchange output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/stackexchange.html'));
  const html = cheerio.load(file);
  const output = stackexchange(html);
  assert.equal(output.type, 'text');
  assert.equal(
    output.content,
    `Dear <a href="https://twitter.com/colmmacuait">@colmmacuait</a>, I think that if you type "man" at 0001 hours it should print "gimme gimme gimme". <a href="https://twitter.com/hashtag/abba?src=hash">#abba</a> 

 <a href="https://twitter.com/marnanel/status/132280557190119424"><strong>@marnanel</strong> - 3 November 2011</a> 


er, that was my fault, I suggested it. Sorry.

Pretty much the whole story is in the commit. The maintainer of man is a good friend of mine, and one day six years ago I jokingly said to him that if you invoke man after midnight it should print "<em>gimme gimme gimme</em>", because of the Abba song called "<em>Gimme gimme gimme a man after midnight</em>":

Well, he did actually <a href="https://git.savannah.nongnu.org/cgit/man-db.git/commit/src/man.c?id=002a6339b1fe8f83f4808022a17e1aa379756d99">put it</a> <a href="https://git.savannah.nongnu.org/cgit/man-db.git/commit/src/man.c?id=91c495389105a4cb6214fe176f703f498e4f0d91">in</a>. A few people were amused to discover it, and we mostly forgot about it until today.

<a href="https://unix.stackexchange.com/questions/405783/why-does-man-print-gimme-gimme-gimme-at-0030/405874#comment726280_405874">I can't speak for Col</a>, obviously, but I didn't expect this to ever cause any problems: what sort of test would break on parsing the output of man with no page specified? I suppose I shouldn't be surprised that one turned up eventually, but it did take six years.

(The <a href="https://git.savannah.nongnu.org/cgit/man-db.git/commit/src/man.c?id=002a6339b1fe8f83f4808022a17e1aa379756d99">commit message</a> calls me Thomas, which is my legal first name though I don't use it online much.) 

<strong>This issue has been fixed with commit <a href="https://git.savannah.gnu.org/cgit/man-db.git/commit/?id=84bde8d8a9a357bd372793d25746ac6b49480525">84bde8</a>:</strong> Running man with <code>man -w</code> will no longer trigger this easter egg.`,
  );
});

test('should return error on empty stackexchange html', () => {
  const html = cheerio.load('<body></body>');
  const output = stackexchange(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse foodnetwork output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/foodnetwork.html'));
  const html = cheerio.load(file);
  const output = foodnetwork(html);
  assert.equal(output.type, 'text');
  assert.equal(
    output.content,
    `<b>Spaghetti alla Carbonara</b>

<b>Ingredients:</b>
1. 1 pound dry spaghetti
2. 2 tablespoons extra-virgin olive oil
3. 4 ounces pancetta or slab bacon, cubed or sliced into small strips
4. 4 garlic cloves, finely chopped
5. 2 large eggs
6. 1 cup freshly grated Parmigiano-Reggiano, plus more for serving
7. Freshly ground black pepper
8. 1 handful fresh flat-leaf parsley, chopped

<b>Directions</b>:
1. Prepare the sauce while the pasta is cooking to ensure that the spaghetti will be hot and ready when the sauce is finished; it is very important that the pasta is hot when adding the egg mixture, so that the heat of the pasta cooks the raw eggs in the sauce.
2. Bring a large pot of salted water to a boil, add the pasta and cook for 8 to 10 minutes or until tender yet firm (as they say in Italian "al dente.") Drain the pasta well, reserving 1/2 cup of the starchy cooking water to use in the sauce if you wish.
3. Meanwhile, heat the olive oil in a deep skillet over medium flame. Add the pancetta and saute for about 3 minutes, until the bacon is crisp and the fat is rendered. Toss the garlic into the fat and saute for less than 1 minute to soften.
4. Add the hot, drained spaghetti to the pan and toss for 2 minutes to coat the strands in the bacon fat. Beat the eggs and Parmesan together in a mixing bowl, stirring well to prevent lumps. Remove the pan from the heat and pour the egg/cheese mixture into the pasta, whisking quickly until the eggs thicken, but do not scramble (this is done off the heat to ensure this does not happen.) Thin out the sauce with a bit of the reserved pasta water, until it reaches desired consistency. Season the carbonara with several turns of freshly ground black pepper and taste for salt. Mound the spaghetti carbonara into warm serving bowls and garnish with chopped parsley. Pass more cheese around the table.`,
  );
});

test('should return error on empty foodnetwork html', () => {
  const html = cheerio.load('<body></body>');
  const output = foodnetwork(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse knowyourmeme output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/knowyourmeme.html'));
  const html = cheerio.load(file);
  const output = knowyourmeme(html);
  assert.equal(output.type, 'text');
  assert.fixture(
    output.content,
    `<em><strong>Editor's Note:</strong> This entry contains spoilers for <em>Invincible</em>; read at your own caution.</em><strong>Think, Mark</strong> is a phrase said during a climactic moment of the <a href="/memes/sites/amazon">Amazon</a> Prime show <a href="/memes/subcultures/invincible-series"><em>Invincible</em></a> that began airing in 2021. Used as an <a href="/memes/exploitables">exploitable</a> <a href="/memes/image-macros">image macro</a>, the main focus of the meme is on the one saying the phrase, which is Omni-Man, a main character and secret antagonist. The brutal way in which the character, voiced by JK Simmons, yells in this scene has inspired many <a href="/memes/memes">memes</a> to be made of it, as well as various <a href="/memes/redraw">redraws</a>.


The phrase comes from the eighth and final episode of the first season of <em>Invincible</em>, which premiered on April 30th, 2021. Shortly after the beginning of the season finale, Omni-Man and Invincible start fighting, with Omni-Man having a very clear advantage over his son. Using the fight as a way to teach him a lesson, Omni-Man continues to lecture Invincible about the world while beating him with more ferocity as the scene progresses. At the conclusion of the scene, Omni-Man lets loose a fury of blows into Invincible, while compelling him to use his head and think about the big picture and situation at large (shown below).

Why did you make me do this? You're fighting so you can watch everyone around you die. Think, Mark!This yelling scene and dialogue were then picked up by meme creators for use as a <a href="/memes/snowclone">snowclone</a>, with the first words being "Think Mark" and the latter half being the point that is trying to be made, but with the inflected tone of a parent yelling at their child for being wrong. This is seen in the tweet by <a href="/memes/sites/twitter">Twitter</a><a href="#fn1">[1]</a> user @Void_Dot_Ex on May 1st, 2021, which received 22,600 likes and 3,400 retweets (shown below).



<a href="/photos/2089824"></a> 



Since the first episode of the series, it was known that Omni-Man was the antagonist of the story and that eventually, the truth would come out. This months-long build-up finally came to a head with the final episode of the season, and it made a lasting impression that later turned the scene into various memes.After the initial post using the scene as a snowclone, other independent artists began using it as a source for redraws, with the image of Omni-Man looking over the beaten body of Invincible serving as the base for <a href="/memes/sites/photoshop">photoshopping</a> it to look like other characters from different pop culture references. This is evident in the tweet by Twitter<a href="#fn2">[2]</a> user @Googleygareth on May 2nd, 2021, that received 6,700 likes and 1,100 retweets that shows <a href="/memes/g-man">G-Man</a> from <a href="/memes/subcultures/half-life"><em>Half-Life</em></a> standing over the beaten body of <a href="/memes/gordon-freeman">Gordon Freeman</a> (shown below).
<a href="/photos/2089968"></a> 




  <a href="/photos/2090347"></a>  <a href="/photos/2090343"></a>  <a href="/photos/2089924"></a>  <a href="/photos/2090346"></a>  <a href="/photos/2089928"></a>  <a href="/photos/2090173"></a>   




<a href="/photos/2090663"></a> 

<a href="/photos/2089857"></a>  <a href="/photos/2089858"></a>  <a href="/photos/2089859"></a> 



 


<a href="#fnr1">[1]</a> YouTube – <a href="https://www.youtube.com/watch?v=jTW_M_K5nEM">YouTube</a><a href="#fnr2">[2]</a> Twitter – <a href="https://twitter.com/Void_Dot_Exe/status/1388366906114011138">Twitter</a><a href="#fnr3">[3]</a> Tweet – <a href="https://twitter.com/Googleygareth/status/1388977278953086976">Twitter</a>`,
  );
});

test('should return error on empty knowyourmeme html', () => {
  const html = cheerio.load('<body></body>');
  const output = knowyourmeme(html);
  assert.equal(output, { type: 'error', content: '' });
});

test('should be able to parse urban dictionary output', () => {
  const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './laodeai_fixture/urbandictionary.html'));
  const html = cheerio.load(file);
  const output = urbandictionary(html);
  assert.equal(output.type, 'text');
  assert.equal(
    output.content,
    `<b>get rekt</b> is Another way of saying <a href="/define.php?term=get%20wrecked">get wrecked</a>

Usually used by either kids or trolls on <a href="/define.php?term=online%20games">online games</a> in order to annoy or <a href="/define.php?term=provoke">provoke</a> other players.`,
  );
});

test('should return error on empty urban dictionary html', () => {
  const html = cheerio.load('<body></body>');
  const output = urbandictionary(html);
  assert.equal(output, { type: 'error', content: '' });
});

test.run();
