import { generateImage } from './utils.js';

/**
 * Send daily quote.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const code = replyMessage.text;

    await context.replyWithPhoto(
      {
        source: await generateImage(code),
      },
      {
        caption: replyMessage.from.username
          ? `@${replyMessage.from.username}`
          : `${replyMessage.from.first_name} ${replyMessage.from.last_name}`,
      },
    );

    // Snap message
    await context.deleteMessage(context.message.message_id);

    if (context.message.from.id === replyMessage.from.id) {
      // Target message to snap
      await context.deleteMessage(replyMessage.message_id);
    }
  }
}

/**
 * Send daily quote.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('snap', snap);

  return [
    {
      command: 'snap',
      description: 'Screenshot the code in the reply message.',
    },
  ];
}
