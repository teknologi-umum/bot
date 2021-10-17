import { renderTemplate } from '../../utils/template.js';
import got from 'got';
import { SingleValueCache } from '../../utils/cache.js';

// cache TTL : 30 minutes
const cacheTtl = 30 * 60 * 1000;

// value cache
const cache = new SingleValueCache(cacheTtl);

/**
 * Send memes..
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */

async function news(context, cache) {
  const cachedResult = await cache.getOrCreate(async () => {
    const { code, data } = await got.get('https://berita-indo-api.vercel.app/v1/cnn-news').json();
    return {
      data: data.slice(0, 15).map(({ title, link, contentSnippet }) => ({ title, link, contentSnippet })),
      code,
    };
  });

  if (cachedResult.code !== 200) {
    context.telegram.sendMessage(context.message.chat.id, 'Gagal mendapatkan berita');
  }

  context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate('news/news.template.hbs', {
      data: cachedResult.data,
    }),
    { parse_mode: 'HTML', disable_web_page_preview: true },
  );
}

export function register(bot) {
  bot.command('news', (context) => news(context, cache));

  return [
    {
      command: 'news',
      description: 'Memberikan berita terbaru',
    },
  ];
}
