import got from 'got';
import { randomNumber } from 'carret';
import { defaultHeaders } from '../../utils/http.js';
import redisClient from '../../utils/redis.js';
import { isBigGroup } from '../../utils/home.js';
import { logger } from '#utils/logtail.js';

/**
 * Send memes..
 * @param {import('telegraf').Telegraf} bot
 * @param {import('redis').RedisClient} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, cache) {
  const redis = new redisClient(cache);

  bot.command('kktbsys', async (context) => {
    const bigGroup = await isBigGroup(context);
    if (bigGroup) return;
    await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/XtSbXBT/image.png');
    await logger.fromContext(context, 'kktbsys', { sendText: `https://i.ibb.co/XtSbXBT/image.png` });
  });

  bot.command('illuminati', async (context) => {
    const bigGroup = await isBigGroup(context);
    if (bigGroup) return;
    await context.telegram.sendAnimation(
      context.message.chat.id,
      'https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif',
    );
    await logger.fromContext(context, 'illuminati', {
      sendText: `https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif`,
    });
  });

  bot.command('yntkts', async (context) => {
    const bigGroup = await isBigGroup(context);
    if (bigGroup) return;
    await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/P1Q0650/yntkts.jpg');
    await logger.fromContext(context, 'yntkts', { sendText: `https://i.ibb.co/P1Q0650/yntkts.jpg` });
  });

  bot.command('homework', async (context) => {
    const bigGroup = await isBigGroup(context);
    if (bigGroup) return;
    await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/541knqp/photo-2021-08-21-02-54-24.jpg');
    await logger.fromContext(context, 'homework', {
      sendText: `https://i.ibb.co/541knqp/photo-2021-08-21-02-54-24.jpg`,
    });
  });

  bot.command('joke', async (context) => {
    const bigGroup = await isBigGroup(context);
    if (bigGroup) return;
    let total = await redis.GET('jokes:total');

    if (!total) {
      const { body } = await got.get('https://jokesbapak2.herokuapp.com/v1/total', {
        headers: defaultHeaders,
        responseType: 'json',
        timeout: {
          request: 10_000,
        },
        retry: {
          limit: 3,
        },
      });

      await redis.SETEX('jokes:total', 60 * 60 * 12, Number.parseInt(body.message));
      total = Number.parseInt(body.message);
    }

    const id = randomNumber(0, total);

    await context.telegram.sendPhoto(context.message.chat.id, `https://jokesbapak2.herokuapp.com/v1/id/${id}`);
    await logger.fromContext(context, 'joke', { sendText: `https://jokesbapak2.herokuapp.com/v1/id/${id}` });
  });

  return [
    {
      command: 'joke',
      description: 'Get random jokes bapack2.',
    },
    {
      command: 'kktbsys',
      description: 'Kenapa kamu tanya begitu, siapa yang suruh?',
    },
    {
      command: 'yntkts',
      description: 'Yo ndak tahu! Kok tanya saya.',
    },
    {
      command: 'homework',
      description: 'Ini PR ya ngab?',
    },
    {
      command: 'illuminati',
      description: "Please don't.",
    },
  ];
}
