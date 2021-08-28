import cheerio from 'cheerio';
import got from 'got';
import { renderTemplate } from '../../utils/template.js';
import { getCommandArgs } from '../../utils/command.js';
import { isClean, cleanFilter } from './filter.js';

const SEARCH_LIMIT = 10;

/**
 * @param {import('telegraf').Telegraf} context
 * @param {import('../../builder/trie.js').Trie} trie
 * @returns {Promise<void>}
 */
async function search(context, trie) {
  const query = getCommandArgs('search', context);
  if (!query) return;

  const queryArray = query.split(/\s+/g);
  if (!isClean(queryArray, trie)) {
    await context.reply('Keep the search clean, shall we? 😉');
    return;
  }

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
  $('.result__title > a').each(function () {
    const text = this.firstChild.data || 'Failed to get title';
    const href = this.attribs.href.replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, '').replace(/&rut=.*$/, '');
    results.push({ text, href: decodeURIComponent(href) });
  });

  // Remove ads
  results = results.filter(({ href }) => !/https:\/\/duckduckgo\.com\/y\.js\?ad_provider=/.test(href));
  // Safer search
  results = cleanFilter(results, trie);
  // Trim to certain length
  results = results.slice(0, SEARCH_LIMIT);

  await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate('search/search.template.hbs', {
      items: results,
      amount: results.length,
      url: decodeURIComponent(requestUrl),
    }),
    { parse_mode: 'HTML', disable_web_page_preview: true },
  );
}

/**
 * Send search result from duckduckgo.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('../../builder/trie.js').Trie} trie
 * @returns {{ command: String, description: String}[]}
 */
export function register(bot, trie) {
  bot.command('search', (context) => search(context, trie));

  return [
    {
      command: 'search',
      description: 'Cari di DuckDuckGo',
    },
  ];
}
