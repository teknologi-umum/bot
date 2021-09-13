import cheerio from 'cheerio';
import got from 'got';
import { getCommandArgs } from '#utils/command.js';
import { cleanURL, fetchDDG } from '#utils/http.js';
import { sanitize } from '#utils/sanitize.js';
import { generateImage } from '../snap/utils.js';
import { makeRequest } from '../pastebin/index.js';
import { stackoverflow } from './handlers/stackoverflow.js';
import { gist } from './handlers/gist.js';
import { wikipedia } from './handlers/wikipedia.js';
import { wikihow } from './handlers/wikihow.js';
import { stackexchange } from './handlers/stackexchange.js';
import { foodnetwork } from './handlers/foodnetwork.js';
import { knowyourmeme } from './handlers/knowyourmeme.js';
import { urbandictionary } from './handlers/urbandictionary.js';

// list of handlers, also used to filter valid sites
const VALID_SOURCES = {
  'stackoverflow.com': stackoverflow,
  'gist.github.com': gist,
  'en.wikipedia.org': wikipedia,
  'wikihow.com': wikihow,
  'foodnetwork.com': foodnetwork,
  'serverfault.com': stackexchange,
  'superuser.com': stackexchange,
  'askubuntu.com': stackexchange,
  'mathoverflow.net': stackexchange,
  // I know this is kind of dumb, so..
  // FIXME: Use regexp! Or not, I don't know which is better
  'gamedev.stackexchange.com': stackexchange,
  'gaming.stackexchange.com': stackexchange,
  'webapps.stackexchange.com': stackexchange,
  'photo.stackexchange.com': stackexchange,
  'stats.stackexchange.com': stackexchange,
  // For weebs out there
  'anime.stackexchange.com': stackexchange,
  'japanese.stackexchange.com': stackexchange,
  // Ok lets get back to normal people
  'cooking.stackexchange.com': stackexchange,
  'webmasters.stackexchange.com': stackexchange,
  'english.stackexchange.com': stackexchange,
  'math.stackexchange.com': stackexchange,
  'apple.stackexchange.com': stackexchange,
  'diy.stackexchange.com': stackexchange,
  'ux.stackexchange.com': stackexchange,
  'cstheory.stackexchange.com': stackexchange,
  'money.stackexchange.com': stackexchange,
  'softwareengineering.stackexchange.com': stackexchange,
  'scifi.stackexchange.com': stackexchange,
  'workplace.stackexchange.com': stackexchange,
  'security.stackexchange.com': stackexchange,
  'worldbuilding.stackexchange.com': stackexchange,
  'literature.stackexchange.com': stackexchange,
  'rpg.stackexchange.com': stackexchange,
  'academia.stackexchange.com': stackexchange,
  'electronics.stackexchange.com': stackexchange,
  'retrocomputing.stackexchange.com': stackexchange,
  'puzzling.stackexchange.com': stackexchange,
  'travel.stackexchange.com': stackexchange,
  'graphicdesign.stackexchange.com': stackexchange,
  'networkengineering.stackexchange.com': stackexchange,
  'islam.stackexchange.com': stackexchange,
  'dba.stackexchange.com': stackexchange,
  'knowyourmeme.com': knowyourmeme,
  'urbandictionary.com': urbandictionary,
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
      const href = cleanURL($(el).find('.result__title > a').first().attr('href'));
      return new URL(decodeURIComponent(href));
    })
    .get()
    .filter((url) => VALID_SOURCES[url.hostname.replace('www.', '')]);

  if (validSources.length < 1) {
    await context.reply("Uhh, I don't have an answer for that, sorry.");
    return;
  }

  const result = await goThroughURLs(validSources);

  switch (result.type) {
    case 'image': {
      const tooLong = result.content.length > 3000 || result.content.split('\n').length > 190;
      const fullCode = tooLong ? await makeRequest(result.content) : false;
      await context.telegram.sendPhoto(
        context.message.chat.id,
        {
          source: await generateImage(result.content.substring(0, 3000), context.message.from.username),
        },
        {
          caption: tooLong ? `Read more on: ${fullCode || result.url}` : '',
        },
      );
      break;
    }
    case 'text': {
      let content = result.content;
      if (content.length > 500) {
        content = `${sanitize(content.substring(0, 500))}...\n\nSee more on: ${result.url}`;
      }

      await context.telegram.sendMessage(context.message.chat.id, content, { parse_mode: 'HTML' });
      break;
    }
    case 'error': {
      await context.telegram.sendMessage(context.message.chat.id, "I can't find the proper answer for that, sorry.", {
        parse_mode: 'HTML',
      });
      break;
    }
  }
}

/**
 * Literally will go through URLs
 * @param {URL[]} validSources
 * @returns {Promise<{ url: string, type: 'image' | 'text', content: string } | { type: 'error' }>}
 */
async function goThroughURLs(validSources) {
  for (let i = 0; i < validSources.length; i++) {
    const url = validSources[i];
    const { body, statusCode } = await got.get(url.href, {
      headers: {
        Accept: 'text/html',
      },
      responseType: 'text',
      throwHttpErrors: false,
      timeout: {
        request: 15_000,
      },
    });

    if (statusCode !== 200) {
      continue;
    }

    const urlResult = { url: url.href, ...VALID_SOURCES[url.hostname.replace('www.', '')](cheerio.load(body)) };

    if (urlResult.type === 'error') {
      if (i === validSources.length - 1) {
        // Just give up man
        return { type: 'error' };
      }
      continue;
    } else {
      return urlResult;
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
