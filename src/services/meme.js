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
    let apis = "https://jokesbapak2.herokuapp.com/v1/total"; 
    let total = parseInt((await request(apis + "/total")
     .then(res => res.json())).message);
    let uid = randomNumber(0, total).toString();
    await context.telegram.sendPhoto(context.message.chat.id, 'https://jokesbapak2.herokuapp.com/v1/id/'+ uid);
  });
}
