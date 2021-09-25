/**
 * Process Github Gist from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */

export function zeroclick($) {
  const zeroclick = $('.zci__result').html();
  return zeroclick
    ? {
        type: 'text',
        content: zeroclick.trim().replace(/^\s+/gm, '').replace(/\r\n/g, '\n'),
      }
    : { type: 'error', content: '' };
}
