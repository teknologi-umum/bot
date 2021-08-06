import { generateImage } from './utils.js';

/**
 * Send daily quote.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const isOwner = context.message.from.id === replyMessage.from.id;
    const code = replyMessage.text;

    await context.replyWithPhoto(
      {
        source: await generateImage(code),
      },
      {
        caption: replyMessage.from.username
          ? `@${replyMessage.from.username}`
          : `${replyMessage.from.first_name} ${replyMessage.from.last_name}`,
        reply_to_message_id: !isOwner && replyMessage.message_id,
      },
    );

    // Snap message
    await context.deleteMessage(context.message.message_id);

    if (isOwner) {
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
