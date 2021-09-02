import cheerio from 'cheerio';
import got from 'got';
import { getCommandArgs } from '../../utils/command.js';
import { cleanURL, fetchDDG } from '../../utils/http.js';
import { generateImage } from '../snap/utils.js';
import { stackoverflow } from './stackoverflow.js';
import { gist } from './gist.js';
import { wikipedia } from './wikipedia.js';

// list of handlers, also used to filter valid sites
const VALID_SOURCES = {
  'stackoverflow.com': stackoverflow,
  'gist.github.com': gist,
  'wikipedia.com': wikipedia,
};

/**
 * @param {import('telegraf').Telegraf} context
 * @returns {Promise<void>}
 */
async function laodeai(context) {
  const query = getCommandArgs('laodeai', context);
  if (!query) return;

  const { body: ddgBody, statusCode: ddgStatusCode } = await fetchDDG(got, query);

  if (ddgStatusCode !== 200) {
    await context.reply('Error getting search result.');
    return;
  }

  const $ = cheerio.load(ddgBody);
  const validSources = $('.web-result')
    .map((_, el) => {
      const $$ = cheerio.load($.html(el));
      const href = cleanURL($$('.result__title > a').first().attr('href'));
      return new URL(decodeURIComponent(href));
    })
    .get()
    .filter((url) => VALID_SOURCES[url.hostname]);

  if (validSources.length < 1) {
    await context.reply('Error getting search result.');
    return;
  }

  const results = await Promise.all(
    validSources.map(async (url) => {
      const { body, statusCode } = await got.get(url.href, {
        headers: {
          Accept: 'text/html',
        },
        responseType: 'text',
      });
      if (statusCode !== 200) return null;

      return { url: url.href, ...VALID_SOURCES[url.hostname](cheerio.load(body)) };
    }),
  );

  // TODO(elianiva): ideally we should send all of them instead of picking the
  //                 first one
  const result = results[0];

  switch (result.type) {
    case 'image': {
      await context.telegram.sendPhoto(context.message.chat.id, {
        source: await generateImage(result.content, context.message.from.username),
      });
      break;
    }
    case 'text': {
      let content = result.content;
      if (content.length > 500) {
        content = `${content.substring(0, 500)}...\nSee more on ${result.url}`;
      }
      await context.telegram.sendMessage(context.message.chat.id, result.content);
      break;
    }
    case 'error': {
      throw new Error('LaodeAI handler error');
    }
  }
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
