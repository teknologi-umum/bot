import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import redis from 'redis';

import logger from './utlis/logger.js';

import * as poll from './services/poll.js';
import * as meme from './services/meme.js';
import * as time from './services/time.js';
import * as help from './services/help.js';
import * as quote from './services/quote.js';
import * as covid from './services/covid.js';
import * as snap from './services/snap.js';
import * as blidingej from './services/bliding-ej.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envPath });

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = redis.createClient(String(process.env.REDIS_URL));

async function main() {
  try {
    const commands = [
      poll.register(cache, bot),
      meme.register(bot),
      time.register(bot),
      help.register(bot),
      quote.register(bot),
      covid.register(bot, cache),
      snap.register(bot),
      blidingej.register(bot),
    ]
      .filter((v) => Array.isArray(v))
      .flat();

    await bot.telegram.setMyCommands(commands);
    await bot.launch();
  } catch (error) {
    logger.captureException(error, scope => {
      scope.clear();
      scope.setTag('chat_id', bot.context?.message?.chat?.id ?? '');
      scope.setTag('chat_title', bot.context?.message?.chat?.title ?? '');
      scope.setTag('chat_type', bot.context?.message?.chat?.type ?? '');
      scope.setTag('chat_text', bot.context?.message?.text ?? '');
      return scope;
    });
    bot.context.reply('uh oh, something went wrong. ask the devs to check their logs.')
  }
}

main();

function terminate(caller) {
  cache.QUIT();
  return bot.stop(caller);
}

// Enable graceful stop
process.once('SIGINT', () => terminate('SIGINT'));
process.once('SIGTERM', () => terminate('SIGTERM'));
