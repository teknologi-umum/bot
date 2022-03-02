import got from "got";
import { DEFAULT_HEADERS } from "#utils/http.js";
import { sizeInBytes } from "#utils/size.js";
import { terminal } from "#utils/logger/terminal.js";
import { logger } from "#utils/logger/index.js";

export const PASTEBIN_FILE_TOO_BIG =
  "Can't create pastebin. Text is bigger than 5 MB";

/**
 * makeRequest is a function to make a request to Polarite.
 * @param {String} text
 * @returns {Promise<String>} URL
 */
export async function makeRequest(text) {
  if (sizeInBytes(text) >= 1024 * 1024 * 5) {
    return PASTEBIN_FILE_TOO_BIG;
  }

  const { body } = await got.post("https://teknologi-umum-polarite.fly.dev/", {
    body: text,
    headers: {
      ...DEFAULT_HEADERS,
      "Content-Type": "text/plain",
      Authorization: "Teknologi Umum Bot <teknologi.umum@gmail.com>"
    },
    responseType: "text"
  });

  return body;
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
  const isPrivateChat = context.chat.type === "private";

  if (!replyMessage.text) {
    await context.reply("`/pastebin` can only be used on plain texts", {
      parse_mode: "MarkdownV2"
    });
    await logger.fromContext(context, "pastebin", {
      sendText: "`/pastebin` can only be used on plain texts"
    });
    return;
  }

  const pasteURL = await makeRequest(replyMessage.text);
  const pasteMessage = `${
    isOwner
      ? ""
      : `<a href="tg://user?id=${context.message.from.id}">${
        context.message.from.first_name ?? ""
      } ${context.message.from?.last_name ?? ""}</a> `
  }${
    pasteURL === PASTEBIN_FILE_TOO_BIG
      ? pasteURL
      : `Your paste link: ${pasteURL}`
  }`;
  await context.telegram.sendMessage(context.message.chat.id, pasteMessage, {
    reply_to_message_id: !isOwner && replyMessage.message_id,
    disable_web_page_preview: true,
    parse_mode: "HTML"
  });
  await logger.fromContext(context, "pastebin", { sendText: pasteMessage });

  if (!isPrivateChat) {
    // Pastebin message
    await Promise.all([
      context.deleteMessage(context.message.message_id),
      logger.fromContext(context, "pastebin", {
        actions: `Deleted a message with id ${context.message.message_id}`
      })
    ]);
    if (isOwner) {
      try {
        // Target message to pastebin
        await Promise.all([
          context.deleteMessage(replyMessage.message_id),
          logger.fromContext(context, "pastebin", {
            actions: `Deleted a message with id ${replyMessage.message_id}`
          })
        ]);
      } catch (e) {
        // Drop the error.
        terminal.log(e);
      }
    }
  }
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("pastebin", pastebin);

  return [];
}
