import got from "got";
import { randomNumber } from "carret";
import * as cheerio from "cheerio";
import { defaultHeaders } from "#utils/http.js";
import { renderTemplate } from "#utils/template.js";

export function extractQuoteFromHtml(response) {
  const quote = {};

  const $root = cheerio.load(response);
  const $content = $root("q.fbquote").eq(randomNumber(0, 9));
  const $ = $content.parents("li");

  let period = $.find("span.auteur-gebsterf").text();
  period = period ? ` - (${period})` : "";

  quote.author = $.find("a.auteurfbnaam").text();
  quote.authorRole = $.find("span.auteur-beschrijving").text() + period;
  quote.content = $content.text();

  return quote;
}

export async function fetchRandomQuote() {
  // TODO: Fetch from many resources
  const { body } = await got.get("https://jagokata.com/kata-bijak/acak.html", {
    responseType: "text",
    headers: defaultHeaders,
  });
  return extractQuoteFromHtml(body);
}

export function formatQuote(quote) {
  return renderTemplate("quote/quote.template.hbs", quote);
}

export async function getRandomQuote() {
  return formatQuote(await fetchRandomQuote());
}
