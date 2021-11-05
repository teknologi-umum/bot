import * as cheerio from "cheerio";

/**
 * Find closest number, higher than needle, from an array
 * @param {number} needle
 * @param {number[]} haystack
 * @returns {number}
 */
const closest = (needle, haystack) => {
  const validCandidates = haystack.filter((x) => x > needle);

  return validCandidates.length < 1
    ? haystack.at(-1) // we like bliding ej, Array.prototype.at is only available from 16.6.0
    : validCandidates.reduce((curr, acc) => {
      const aDiff = Math.abs(curr - needle);
      const bDiff = Math.abs(acc - needle);

      return bDiff < aDiff ? acc : curr;
    }, 0);
};

/**
 * Trim HTML according to tag
 * @param {number} max
 * @param {string} content
 * @returns {string}
 */
export const trimHtml = (max, content) => {
  // add wrapper div for cheerio.children selector to work
  // we want to select all tags _without_ their children
  const $ = cheerio.load(`<div>${content}</div>`, {
    xml: {
      withStartIndices: true,
      withEndIndices: true
    }
  });

  const endIndices = $("div")
    .children()
    .get()
    .map((el) => el.endIndex + 1);

  // -5 because the first `<div>` tag counts but we don't actually use them
  return content.substring(0, closest(max, endIndices) - 5);
};
