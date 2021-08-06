import { request } from 'undici';
import dayjs from 'dayjs';
import { renderTemplate } from './utils.js';
import redisClient from '../../utlis/redis.js';

/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function covid(context, cache) {
  const redis = redisClient(cache);
  const chatId = context.message.chat.id;
  const re = new RegExp(`^/covid@${context.me}|/covid`);
  const country = context.message?.text?.replace(re, '').trim().toLowerCase() ?? '';

  const [getGlobalData] = await redis.MGET('covid:global');

  if (country) {
    // Build the url
    const url = new URL(country, 'https://corona.lmao.ninja/v2/countries/');
    url.searchParams.append('strict', true);
    url.searchParams.append('yesterday', false);
    url.searchParams.append('query', '');

    const { body, statusCode } = await request(url.toString());
    if (statusCode === 404) {
      await context.telegram.sendMessage(chatId, 'That country name is not valid or does not exists.');
      return;
    }
    const data = await body.json();

    if (!data) {
      return await context.telegram.sendMessage(
        chatId,
        `Data for the <b>${data.country}</b> country is not yet available.`,
        {
          parse_mode: 'HTML',
        },
      );
    }

    // TODO: total dosis vaksin
    await context.telegram.sendMessage(
      chatId,
      renderTemplate('country')({
        date: dayjs(data.updated).format('DD MMMM YYYY'),
        country: data.country,
        confirmed: data.todayCases.toLocaleString('id-ID') ?? 0,
        deaths: data.todayDeaths.toLocaleString('id-ID') ?? 0,
        recovered: data.todayRecovered.toLocaleString('id-ID') ?? 0,
        active: data.active.toLocaleString('id-ID') ?? 0,
      }),
      {
        parse_mode: 'HTML',
      },
    );
    return;
  }

  if (getGlobalData) {
    await context.telegram.sendMessage(chatId, getGlobalData, { parse_mode: 'HTML' });
    return;
  }

  const global = new URL('https://corona.lmao.ninja/v2/all');
  global.searchParams.append('yesterday', false);
  const globalResp = await request(global.toString());
  const globalData = await globalResp.body.json();

  const indonesia = new URL('indonesia', 'https://corona.lmao.ninja/v2/countries/');
  indonesia.searchParams.append('strict', true);
  indonesia.searchParams.append('yesterday', false);
  indonesia.searchParams.append('query', '');
  const indonesiaResp = await request(indonesia.toString());
  const indonesiaData = await indonesiaResp.body.json();

  const preformatMessage = renderTemplate('global')({
    date: dayjs(globalData.updated).format('DD MMMM YYYY'),
    globalConfirmed: globalData.todayCases.toLocaleString('id-ID') ?? 0,
    globalDeaths: globalData.todayDeaths.toLocaleString('id-ID') ?? 0,
    globalRecovered: globalData.todayRecovered.toLocaleString('id-ID') ?? 0,
    indonesiaConfirmed: indonesiaData.todayCases.toLocaleString('id-ID') ?? 0,
    indonesiaDeaths: indonesiaData.todayDeaths.toLocaleString('id-ID') ?? 0,
    indonesiaRecovered: indonesiaData.todayRecovered.toLocaleString('id-ID') ?? 0,
  });

  // TODO: Total dosis vaksin dunia & total dosis vaksin Indonesia
  await context.telegram.sendMessage(chatId, preformatMessage, {
    parse_mode: 'HTML',
  });
  await redis.SETEX('covid:global', 60 * 60 * 6, preformatMessage);
}

/**
 * Send current time.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot, cache) {
  bot.command('covid', (context) => covid(context, cache));

  return [
    {
      command: 'covid',
      description: 'Get covid report from global or specific country.',
    },
  ];
}
