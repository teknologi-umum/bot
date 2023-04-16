import { logger, sentry } from "#utils/logger/index.js";
import { getCommandArgs } from "#utils/command.js";
import { terminal } from "#utils/logger/terminal.js";
import { generateImage } from "./utils.js";
import {
  ERR_INVALID_LANGUAGE,
  CODE_LENGTH_LIMIT,
  CODE_LINES_LIMIT
} from "./constants.js";
import { TimeoutError } from "got";

/**
 * Snap a text code to a carbon image.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (!context.message.reply_to_message) return Promise.resolve();

  /** @type {import("telegraf/typings/core/types/typegram").Message.TextMessage} */
  const replyMessage = context.message.reply_to_message;

  if (typeof replyMessage.text !== "string") return Promise.resolve();

  const code = replyMessage.text;
  const isOwner = context.message.from.id === replyMessage.from.id;
  const isPrivateChat = context.chat.type === "private";

  if (code === "") {
    await context.reply("`/snap` can only be used on plain texts", {
      parse_mode: "MarkdownV2"
    });
    await logger.fromContext(context, "snap", {
      sendText: "`/snap` can only be used on plain texts"
    });
    return Promise.resolve();
  }

  const tooLong =
    code.length > CODE_LENGTH_LIMIT ||
    code.split("\n").length > CODE_LINES_LIMIT;

  const lang = getCommandArgs("snap", context);
  try {
    const image = await generateImage(
      code.substring(0, 3000),
      lang.split(" ")[0]
    );
    await Promise.all([
      context.telegram.sendPhoto(
        context.message.chat.id,
        { source: image },
        {
          caption: tooLong
            ? "Code is bigger than 512 KB, please upload the complete code yourself."
            : "",
          reply_to_message_id: context.message.message_id
        }
      ),
      logger.fromContext(context, "snap", {
        sendText: code,
        actions: "Sent a photo"
      })
    ]);

    if (!isPrivateChat) {
      // Snap message
      await Promise.all([
        context.deleteMessage(context.message.message_id),
        logger.fromContext(context, "snap", {
          actions: `Deleted a message with id ${context.message.message_id}`
        })
      ]);
      if (isOwner) {
        try {
          // Target message to snap
          await Promise.all([
            context.deleteMessage(replyMessage.message_id),
            logger.fromContext(context, "snap", {
              actions: `Deleted a message with id ${replyMessage.message_id}`
            })
          ]);
        } catch (e) {
          // Drop the error.
          terminal.log(e);
        }
      }
    }

    return Promise.resolve();
  } catch (err) {
    // Handle specific error message
    if (err === ERR_INVALID_LANGUAGE) {
      await Promise.all([
        context.telegram.sendMessage(context.message.chat.id, err, {
          parse_mode: "MarkdownV2"
        }),
        logger.fromContext(context, "snap", { sendText: err })
      ]);
      return Promise.resolve();
    }

    if (err instanceof TimeoutError) {
      sentry.addBreadcrumb({
        type: "default",
        level: "warning",
        category: "http.request",
        message: "HTTP request timeout",
        data: err
      });

      sentry.captureException(err, {
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

      await context.telegram.sendMessage(context.message.chat.id, "Uh oh, got a timeout while calling the API. So sorry!");
      return Promise.resolve();
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
  bot.command("snap", snap);

  return [
    {
      command: "snap",
      description: "Screenshot the code in the reply message."
    }
  ];
}
