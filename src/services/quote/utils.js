import { readFileSync } from 'fs';
import { join } from 'desm';
import { request } from 'undici';
import { compile } from 'tempura';

const renderTemplate = compile(
  readFileSync(join(import.meta.url, 'templates/default.hbs'), {
    encoding: 'utf8',
  }),
);

export function fetchRandomQuote() {
  // TODO: Fetch from many resources
  return request('https://api.quotable.io/random', {
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => res.body.json());
}

export function formatQuote(quote) {
  return renderTemplate({
    content: quote.content.trim(),
    author: quote.author,
  });
}

export async function getRandomQuote() {
  return formatQuote(await fetchRandomQuote());
}
