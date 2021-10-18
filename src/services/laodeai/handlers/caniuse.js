import { renderTemplate } from '#utils/template.js';

/**
 * Process caniuse from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function caniuse($) {
  const browsers = $('.support-list')
    .get()
    .map((el) => {
      const name = $(el).find('.browser-heading').text();
      const status = $(el).find('ol > li').last().text().trim();
      const symbol = status.match(/not/gi) ? '❌ ' : status.match(/partial/gi) ? '🚧 ' : '✅ ';
      return { name: symbol + name, status };
    });

  if (browsers.length > 0) {
    const content = renderTemplate('./laodeai/handlers/caniuse.template.hbs', { browsers });

    return {
      type: 'text',
      content: content.trim(),
    };
  }

  return {
    type: 'error',
    content: '',
  };
}
