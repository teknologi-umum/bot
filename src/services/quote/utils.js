import { readFileSync } from 'fs';
import { join } from 'desm';
import { request } from 'undici';
import { compile } from 'tempura';
import * as cheerio from 'cheerio';

const renderTemplate = compile(
  readFileSync(join(import.meta.url, 'templates/default.hbs'), {
    encoding: 'utf8',
  }),
);

export function extractQuoteFromHtml(response) {
  const quote = {};

  const $ = cheerio.load(response);

  quote.author = $('a.auteurfbnaam').first().text();
  quote.quote = $('q.fbquote').first().text();

  return quote;
}

export function fetchRandomQuote() {
  // TODO: Fetch from many resources
  return request('https://jagokata.com/kata-bijak/acak.html')
    .then((res) => res.body.text())
    .then(extractQuoteFromHtml);
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
