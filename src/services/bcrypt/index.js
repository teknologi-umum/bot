import { logger } from "#utils/logger/logtail.js";
import { getCommandArgs } from "#utils/command.js";
import * as bc from "bcrypt";

/**
 *
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function bcrypt(context) {
  const text = getCommandArgs("bcrypt", context);
  const salt = bc.genSaltSync(10);
  const hashedText = bc.hashSync(text, salt);

  await Promise.all([
    context.deleteMessage(context.message.message_id),
    context.telegram.sendMessage(
      context.message.chat.id,
      hashedText
    )
  ]);

  await logger.fromContext(context, "bcrypt");
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("bcrypt", bcrypt);

  return [
    {
      command: "bcrypt",
      description: "Generate bcrypt hash"
    }
  ];
}

