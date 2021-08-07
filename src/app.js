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
import * as evalBot from './services/eval.js';
import * as qr from './services/qr.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envPath });

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = redis.createClient(String(process.env.REDIS_URL));

const commands = [
  meme.register(bot),
  time.register(bot),
  help.register(bot),
  quote.register(bot),
  covid.register(bot, cache),
  poll.register(cache, bot),
  snap.register(bot),
  blidingej.register(bot),
  evalBot.register(bot),
  qr.register(bot),
]
  .filter((v) => Array.isArray(v))
  .flat();

bot.telegram.setMyCommands(commands);

// TODO: Handle command not found

bot.catch((error, context) => {
  logger.captureException(error, (scope) => {
    scope.clear();
    scope.setTag('chat_id', context.message.chat.id);
    scope.setTag('chat_title', context.message.chat.title);
    scope.setTag('chat_type', context.message.chat.type);
    scope.setTag('text', context.message.text);
    scope.setTag('from_id', context.message.from.id);
    scope.setTag('from_username', context.message.from.username);
    scope.setTag('from_is_bot', context.message.from.is_bot);
    return scope;
  });
  context.reply('uh oh, something went wrong. ask the devs to check their logs.');
});

bot.launch();

function terminate(caller) {
  cache.QUIT();
  return bot.stop(caller);
}

// Enable graceful stop
process.once('SIGINT', () => terminate('SIGINT'));
process.once('SIGTERM', () => terminate('SIGTERM'));
