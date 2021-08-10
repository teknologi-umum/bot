import redisClient from '../../utils/redis.js';
import { getTheDevRead } from './request.js';
import { randomArray, renderTemplate } from './utils.js';
import { getCommandArgs } from '../../utils/command.js';

const WHITELIST = ['javascript', 'php', 'go', 'c', 'typescript', 'python'];

/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function devRead(context, cache) {
  const redis = redisClient(cache);

  /**
   * @type {String}
   */
  let query = getCommandArgs('devread', context);

  if (!query) {
    await context.telegram.sendMessage(
      context.message.chat.id,
      'Cara pakainya ketik: /devread &lt;apa yang mau kamu cari&gt;\n\nContoh: <code>/devread javascript</code>',
      { parse_mode: 'HTML' },
    );
    return;
  }

  if (WHITELIST.includes(query.toLowerCase())) {
    // Check if the data exists in redis
    const [queryData] = await redis.MGET([`devread:${encodeURI(query.toLowerCase())}`]);

    if (queryData) {
      const items = randomArray(JSON.parse(queryData), 3);
      const read = items.map(({ title, body, url }) => renderTemplate({ title, body, url })).join('\n');
      await context.telegram.sendMessage(context.message.chat.id, read, { parse_mode: 'HTML' });
      return;
    }
  }

  // It's not WHITELISTed OR it's not on redis, then we fetch the data
  const data = await getTheDevRead(query.toLowerCase());

  if (!data.length) {
    await context.telegram.sendMessage(context.message.chat.id, 'Yha ga ketemu, cari keyword lain yuk');
    return;
  }

  const items = randomArray(data, 3);
  const read = items.map((x) => renderTemplate({ title: x.title, body: x.body, url: x.url })).join('\n');

  await context.telegram.sendMessage(context.message.chat.id, read, { parse_mode: 'HTML' });

  // Cache the result in redis for 6 hours
  // First we filter it first, we don't want too much data stored in redis
  const filteredData = data.map(({ title, body, url }) => ({
    title: title ? (title.length > 50 ? title.substr(0, 49) + '...' : title) : title,
    body: body ? (body.length > 300 ? body.substr(0, 299) + '...' : body) : body,
    url,
  }));
  await redis.SETEX(`devread:${encodeURI(query.toLowerCase())}`, 60 * 60 * 6, JSON.stringify(filteredData));
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot, cache) {
  bot.command('devread', (context) => devRead(context, cache));

  return [
    {
      command: 'devread',
      description: 'Bacaan untuk Developer.',
    },
  ];
}
