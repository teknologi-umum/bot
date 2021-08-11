import cheerio from 'cheerio';
import got from 'got';
import { renderTemplate } from './utils.js';
import { getCommandArgs } from '../../utils/command.js';

const SEARCH_LIMIT = 10;

/**
 * @param {import('telegraf').Telegraf} context
 */
async function search(context) {
  const query = getCommandArgs('search', context);
  if (!query) return;

  const { body, requestUrl, statusCode } = await got.get('https://html.duckduckgo.com/html/', {
    searchParams: {
      kp: 1, // safe search // 1: strict | -1: moderate | 2: off
      q: query,
    },
    headers: {
      Accept: 'text/html',
    },
    responseType: 'text',
  });

  if (statusCode !== 200) {
    await context.reply('Error getting search result.');
    return;
  }

  const $ = cheerio.load(body);

  let results = [];
  $('.result__title > a').each(function (idx) {
    if (idx == SEARCH_LIMIT) {
      return false;
    }

    const text = this.firstChild.data;
    const href = this.attribs.href.replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, '');
    results.push({ text, href: decodeURIComponent(href) });
  });

  await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate({
      items: results,
      amount: SEARCH_LIMIT,
      url: decodeURIComponent(requestUrl),
    }),
    { parse_mode: 'HTML' },
  );
}

/**
 * Send search result from duckduckgo.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('search', search);

  return [
    {
      command: 'search',
      description: 'Cari di DuckDuckGo',
    },
  ];
}
