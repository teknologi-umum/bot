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
    let clean = true;

    const validate = trie.containsKeyBeginningWith(href);
    if (validate) {
      clean = false;
      break;
    }

    for (let k = 0; k < textArray.length; k++) {
      const validate = trie.containsKey(textArray[k]);
      if (validate) {
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
 * @param {String} input
 * @param {import('../../builder/trie.js').Trie} trie
 * @returns {Boolean}
 */
export function isClean(input, trie) {
  for (let i = 0; i < input.length; i++) {
    if (trie.containsKey(input[i])) return false;
  }
  return true;
}
