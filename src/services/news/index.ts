import got from "got";
import { renderTemplate } from "#utils/template.js";
import { SingleValueCache } from "#utils/cache.js";
import { logger } from "#utils/logger/logtail.js";

// cache TTL : 30 minutes
const cacheTtl = 30 * 60 * 1000;

// value cache
const cache = new SingleValueCache(cacheTtl);

/**
 * Send news..
 * @param {import('telegraf').Telegraf} context
 * @returns
 */
async function news(context) {
  const { newsList, statusCode } = await cache.getOrCreate(async () => {
    const { body, statusCode } = await got.get(
      "https://berita-indo-api.vercel.app/v1/cnn-news",
      {
        responseType: "json",
        throwHttpErrors: false
      }
    );
    return {
      newsList: body.data
        .slice(0, 15)
        .map(({ title, link, contentSnippet }) => ({
          title,
          link,
          contentSnippet
        })),
      statusCode
    };
  });

  if (statusCode !== 200) {
    await context.telegram.sendMessage(
      context.message.chat.id,
      "Gagal mendapatkan berita"
    );
    return;
  }

  await context.telegram.sendMessage(
    context.message.chat.id,
    renderTemplate("news/news.template.hbs", {
      newsList
    }),
    { parse_mode: "HTML", disable_web_page_preview: true }
  );
  await logger.fromContext(context, "news", { sendText: newsList });
}

/**
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("news", (context) => news(context));

  return [
    {
      command: "news",
      description: "Memberikan berita terbaru"
    }
  ];
}
