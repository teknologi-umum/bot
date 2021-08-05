import { generateImage } from './utils.js';

/**
 * Send daily quote.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (context.message.reply_to_message) {
    const code = context.message.reply_to_message.text;

    await context.replyWithPhoto(
      {
        source: await generateImage(code),
      },
      {
        reply_to_message_id: context.message.reply_to_message.message_id,
      },
    );

    // await context.deleteMessage(context.message.reply_to_message.message_id);
  }
}

/**
 * Send daily quote.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('snap', snap);
}
