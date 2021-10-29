import got from "got";
import { defaultHeaders } from "#utils/http.js";

// use object so it will stay O(1) when indexing
const VALID_LANGUAGES = {
  abap: true,
  "actionscript-3": true,
  ada: true,
  apache: true,
  apex: true,
  apl: true,
  applescript: true,
  asm: true,
  astro: true,
  awk: true,
  ballerina: true,
  bat: true,
  batch: true,
  c: true,
  clojure: true,
  clj: true,
  cobol: true,
  coffee: true,
  cpp: true,
  crystal: true,
  csharp: true,
  "c#": true,
  css: true,
  d: true,
  dart: true,
  diff: true,
  docker: true,
  "dream-maker": true,
  elixir: true,
  elm: true,
  erb: true,
  erlang: true,
  fish: true,
  fsharp: true,
  "f#": true,
  gherkin: true,
  "git-commit": true,
  "git-rebase": true,
  gnuplot: true,
  go: true,
  graphql: true,
  groovy: true,
  hack: true,
  haml: true,
  handlebars: true,
  hbs: true,
  haskell: true,
  hcl: true,
  hlsl: true,
  html: true,
  ini: true,
  java: true,
  javascript: true,
  js: true,
  "jinja-html": true,
  json: true,
  jsonc: true,
  jsonnet: true,
  jssm: true,
  fsl: true,
  jsx: true,
  julia: true,
  jupyter: true,
  kotlin: true,
  latex: true,
  less: true,
  lisp: true,
  logo: true,
  lua: true,
  make: true,
  makefile: true,
  markdown: true,
  md: true,
  matlab: true,
  mdx: true,
  nginx: true,
  nim: true,
  nix: true,
  "objective-c": true,
  objc: true,
  "objective-cpp": true,
  ocaml: true,
  pascal: true,
  perl: true,
  php: true,
  plsql: true,
  postcss: true,
  powershell: true,
  ps: true,
  ps1: true,
  prisma: true,
  prolog: true,
  pug: true,
  jade: true,
  puppet: true,
  purescript: true,
  python: true,
  py: true,
  r: true,
  raku: true,
  perl6: true,
  razor: true,
  riscv: true,
  ruby: true,
  rb: true,
  rust: true,
  sas: true,
  sass: true,
  scala: true,
  scheme: true,
  scss: true,
  shaderlab: true,
  shader: true,
  shellscript: true,
  shell: true,
  bash: true,
  sh: true,
  zsh: true,
  smalltalk: true,
  solidity: true,
  sparql: true,
  sql: true,
  "ssh-config": true,
  stylus: true,
  styl: true,
  svelte: true,
  swift: true,
  "system-verilog": true,
  tcl: true,
  tex: true,
  toml: true,
  tsx: true,
  turtle: true,
  twig: true,
  typescript: true,
  ts: true,
  vb: true,
  cmd: true,
  verilog: true,
  vhdl: true,
  viml: true,
  "vue-html": true,
  vue: true,
  wasm: true,
  wenyan: true,
  文言: true,
  xml: true,
  xsl: true,
  yaml: true,
};

export const ERR_INVALID_LANGUAGE =
  "Invalid language\\! [See here](https://github.com/teknologi-umum/bot/blob/f7e145bcf419206b82e8ccd4528b19701bd6ea42/src/services/snap/utils.js#L5-L155) for a valid list of languages\\.";

export async function generateImage(code, lang) {
  if (!code) return Promise.reject("Code must be supplied\\!");
  if (lang && !VALID_LANGUAGES[lang]) {
    return Promise.reject(ERR_INVALID_LANGUAGE);
  }

  const linenr = code.split("\n").length;
  const { body } = await got.post("https://graphene.teknologiumum.com/api", {
    headers: defaultHeaders,
    json: {
      code: code.replace(/^\s+|\s+$/g, ""),
      lang,
      theme: "github-dark",
      upscale: 3,
      lineNumber: linenr > 10,
      border: {
        thickness: 20,
      },
    },
    responseType: "buffer",
    timeout: {
      request: 30_000,
    },
    retry: {
      limit: 3,
      methods: ["POST"],
      statusCodes: [429, 500, 502, 503, 504],
    },
  });

  return body;
}
