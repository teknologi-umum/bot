import { readFileSync } from 'fs';
import { join } from 'desm';
import { request } from 'undici';
import { compile } from 'tempura';
import { randomNumber } from 'carret';
import * as cheerio from 'cheerio';

const renderTemplate = compile(
  readFileSync(join(import.meta.url, 'templates/default.hbs'), {
    encoding: 'utf8',
  }),
);

export function extractQuoteFromHtml(response) {
  const quote = {};

  const $root = cheerio.load(response);
  const $content = $root('q.fbquote').eq(randomNumber(0, 9));
  const $ = $content.parents('li');

  let period = $.find('span.auteur-gebsterf').text();
  period = period ? ` - (${period})` : '';

  quote.author = $.find('a.auteurfbnaam').text();
  quote.authorRole = $.find('span.auteur-beschrijving').text() + period;
  quote.content = $content.text();

  return quote;
}

export function fetchRandomQuote() {
  // TODO: Fetch from many resources
  return request('https://jagokata.com/kata-bijak/acak.html')
    .then((res) => res.body.text())
    .then(extractQuoteFromHtml);
}

export function formatQuote(quote) {
  return renderTemplate(quote);
}

export async function getRandomQuote() {
  return formatQuote(await fetchRandomQuote());
}
