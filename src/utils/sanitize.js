import sanitizeHtml from "sanitize-html";

/**
 * sanitize is a function to sanitize HTML input to be used for Telegram
 * @param {String} htmlText
 * @param {Boolean} clean Removes all HTML gibberish
 * @returns {String}
 */
export function sanitize(htmlText, clean = false) {
  if (htmlText === null || htmlText === undefined) {
    throw TypeError("Empty htmlText is not allowed!");
  }

  return sanitizeHtml(htmlText, {
    allowedTags: clean
      ? []
      : [
        "a",
        "b",
        "i",
        "s",
        "u",
        "em",
        "strong",
        "strike",
        "del",
        "code",
        "pre",
        "br"
      ],
    allowedAttributes: clean ? {} : { a: ["href"] }
  })
    .replace(/<br>|<br\/>|<br \/>/g, "\n")
    .trimStart();
}
