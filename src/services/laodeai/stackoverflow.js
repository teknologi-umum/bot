/**
 * Process Stackoverflow from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function stackoverflow($) {
  const acceptedCode = $('.answer .post-layout .answercell .s-prose pre', '#answers').first().text();

  if (acceptedCode) {
    return {
      type: 'image',
      content: acceptedCode,
    };
  }

  const acceptedText = $('.answer .post-layout .answercell .s-prose', '#answers').first().text();
  if (acceptedText) {
    return {
      type: 'text',
      content: acceptedText,
    };
  }

  return {
    type: 'error',
    content: '',
  };
}
