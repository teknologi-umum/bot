import { sanitize } from "#utils/sanitize.js";

/**
 * Process Dictionary.com from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $ 
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function dictionary($) {
  const base = $(".app-base");
  const phrase = base.find(".e1wg9v5m6 > h1.e1wg9v5m5").text();
  const meaning = base.find("section.e1hk9ate4 > div.e1hk9ate0")
    .first()
    .find("div")
    .map((_, el) => sanitize($(el).html())).toArray();

  if (phrase && meaning) {
    return {
      type: "text",
      content: `<b>${phrase}</b> may be defined as:\n\n${meaning.map((value, index) => `${index + 1}. ${value.trim()}`).join("\n")}`
    };
  }
  
  return {
    type: "error",
    content: ""
  };
}