import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import redis from 'redis';
import poll from './services/poll.js';
import help from './services/help.js';
import jam from './services/jam.js';
import logger from './utlis/logger.js';
import dailyQuiz from './services/daily.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envPath });

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = redis.createClient(String(process.env.REDIS_URL));
const mongo = mongoose.createConnection(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
});

bot.on('message', async (context) => {
  try {
    // For poll related
    if (context.message?.poll) {
      await poll(context, cache);
      return;
    }

    // For message related (including /commands@teknologiumumbot)
    if (context.message?.text) {
      if (context.message.text.startsWith('/') && context.message.text.includes(context.me)) {
        const args = context.message.text.slice(1).split(/ +/);
        const commands = args.shift().replace(`@${context.me}`, '').toLowerCase();

        switch (commands) {
          case 'help':
            await help(context);
            break;
          case 'cekjam':
            await jam(context);
            break;
          case 'dailyquiz':
            await dailyQuiz(context, mongo, cache);
            break;
          default:
            context.reply(`Sorry, I can't recognize the command.`);
        }
        return;
      }
      return;
    }
  } catch (error) {
    await context.reply('uh oh, something went wrong. ask the devs to check their logs.');
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
