/**
 * Process Linux Man page from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function manpage($) {
  const headings = $("body").find("h2");

  const name = headings.has("a#SYNOPSIS").prev().text().trim();
  let description = headings.has("a#APPLICATION_USAGE").prev().text();

  // clean up description text
  description = description.split("\n").map(o => o.replace(/^( {7})/, "")).join("\n");
  if (name?.length > 0) {
    return {
      type: "text",
      content: `${name}\n\n${description}`
    };
  }

  return {
    type:"error",
    content: ""
  };
}
