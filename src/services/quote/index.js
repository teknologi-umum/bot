import { logger } from "#utils/logger/logtail.js";
import { isBigGroup } from "#utils/home.js";
import { getRandomQuote } from "./utils.js";

/**
 * Send daily quote.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function handleCommand(context) {
  const bigGroup = await isBigGroup(context);
  if (bigGroup) return;

  const chatId = context.message.chat.id;
  const message = await getRandomQuote();

  await context.telegram.sendMessage(chatId, message, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  await logger.fromContext(context, "quote", { sendText: message });
}

/**
 * Send daily quote.
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("quote", handleCommand);

  return [
    {
      command: "quote",
      description: "Get random quote from great people.",
    },
  ];
}
