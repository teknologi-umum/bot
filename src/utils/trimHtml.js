import * as cheerio from 'cheerio';

/**
 * Find closest number, higher than needle, from an array
 * @param {number} needle
 * @param {number} haystack
 * @returns number
 */
const closest = (needle, haystack) =>
  haystack
    .filter((x) => x > needle)
    .reduce((curr, acc) => {
      const aDiff = Math.abs(curr - needle);
      const bDiff = Math.abs(acc - needle);

      return bDiff < aDiff ? acc : curr;
    });

/**
 * Trim HTML according to tag
 * @param {number} max
 * @param {string} content
 * @returns string
 */
export const trimHtml = (max, content) => {
  // add wrapper div for cheerio.children selector to work
  // we want to select all tags _without_ their children
  const $ = cheerio.load(`<div>${content}</div>`, {
    xml: {
      withStartIndices: true,
      withEndIndices: true,
    },
  });

  const endIndices = $('*')
    .children()
    .get()
    .map((el) => el.endIndex + 1);

  return content.substring(0, closest(max, endIndices));
};
