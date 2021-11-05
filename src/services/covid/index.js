import got from "got";
import { renderTemplate } from "#utils/template.js";
import redisClient from "#utils/redis.js";
import { getCommandArgs } from "#utils/command.js";
import { defaultHeaders } from "#utils/http.js";
import { Temporal } from "#utils/temporal.js";
import { logger } from "#utils/logger/logtail.js";

/**
 * Send covid information.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function covid(context, cache) {
  const redis = redisClient(cache);
  const chatId = context.message.chat.id;
  const country = getCommandArgs("covid", context);

  if (country) {
    const { body, statusCode, request, rawBody } = await got.get(country, {
      prefixUrl: "https://corona.lmao.ninja/v2/countries",
      searchParams: {
        strict: true,
        yesterday: false,
        query: ""
      },
      responseType: "json",
      headers: defaultHeaders,
      throwHttpErrors: false
    });

    if (statusCode !== 404 && statusCode !== 200) {
      await logger.fromContext(context, "covid", {
        sendText: `Country: ${country}`
      });
      return Promise.reject({ request, rawBody, statusCode });
    }

    if (statusCode === 404) {
      await context.telegram.sendMessage(
        chatId,
        "That country name is not valid or does not exists."
      );
      await logger.fromContext(context, "covid", {
        sendText: `Country: ${country}`
      });
      return Promise.resolve();
    }

    if (!body) {
      await context.telegram.sendMessage(
        chatId,
        `Data for the <b>${body.country}</b> country is not yet available.`,
        {
          parse_mode: "HTML"
        }
      );
      await logger.fromContext(context, "covid", {
        sendText: `Country: ${country}`
      });
      return Promise.resolve();
    }

    // TODO: total dosis vaksin
    await context.telegram.sendMessage(
      chatId,
      renderTemplate("covid/country.template.hbs", {
        date: new Temporal(body.updated).formatDate("id-ID", "Asia/Jakarta"),
        country: body.country,
        confirmed: body.todayCases.toLocaleString("id-ID") ?? 0,
        deaths: body.todayDeaths.toLocaleString("id-ID") ?? 0,
        recovered: body.todayRecovered.toLocaleString("id-ID") ?? 0,
        active: body.active.toLocaleString("id-ID") ?? 0
      }),
      {
        parse_mode: "HTML"
      }
    );
    await logger.fromContext(context, "covid", {
      sendText: `Country: ${country}`
    });
    return Promise.resolve();
  }

  const [getGlobalData] = await redis.MGET("covid:global");

  if (getGlobalData) {
    await context.telegram.sendMessage(chatId, getGlobalData, {
      parse_mode: "HTML"
    });
    await logger.fromContext(context, "covid", { sendText: getGlobalData });
    return Promise.resolve();
  }

  const globalData = (
    await got.get("https://corona.lmao.ninja/v2/all", {
      searchParams: {
        yesterday: "false"
      },
      responseType: "json",
      headers: defaultHeaders
    })
  ).body;

  const indonesiaData = (
    await got.get("indonesia", {
      prefixUrl: "https://corona.lmao.ninja/v2/countries",
      searchParams: {
        strict: true,
        yesterday: true,
        query: ""
      },
      responseType: "json",
      headers: defaultHeaders
    })
  ).body;

  const preformatMessage = renderTemplate("covid/global.template.hbs", {
    date: new Temporal(globalData.updated).formatDate("id-ID", "Asia/Jakarta"),
    globalConfirmed: globalData.todayCases.toLocaleString("id-ID") ?? 0,
    globalDeaths: globalData.todayDeaths.toLocaleString("id-ID") ?? 0,
    globalRecovered: globalData.todayRecovered.toLocaleString("id-ID") ?? 0,
    indonesiaConfirmed: indonesiaData.todayCases.toLocaleString("id-ID") ?? 0,
    indonesiaDeaths: indonesiaData.todayDeaths.toLocaleString("id-ID") ?? 0,
    indonesiaRecovered:
      indonesiaData.todayRecovered.toLocaleString("id-ID") ?? 0
  });

  // TODO: Total dosis vaksin dunia & total dosis vaksin Indonesia
  await Promise.allSettled([
    context.telegram.sendMessage(chatId, preformatMessage, {
      parse_mode: "HTML"
    }),
    redis.SETEX("covid:global", 60 * 60 * 6, preformatMessage)
  ]).then(async () => {
    await logger.fromContext(context, "covid", { sendText: preformatMessage });
  });

  return Promise.resolve();
}

/**
 * Send covid information.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('redis').RedisClient} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, cache) {
  bot.command("covid", (context) => covid(context, cache));

  return [
    {
      command: "covid",
      description: "Get covid report from global or specific country."
    }
  ];
}
