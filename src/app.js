import { memoryUsage } from 'process';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import redis from 'redis';

import { sentry, terminal } from './utils/logger.js';
import { pathTo } from './utils/path.js';

import * as poll from './services/poll.js';
import * as meme from './services/meme.js';
import * as help from './services/help.js';
import * as quote from './services/quote.js';
import * as covid from './services/covid.js';
import * as snap from './services/snap.js';
import * as blidingej from './services/bliding-ej.js';
import * as evalBot from './services/eval.js';
import * as blog from './services/blog.js';
import * as quiz from './services/quiz.js';
import * as search from './services/search.js';
import * as dukun from './services/dukun/dukun.js';
import * as laodeai from './services/laodeai/laodeai.js';

dotenv.config({ path: pathTo(import.meta.url, '../.env') });

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = redis.createClient(String(process.env.REDIS_URL));
const mongo = mongoose.createConnection(String(process.env.MONGO_URL), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

async function main() {
  const commands = [
    meme.register(bot, cache),
    help.register(bot),
    quote.register(bot),
    covid.register(bot, cache),
    poll.register(bot, cache),
    snap.register(bot),
    blidingej.register(bot),
    evalBot.register(bot),
    blog.register(bot, cache),
    quiz.register(bot, mongo, cache),
    search.register(bot, mongo),
    dukun.register(bot, mongo, cache),
    laodeai.register(bot),
  ]
    .filter((v) => Array.isArray(v))
    .flat();

  bot.telegram.setMyCommands(commands);

  bot.catch((error, context) => {
    sentry.captureException(error, (scope) => {
      scope.setContext('chat', {
        chat_id: context.message.chat.id,
        chat_title: context.message.chat.title,
        chat_type: context.message.chat.type,
        chat_username: context.message.chat.username,
        text: context.message.text,
        update_type: context.updateType,
      });
      scope.setContext('from', {
        from_id: context.message.from.id,
        from_username: context.message.from.username,
        is_bot: context.message.from.is_bot,
        from_name: `${context.message.from.first_name} ${context.message.from.last_name}`,
      });
      scope.setTags({
        chat_id: context.message.chat.id,
        from_id: context.message.from.id,
        from_username: context.message.from.username,
      });
      return scope;
    });
    if (process.env.NODE_ENV !== 'production') terminal.error(error);
    context.reply('uh oh, something went wrong. ask the devs to check their logs.');
  });

  // For more information about what this is, please refer to:
  // https://nodejs.org/api/process.html#process_process_memoryusage
  terminal.log(
    `Heap total: ${memoryUsage().heapTotal / 1000000} MB. Heap used: ${
      memoryUsage().heapUsed / 1000000
    } MB. Resident Set Size: ${memoryUsage().rss / 1000000} MB.`,
  );

  terminal.info('Launching bot..');
  await bot.launch();
}

main();

function terminate(caller) {
  cache.QUIT();
  return bot.stop(caller);
}

// Enable graceful stop
process.once('SIGINT', () => terminate('SIGINT'));
process.once('SIGTERM', () => terminate('SIGTERM'));
