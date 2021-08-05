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

  const $ = cheerio.load(response);
  const quoteNumber = randomNumber(0, 9);

  quote.author = $('a.auteurfbnaam').eq(quoteNumber).text();
  const time = $('span.auteur-gebsterf').eq(quoteNumber).text();
  quote.authorRole = $('span.auteur-beschrijving').eq(quoteNumber).text() + (time ? ' (' + time + ')' : '');
  quote.content = $('q.fbquote').eq(quoteNumber).text();

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
