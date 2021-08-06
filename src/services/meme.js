/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */

import { request } from 'undici';
import { randomNumber } from 'carret';

export function register(bot) {
  bot.command('kktbsys', async (context) => {
    await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/XtSbXBT/image.png');
  });

  bot.command('illuminati', async (context) => {
    await context.telegram.sendAnimation(
      context.message.chat.id,
      'https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif',
    );
  });

  bot.command('yntkts', async (context) => {
    await context.telegram.sendPhoto(context.message.chat.id, 'https://i.ibb.co/P1Q0650/yntkts.jpg');
  });

  bot.command('joke', async (context) => {
    // TODO: Centralize the frequently usage variable
    const api = 'https://jokesbapak2.herokuapp.com/v1';
    const { body } = await request(`${api}/total`);

    const total = parseInt((await body.json()).message);
    const id = randomNumber(0, total);

    await context.telegram.sendPhoto(context.message.chat.id, `${api}/id/${id}`);
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
      command: 'illuminati',
      description: "Please don't.",
    },
  ];
}
