import { getCommandArgs } from "#utils/command.js";
import { isHomeGroup } from "#utils/home.js";
import { logger } from "#utils/logger/logtail.js";

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
    await context.telegram.sendMessage(
      chatId,
      `<b>Bliding ej</b> adalah istilah untuk <i>bleeding edge</i>.\n\n` +
        `Merujuk ke produk atau jasa yang melibatkan teknologi, bisa dipakai, namun ` +
        `masih baru dan eksperimental, belum di tes secara menyeluruh dan konsekuensinya tidak bisa diandalkan.\n\n` +
        `Pengguna pada masa-masa awal dapat mengalami cacat desain dan bugs yang mungkin belum diperhatikan oleh developernya. ` +
        `Hal ini mengingat produk <i>bleeding edge</i> mungkin tidak akan diterima oleh masyarakat umum.\n\n` +
        `Bacaan dan referensi lebih lanjut:\n` +
        `<a href="https://en.wikipedia.org/wiki/Bleeding_edge_technology">Wikipedia</a>\n` +
        `<a href="https://english.stackexchange.com/a/39919">English Stackexchange</a>`,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
    await logger.fromContext(context, "blidingej");
    return;
  }

  await context.telegram.sendMessage(
    chatId,
    `<b>Bliding ej</b> is a dumb slang for <i>bleeding edge</i>.\n\n` +
      `It refers to a product or service, usually involving technology, that is available to consumers but ` +
      `is so new and experimental that it has not been fully tested and, consequently, may be unreliable.\n\n` +
      `Early adopters could experience design flaws and bugs that have not been observed by the developers. ` +
      `It is also a given that bleeding edge products may never gain mainstream acceptance.\n\n` +
      `Further readings and references:\n` +
      `<a href="https://en.wikipedia.org/wiki/Bleeding_edge_technology">Wikipedia</a>\n` +
      `<a href="https://english.stackexchange.com/a/39919">English Stackexchange</a>`,
    { parse_mode: "HTML", disable_web_page_preview: true }
  );

  await logger.fromContext(context, "blidingej");
}

/**
 * Defines bliding ej
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("blidingej", define);

  return [
    {
      command: "blidingej",
      description: "Define bliding ej",
    },
  ];
}
