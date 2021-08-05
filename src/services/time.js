import dayjs from 'dayjs';

async function time(context) {
  await context.reply('Disini sekarang jam: ' + dayjs().toString());
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('now', time);
}
