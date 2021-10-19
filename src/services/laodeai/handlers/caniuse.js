import { renderTemplate } from '#utils/template.js';

/**
 * Process caniuse from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function caniuse($) {
  const content = $('main .feature-block');
  const title = $(content).find('.feature-heading .feature-title').text().trim();
  const description = $(content)
    .find('.feature-description')
    .text()
    .split('\n')
    .map((i) => i.trim())
    .join(' ')
    .trim();
  const global = $(content).find('.usage-container .support-stats .total').text();
  const browsers = $(content)
    .find('.support-list')
    .get()
    .map((el) => {
      const name = $(el).find('.browser-heading').text();
      const status = $(el).find('ol > li').last().text().trim();
      const symbol = status.includes('Not') ? '❌ ' : status.match('Partial') ? '🚧 ' : '✅ ';
      return { name: symbol + name, status };
    });

  if (browsers.length > 0) {
    const content = renderTemplate('./laodeai/handlers/caniuse.template.hbs', { title, description, global, browsers });

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
