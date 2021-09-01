import cheerio from 'cheerio';
import got from 'got';
import { getCommandArgs } from '../../utils/command.js';
import { generateImage } from '../snap/utils.js';
import { stackoverflow } from './stackoverflow.js';
import { gist } from './gist.js';
import { wikipedia } from './wikipedia.js';

// list handlers
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

  // TODO(elianiva): probably extract this logic somewhere? since we're also using it for `/search`
  const { body: ddgBody, statusCode: ddgStatusCode } = await got.get('https://html.duckduckgo.com/html/', {
    searchParams: {
      kp: 1, // safe search // 1: strict | -1: moderate | 2: off
      q: query,
    },
    headers: {
      Accept: 'text/html',
    },
    responseType: 'text',
  });

  if (ddgStatusCode !== 200) {
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
  const $ = cheerio.load(ddgBody);

  // TODO(elianiva): how to handle multiple results???
  const validSources = $('.web-result')
    .map((_, el) => {
      const $$ = cheerio.load($.html(el));

      // TODO(elianiva): it's duplicate from `/search`, should probably extract
      //                 this into a reusable util
      const href = $$('.result__title > a')
        .first()
        .attr('href')
        .replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, '')
        .replace(/&rut=.*$/, '');

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

      return VALID_SOURCES[url.hostname](cheerio.load(body));
    }),
  );

  // TODO(elianiva): ideally we should send all of them instead of picking the
  //                 first one
  const result = results[0];

  if (result.type === 'image') {
    await context.telegram.sendPhoto(context.message.chat.id, {
      source: await generateImage(result.content, context.message.from.username),
    });
    return;
  }

  // TODO(elianiva): limit to 500 words
  if (result.type === 'text') {
    await context.telegram.sendMessage(context.message.chat.id, result.content);
  }

  if (result.type === 'error') {
    // TODO(elianiva): handle error properly.
    //                 throw so the error handler triggers?
    //                 sendMessage so the user knows?
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
