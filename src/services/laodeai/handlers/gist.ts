import { sanitize } from "#utils/sanitize.js";

/**
 * Process Github Gist from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function gist($) {
  const markdownOutput = $(".gist-content .file-box .markdown-body").html();
  if (markdownOutput) {
    return {
      type: "text",
      content: sanitize(markdownOutput).replace(/\r\n/g, "\n")
    };
  }


  const codeOutput = $(".gist-content .file-box .highlight .blob-code")
    .map((_, el) => $(el).text())
    .toArray()
    .join("\n");
  if (codeOutput) {
    return {
      type: "image",
      content: codeOutput.replace(/\r\n/g, "\n")
    };
  }


  return {
    type: "error",
    content: ""
  };
}
