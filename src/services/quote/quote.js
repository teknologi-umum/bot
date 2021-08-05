import { getRandomQuote } from './utils.js';

/**
 * Send meme.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
export async function handleContext(context) {
  const chatId = context.message.chat.id;
  const message = await getRandomQuote();

  await context.telegram.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

export const command = 'quote';
