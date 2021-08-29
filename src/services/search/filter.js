import { binarySearch } from '../../builder/binarySearch.js';

/**
 * Only output clean array or search results
 * @param {Array<{href: string, text: string}>} search
 * @param {import('../../builder/trie.js').Trie} trie
 * @returns {Array<{href: string, text: string}}
 */
export function cleanFilter(search, trie) {
  const result = [];
  for (let i = 0; i < search.length; i++) {
    const { href, text } = search[i];
    const textArray = text.split(/[^A-Za-z0-9]/gi);
    const url = new URL(href);
    const urlArray = [url.hostname, ...url.pathname.split('/')];

    let clean = true;

    for (let j = 0; j < urlArray.length; j++) {
      const validate = binarySearch(trie, urlArray[j]);
      if (validate >= 0) {
        clean = false;
        break;
      }
    }

    for (let k = 0; k < textArray.length; k++) {
      const validate = binarySearch(trie, textArray[k]);
      if (validate >= 0) {
        clean = false;
        break;
      }
    }

    clean && result.push({ href, text });
  }

  return result;
}

/**
 * Check if input is clean or not
 * @param {string[]} input
 * @param {import('../../builder/trie.js').Trie} trie
 * @returns {Boolean}
 */
export function isClean(input, trie) {
  for (let i = 0; i < input.length; i++) {
    if (binarySearch(trie, input) >= 0) return false;
  }
  return true;
}
