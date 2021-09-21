import { sanitize } from '#utils/sanitize.js';

/**
 * Process Stackoverflow from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function stackoverflow($) {
  const acceptedCode = $('.answer .post-layout .answercell .s-prose pre', '#answers').first().text();

  if (acceptedCode && acceptedCode.match(/\n/g).length > 2) {
    return {
      type: 'image',
      content: acceptedCode.replace(/\r\n/g, '\n'),
    };
  }

  const acceptedText = $('.answer .post-layout .answercell .s-prose', '#answers').first().html();
  if (acceptedText) {
    return {
      type: 'text',
      content: sanitize(acceptedText).replace(/\r\n/g, '\n'),
    };
  }

  return {
    type: 'error',
    content: '',
  };
}
