import { getRandomQuote } from './utils.js';

/**
 * Send daily quote.
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
 * Send daily quote.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('quote', handleCommand);

  return [
    {
      command: 'quote',
      description: 'Get random quote from great people.',
    },
  ];
}
