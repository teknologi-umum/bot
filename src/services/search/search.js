import mongoose from 'mongoose';
import cheerio from 'cheerio';
import got from 'got';
import { renderTemplate } from '../../utils/template.js';
import { getCommandArgs } from '../../utils/command.js';
import redisClient from '../../utils/redis.js';
import { isClean, cleanFilter } from './filter.js';

const SEARCH_LIMIT = 10;

const safeWordSchema = new mongoose.Schema(
  {
    type: String,
    language: String,
    value: String,
  },
  { collection: 'badstuff' },
);

/**
 * @param {import('telegraf').Telegraf} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('redis').RedisClient} cache
 */
async function search(context, mongo, cache) {
  const query = getCommandArgs('search', context);
  if (!query) return;

  const redis = redisClient(cache);
  let safeWordsList = await redis.GET('search:safewords');
  if (!safeWordsList) {
    const SafeWords = mongo.model('SafeWords', safeWordSchema, 'badstuff');
    const safeWordsFromDB = await SafeWords.find({});
    safeWordsList = JSON.stringify(safeWordsFromDB.map((o) => o.value));
    await redis.MSET('search:safewords', safeWordsList);
  }

  if (!isClean(query, JSON.parse(safeWordsList))) {
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
    const text = this.firstChild.data;
    const href = this.attribs.href.replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, '').replace(/&rut=.*$/, '');
    results.push({ text, href: decodeURIComponent(href) });
  });

  // Remove ads
  results = results.filter(({ href }) => !/https:\/\/duckduckgo\.com\/y\.js\?ad_provider=/.test(href));
  // Safer search
  results = cleanFilter(results, JSON.parse(safeWordsList));
  // Trim to certain length
  results = results.slice(0, SEARCH_LIMIT);

  await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate('search/search.template.hbs', {
      items: results,
      amount: results.length,
      url: decodeURIComponent(requestUrl),
    }),
    { parse_mode: 'HTML' },
  );
}

/**
 * Send search result from duckduckgo.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').}
 * @returns {Promise<void>}
 */
export function register(bot, mongo, cache) {
  bot.command('search', (context) => search(context, mongo, cache));

  return [
    {
      command: 'search',
      description: 'Cari di DuckDuckGo',
    },
  ];
}
