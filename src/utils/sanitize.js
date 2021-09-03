import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML input to be used for Telegram
 * @param {String} htmlText
 * @param {Boolean} clean Removes all HTML gibberish
 * @returns {String}
 */
export function sanitize(htmlText, clean = false) {
  return sanitizeHtml(htmlText, {
    allowedTags: clean ? [] : ['a', 'b', 'i', 's', 'u', 'em', 'strong', 'strike', 'del', 'code', 'pre'],
    allowedAttributes: clean ? {} : { a: ['href', 'name', 'target'] },
  });
}
