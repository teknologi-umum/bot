/**
 * Only output clean array or search results
 * @param {Array<{href: string, text: string}>} search
 * @param {Array<string>} cached
 * @returns {Array<{href: string, text: string}}
 */
export function cleanFilter(search, cached) {
  const result = [];
  for (let i = 0; i < search.length; i++) {
    const currentSearch = search[i];
    let clean = true;
    for (let j = 0; j < cached.length; j++) {
      const currentWord = cached[j];
      const validateHref = currentSearch.href.match(new RegExp(currentWord, 'i'));
      const validateText = currentSearch.text.match(new RegExp(currentWord, 'i'));
      if ((validateHref && validateHref[0]) || (validateText && validateText[0])) {
        clean = false;
        break;
      }
      if ((new RegExp(`([A-Z]{3,4})+(-)+([0-9]{3,4})`)).test(currentWord)) {
        clean = false;
        break;
      }
    }

    clean && result.push(currentSearch);
  }

  return result;
}

/**
 * Check if input is clean or not
 * @param {String} input
 * @param {string[]} cached
 * @returns {Boolean}
 */
export function isClean(input, cached) {
  for (let i = 0; i < cached.length; i++) {
    const matched = input.match(new RegExp(cached[i], 'i'));
    if (matched && matched[0]) return false;
  }
  return true;
}
