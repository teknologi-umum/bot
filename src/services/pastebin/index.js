import got from 'got';
import { defaultHeaders } from '../../utils/http.js';
import { sizeInBytes } from '../../utils/size.js';

/**
 *
 * @param {String} text
 * @returns {Promise<String>} URL
 */
export async function makeRequest(text) {
  if (sizeInBytes(text) >= 512) {
    return "Can't create pastebin. Text is bigger than 512 KB";
  }

  const { body } = await got.post('http://hastebin.com/documents', {
    body: text,
    headers: {
      ...defaultHeaders,
      'Content-Type': 'text/plain',
    },
    responseType: 'json',
  });

  return `https://hastebin.com/${body.key}`;
}

/**
 * Snap a text code to a carbon image.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function pastebin(context) {
  if (!context.message.reply_to_message) return;

  const replyMessage = context.message.reply_to_message;
  const isOwner = context.message.from.id === replyMessage.from.id;
  const isPrivateChat = context.chat.type === 'private';

  if (!replyMessage.text) {
    await context.reply('`/pastebin` can only be used on plain texts', { parse_mode: 'MarkdownV2' });
    return;
  }

  await context.telegram.sendMessage(
    context.message.chat.id,
    `${
      isOwner
        ? ''
        : `<a href="tg://user?id=${context.message.from.id}">${context.message.from.first_name} ${context.message.from.last_name}</a> `
    }Your paste link: ${await makeRequest(replyMessage.text)}`,
    {
      reply_to_message_id: !isOwner && replyMessage.message_id,
      disable_web_page_preview: true,
      parse_mode: 'HTML',
    },
  );

  if (!isPrivateChat) {
    // Pastebin message
    await context.deleteMessage(context.message.message_id);

    if (isOwner) {
      // Target message to pastebin
      await context.deleteMessage(replyMessage.message_id);
    }
  }
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command('pastebin', pastebin);

  return [
    {
      command: 'pastebin',
      description: 'Send your code to Pastebin!',
    },
  ];
}
