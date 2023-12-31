import QRCode from "qrcode";
import { getCommandArgs } from "#utils/command.js";
import { logger } from "#utils/logger/logtail.js";
import * as Sentry from "@sentry/node";

/**
 * Handling /qr command
 * 
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function qr(context) {
  const query = getCommandArgs("qr", context);
  
  if (query === "") {
    await context.telegram.sendMessage(
      context.message.chat.id,
      "Cara pakai ketik: /qr &lt;teks/link yang mau diubah jadi QR Code&gt;\n\nContoh: \n<code>/qr https://google.com</code>",
      { parse_mode: "HTML" }
    );
    return;
  }

  try {
    const image = await QRCode.toDataURL(query);
    const buffer = Buffer.from(image.split(",")[1], "base64");
    
    await context.telegram.sendPhoto(
      context.message.chat.id,
      { source: buffer },
      { caption: query.length > 30 ? query.slice(0, 27) + "..." : query }
    );  
  } catch (err) {
    await context.telegram.sendMessage(
      context.message.chat.id,
      "Oppss.. Service sedang error.."
    );

    Sentry.getCurrentHub().captureException(err, {
      level: "warning",
      extra: {
        chat: {
          chat_id: context.message.chat.id,
          chat_title: context.message.chat.title,
          chat_type: context.message.chat.type,
          chat_username: context.message.chat.username,
          text: context.message.text,
          update_type: context.updateType,
          isReplyTo: context.message?.reply_to_message?.id !== undefined,
          replyToText: context.message?.reply_to_message?.text,
          caption: context.message?.caption
        },
        from: {
          from_id: context.message.from.id,
          from_username: context.message.from.username,
          is_bot: context.message.from.is_bot,
          from_name: `${context.message.from.first_name} ${context.message.from.last_name}`
        }
      },
      tags: {
        chat_id: context.message.chat.id,
        from_id: context.message.from.id,
        from_username: context.message.from.username
      }
    });
  }

  await logger.fromContext(context, "qr");
}

/**
 * Register QRCode to command
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("qr", qr);

  return [
    {
      command: "qr",
      description: "Generate QRCode"
    }
  ];
}
