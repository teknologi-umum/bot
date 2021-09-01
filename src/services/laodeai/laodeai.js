import cheerio from 'cheerio';
import got from 'got';
import { getCommandArgs } from '../../utils/command.js';
import { generateImage } from '../snap/utils.js';

async function laodeai(context) {
  const query = getCommandArgs('laodeai', context);
  if (!query) return;

  // see https://api.stackexchange.com/docs/search
  const { body: apiBody, statusCode: apiStatusCode } = await got.get('https://api.stackexchange.com/2.3/search', {
    searchParams: {
      order: 'desc',
      sort: 'relevance',
      intitle: query,
      site: 'stackoverflow',
    },
    headers: {
      Accept: 'application/json',
    },
  });

  if (apiStatusCode !== 200) {
    await context.reply('Error getting search result.');
    return;
  }

  const response = JSON.parse(apiBody);

  if (response.items.length < 1) {
    await context.reply(`No result for ${query}`);
    return;
  }

  const answer_id = response.items[0].accepted_answer_id;
  const { body: htmlBody, statusCode: htmlStatusCode } = await got.get(`https://stackoverflow.com/a/${answer_id}`, {
    headers: {
      Accept: 'text/html',
    },
  });

  if (htmlStatusCode !== 200) {
    await context.reply('Error getting search result.');
    return;
  }

  const $ = cheerio.load(htmlBody);
  const code = $('.accepted-answer pre').text();

  if (!code) {
    await context.reply(`No code result for ${query}`);
    return;
  }

  await context.telegram.sendPhoto(context.message.chat.id, {
    source: await generateImage(code, context.message.from.username),
  });
}

/**
 * Find code from stackoverflow
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @returns {{ command: String, description: String}[]}
 */
export function register(bot) {
  bot.command('laodeai', (context) => laodeai(context));

  return [
    {
      command: 'laodeai',
      description: 'Cari di StackOverFlow',
    },
  ];
}
