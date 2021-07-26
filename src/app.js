import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import redis from 'redis';
import poll from './services/poll.js';
import logger from './utlis/logger.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envPath });

const bot = new Telegraf(process.env.BOT_TOKEN);

const cache = redis.createClient(String(process.env.REDIS_URL));

bot.on('message', async (context) => {
  try {
    if (context.message?.poll) {
      await poll(context, cache);
    }
  } catch (error) {
    await context.reply('uh oh, something went wrong. ask the devs to check their logs');
    logger.captureException(error);
  }
});

bot.launch();

function terminate(caller) {
  cache.QUIT();
  return bot.stop(caller);
}

// Enable graceful stop
process.once('SIGINT', () => terminate('SIGINT'));
process.once('SIGTERM', () => terminate('SIGTERM'));
