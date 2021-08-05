import { request } from 'undici';
import dayjs from 'dayjs';
import { fetchCountries, renderTemplate } from './utils.js';
import redisClient from '../../utlis/redis.js';

/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function covid(context, cache) {
  const redis = redisClient(cache);
  const chatId = context.message.chat.id;
  const country = context.message?.text?.replace('/covid', '').replace(' ', '').toLowerCase() ?? '';

  const date = dayjs().format('DD MMMM YYYY');

  const [getGlobalData, getCountrySlugs] = await redis.MGET('covid:global', 'covid:countries');

  if (country) {
    const countries = JSON.parse(getCountrySlugs) ?? (await fetchCountries(redis));
    const parsedCountry =
      countries.find(
        (o) =>
          o['ISO2'].toLowerCase().includes(country) ||
          o['Country'].toLowerCase().includes(country) ||
          o['Slug'].toLowerCase().includes(country),
      ) ?? '';

    // Build the url
    const url = new URL(parsedCountry['Slug'], 'https://api.covid19api.com/country/');
    url.searchParams.append('from', dayjs().subtract(2, 'day').toISOString());
    url.searchParams.append('to', dayjs().subtract(1, 'day').toISOString());

    const { body, statusCode } = await request(url.toString());
    if (statusCode === 404) {
      await context.telegram.sendMessage(chatId, 'That country name is not valid or does not exists.');
      return;
    }
    const data = (await body.json())[0];

    // TODO: total dosis vaksin
    await context.telegram.sendMessage(
      chatId,
      renderTemplate('country')({
        date,
        country: parsedCountry['Country'],
        confirmed: data['Confirmed'].toLocaleString('id-ID') ?? 0,
        deaths: data['Deaths'].toLocaleString('id-ID') ?? 0,
        recovered: data['Recovered'].toLocaleString('id-ID') ?? 0,
        active: data['Active'].toLocaleString('id-ID') ?? 0,
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

  const url = new URL('https://api.covid19api.com/summary');
  const { body } = await request(url.toString());
  const data = await body.json();

  const indonesia = data['Countries'].find((o) => o.CountryCode === 'ID');
  const preformatMessage = renderTemplate('global')({
    date,
    globalConfirmed: data['Global']['NewConfirmed'].toLocaleString('id-ID') ?? 0,
    globalDeaths: data['Global']['NewDeaths'].toLocaleString('id-ID') ?? 0,
    globalRecovered: data['Global']['NewRecovered'].toLocaleString('id-ID') ?? 0,
    indonesiaConfirmed: indonesia['NewConfirmed'].toLocaleString('id-ID') ?? 0,
    indonesiaDeaths: indonesia['NewDeaths'].toLocaleString('id-ID') ?? 0,
    indonesiaRecovered: indonesia['NewRecovered'].toLocaleString('id-ID') ?? 0,
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
  bot.command('covid', async (context) => await covid(context, cache));
}
