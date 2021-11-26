import { sanitize } from "#utils/sanitize.js";

/**
 * Process Stackexchange from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function stackexchange($) {
  const acceptedText = $(
    ".answer .post-layout .answercell .s-prose",
    "#answers"
  )
    .first()
    .html();
  if (acceptedText) {
    return {
      type: "text",
      content: sanitize(acceptedText).trim().replace(/\r\n/g, "\n")
    };
  }


  return {
    type: "error",
    content: ""
  };
}
