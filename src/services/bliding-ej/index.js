import { getCommandArgs } from "#utils/command.js";
import { isHomeGroup } from "#utils/home.js";
import { logger } from "#utils/logger/index.js";
import { EN_DEFINITION, ID_DEFINITION } from "./constants.js";

/**
 * Defines bliding ej
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function define(context) {
  if (!isHomeGroup(context)) return;

  const chatId = context.message.chat.id;
  const argument = getCommandArgs("blidingej", context);

  if (argument.startsWith("indo") || argument.startsWith("id")) {
    await context.telegram.sendMessage(chatId, ID_DEFINITION, {
      parse_mode: "HTML",
      disable_web_page_preview: true
    });
    await logger.fromContext(context, "blidingej");
    return;
  }

  await context.telegram.sendMessage(chatId, EN_DEFINITION, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
  await logger.fromContext(context, "blidingej");
}

/**
 * Defines bliding ej
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("blidingej", define);

  return [];
}
