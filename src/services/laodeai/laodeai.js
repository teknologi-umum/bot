import cheerio from 'cheerio';
import got from 'got';
import { getCommandArgs } from '../../utils/command.js';
import { generateImage } from '../snap/utils.js';

async function laodeai(context) {
  const query = getCommandArgs('laodeai', context);
  if (!query) return;

  // TODO: change this to duckduckgo
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

  // TODO: Change this to search for the supported site url
  // then send a HTTP GET request to it. parsee the HTML body with cheerio.load() once,
  // then send it to the corresponding handler.
  // switch (site url) { case "stackoverflow.com": handler stackoverflow, case "gist.github.com": handler gist, etc }
  // The handler will supposely returns an object with type and content key
  //
  // {
  //   type: 'text' | 'image' | 'error',
  //   content: String,
  // }
  //
  // If it returns "text", limit it with substring(0, 500), and send the link to it if the length > 500
  // If it returns "image", generate it with Carbonara.
  // If it returns "error", means no answer was found.
  //
  // Hell of a work to make an AI lmao.
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
  console.log($('.accepted-answer').html());
  const code = $('.accepted-answer pre').text();

  // If there is no code given, will give the test result
  if (!code) {
    let textAnswer = $('.accepted-answer .answercell .s-prose').text();
    if (textAnswer.length > 500) textAnswer = textAnswer.substring(textAnswer);
    await context.reply(textAnswer);
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
