import cheerio from "cheerio";
import { renderTemplate } from "#utils/template.js";
import { getCommandArgs } from "#utils/command.js";
import { cleanURL, fetchDDG } from "#utils/http.js";
import { sanitize } from "#utils/sanitize.js";
import { logger } from "#utils/logger/index.js";
import { isClean, cleanFilter } from "./filter.js";

const SEARCH_LIMIT = 10;
const BEST_AMOUNT = 2;

/**
 * @param {import('telegraf').Telegraf} context
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<void>}
 */
async function search(context, mongo) {
  const query = getCommandArgs("search", context);
  if (!query) return;

  const clean = await isClean(query, mongo);
  if (!clean) {
    const MESSAGE = "Keep the search clean, shall we? 😉";
    await context.reply(MESSAGE);
    await logger.fromContext(context, "search", { sendText: MESSAGE });
    return;
  }

  const { body, requestUrl, statusCode } = await fetchDDG(query);
  if (statusCode !== 200) {
    const MESSAGE = "Error getting search result.";
    await context.reply(MESSAGE);
    await logger.fromContext(context, "search", { sendText: MESSAGE });
    return;
  }

  const $ = cheerio.load(body);
  let items = $(".web-result")
    .map((_, el) => {
      const title = $(el).find(".result__title > a").first();
      const titleText = title !== "" ? title : "Title unavailable.";
      const href = decodeURIComponent(cleanURL(title.attr("href")));
      const snippet = $(el)
        .find(".result__snippet")
        .map((_, el) => el.children.map((x) => $.html(x)).join(""))
        .get();

      return {
        href,
        title: sanitize(titleText),
        snippet: sanitize(snippet)
      };
    })
    .get();

  // Safer search
  items = await cleanFilter(items, mongo);
  items = items.slice(0, SEARCH_LIMIT + BEST_AMOUNT);

  if (items.length === 0) {
    const sentMessage = await context.telegram.sendMessage(
      context.message.chat.id,
      `No result was found for <b>${query}</b>`,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
    await logger.fromContext(context, "search", { sendText: sentMessage.text });
    return;
  }

  const sentMessage = await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate("search/search.template.hbs", {
      items,
      query,
      url: decodeURIComponent(requestUrl),
      bestAmount: BEST_AMOUNT
    }),
    { parse_mode: "HTML", disable_web_page_preview: true }
  );
  await logger.fromContext(context, "search", { sendText: sentMessage.text });
}

/**
 * Send search result from duckduckgo.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo) {
  bot.command("search", (context) => search(context, mongo));

  return [
    {
      command: "search",
      description: "Cari di DuckDuckGo"
    }
  ];
}
