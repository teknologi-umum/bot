import dayjs from 'dayjs';

/**
 * Send current time.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function time(context) {
  await context.reply('Disini sekarang jam: ' + dayjs().toString());
}

/**
 * Send current time.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('now', time);
}
