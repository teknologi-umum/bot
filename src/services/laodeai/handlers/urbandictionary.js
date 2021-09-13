import { sanitize } from '#utils/sanitize.js';

/**
 * Process Urban Dictionary from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function urbandictionary($) {
  const definition = $('.def-panel');
  const phrase = definition.find('.def-header > .word').first().text();
  const meaning = definition.find('.meaning').html();

  if (phrase && meaning) {
    return {
      type: 'text',
      content: `<b>${phrase}</b> is ${sanitize(meaning)}`,
    };
  }

  return {
    type: 'error',
    content: '',
  };
}
