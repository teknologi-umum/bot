import * as cheerio from "cheerio";

/**
 * findClosest is a method to find the closest number higher than the needle from a given array
 * @param {number} needle
 * @param {number[]} haystack
 * @returns {number}
 */
const findClosest = (needle, haystack) => {
  return haystack.length < 1
    ? haystack.at(-1) // we like bliding ej, Array.prototype.at is only available from 16.6.0
    : haystack.reduce((curr, acc) => {
      const aDiff = Math.abs(curr - needle);
      const bDiff = Math.abs(acc - needle);

      return bDiff < aDiff ? acc : curr;
    }, 0);
};

/**
 * trimHTML is a function to trim HTML up to a maximum length without breaking tags.
 * @param {number} max The maximum length of the trimmed content
 * @param {string} content The content to trim
 * @returns {string}
 */
export const trimHTML = (max, content) => {
  if (
    max === undefined ||
    max === null ||
    max < 1 ||
    content === undefined ||
    content === null
  ) {
    throw TypeError("Max and content are required!");
  }

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
  return content.substring(0, findClosest(max, endIndices) - 5);
};
