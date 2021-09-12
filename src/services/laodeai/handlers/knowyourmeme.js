import { sanitize } from '../../../utils/sanitize.js';

/**
 * Process Github Gist from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function knowyourmeme($) {
  const output = $('.c .bodycopy .entry-sections-container .entry-sections .entry-section', 'article.entry')
    .map((_, el) => {
      $('h2', el).remove();
      return $(el).html();
    })
    .toArray();
  if (output && output.length > 1) {
    return {
      type: 'text',
      content: sanitize(output.join('\n')).trim().replace(/\r\n/g, '\n'),
    };
  }
  return {
    type: 'error',
    content: '',
  };
}
