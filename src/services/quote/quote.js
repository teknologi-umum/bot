import { getRandomQuote } from './utils.js';

/**
 * Send meme.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function handleCommand(context) {
  const chatId = context.message.chat.id;
  const message = await getRandomQuote();

  await context.telegram.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/**
 * Send meme.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('quote', handleCommand);
}
