import cheerio from 'cheerio';
import got from 'got';
import { renderTemplate } from '../../utils/template.js';
import { getCommandArgs } from '../../utils/command.js';
import { isClean, cleanFilter } from './filter.js';

const SEARCH_LIMIT = 10;
const BEST = 2;

/**
 * @param {import('telegraf').Telegraf} context
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<void>}
 */
async function search(context, mongo) {
  const query = getCommandArgs('search', context);
  if (!query) return;

  const clean = await isClean(query, mongo);
  if (!clean) {
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

  let items = $('.web-result')
    .map((_, el) => {
      const $$ = cheerio.load($.html(el));
      const title = $$('.result__title > a').first().text() || 'Failed to get title';
      const href = decodeURIComponent(
        $$('.result__title > a')
          .first()
          .attr('href')
          .replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, '')
          .replace(/&rut=.*$/, ''),
      );
      const snippet = $$('.result__snippet')
        .map((_, el) => el.children.map((x) => $.html(x)).join(''))
        .get();

      return { title, href, snippet };
    })
    .get();

  // Safer search
  items = await cleanFilter(items, mongo);
  // Trim to certain length
  items = items.slice(0, SEARCH_LIMIT + BEST);

  await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate('search/search.template.hbs', {
      items,
      query,
      url: decodeURIComponent(requestUrl),
      bestAmount: BEST,
    }),
    { parse_mode: 'HTML', disable_web_page_preview: true },
  );
}

/**
 * Send search result from duckduckgo.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @returns {{ command: String, description: String}[]}
 */
export function register(bot, mongo) {
  bot.command('search', (context) => search(context, mongo));

  return [
    {
      command: 'search',
      description: 'Cari di DuckDuckGo',
    },
  ];
}
