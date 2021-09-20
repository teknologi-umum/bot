import { getCommandArgs } from '#utils/command.js';
import { makeRequest, PASTEBIN_FILE_TOO_BIG } from '../pastebin/index.js';
import { ERR_INVALID_LANGUAGE, generateImage } from './utils.js';

/**
 * Snap a text code to a carbon image.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (!context.message.reply_to_message) return;

  const replyMessage = context.message.reply_to_message;
  const isOwner = context.message.from.id === replyMessage.from.id;
  const isPrivateChat = context.chat.type === 'private';

  if (!replyMessage.text) {
    await context.reply('`/snap` can only be used on plain texts', { parse_mode: 'MarkdownV2' });
    return;
  }

  /** @type {String} code */
  const code = replyMessage.text;
  const tooLong = code.length > 3000 || code.split('\n').length > 190;
  const mentionUser = replyMessage.from.username
    ? `@${replyMessage.from.username}`
    : `${replyMessage.from.first_name} ${replyMessage.from?.last_name ?? ''}`;
  const fullCode = tooLong ? await makeRequest(code) : false;

  const lang = getCommandArgs('snap', context);
  try {
    const image = await generateImage(code.substring(0, 3000), lang.split(' ')[0]);
    await context.telegram.sendPhoto(
      context.message.chat.id,
      { source: image },
      {
        caption: `${isOwner ? '' : mentionUser + ' '}${
          fullCode === PASTEBIN_FILE_TOO_BIG
            ? 'Code is bigger than 512 KB, please upload the complete code yourself.'
            : fullCode
            ? `Full code on: ${fullCode}`
            : ''
        }`,
        reply_to_message_id: !isOwner && replyMessage.message_id,
      },
    );

    if (!isPrivateChat) {
      // Snap message
      await context.deleteMessage(context.message.message_id);

      if (isOwner) {
        // Target message to snap
        await context.deleteMessage(replyMessage.message_id);
      }
    }
  } catch (err) {
    // Handle specific error message
    if (err === ERR_INVALID_LANGUAGE) {
      await context.telegram.sendMessage(context.message.chat.id, err, { parse_mode: 'MarkdownV2' });
      return;
    }
    return Promise.reject(err);
  }
}

/**
 * Send code screenshot.
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
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
