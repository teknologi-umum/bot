import got, { TimeoutError } from "got";
import * as Sentry from "@sentry/node";
import { randomNumber } from "carret";
import { DEFAULT_HEADERS } from "#utils/http.js";
import { isBigGroup, isHomeGroup } from "#utils/home.js";
import { logger } from "#utils/logger/logtail.js";

/**
 * Send memes..
 * @param {import('telegraf').Telegraf} bot
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, cache) {
  bot.command("hilih", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendPhoto(
      context.message.chat.id,
      "https://i.ibb.co/dMbd6dF/short.jpg"
    );
    await logger.fromContext(context, "hilih", {
      sendText: "https://i.ibb.co/dMbd6dF/short.jpg"
    });
  });

  bot.command("kktbsys", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendPhoto(
      context.message.chat.id,
      "https://i.ibb.co/XtSbXBT/image.png"
    );
    await logger.fromContext(context, "kktbsys", {
      sendText: "https://i.ibb.co/XtSbXBT/image.png"
    });
  });

  bot.command("illuminati", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendAnimation(
      context.message.chat.id,
      "https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif"
    );
    await logger.fromContext(context, "illuminati", {
      sendText: "https://media.giphy.com/media/uFOW5cbNaoTaU/giphy.gif"
    });
  });

  bot.command("yntkts", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendPhoto(
      context.message.chat.id,
      "https://i.ibb.co/P1Q0650/yntkts.jpg"
    );
    await logger.fromContext(context, "yntkts", {
      sendText: "https://i.ibb.co/P1Q0650/yntkts.jpg"
    });
  });
  
  bot.command("kerjakerjakerja", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendDocument(
      context.message.chat.id,
      "https://s13.gifyu.com/images/SjAzq.gif"
    );
    await logger.fromContext(context, "kerjakerjakerja", {
      sendText: "https://s13.gifyu.com/images/SjAzq.gif"
    });
  });

  bot.command("homework", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;
    await context.telegram.sendPhoto(
      context.message.chat.id,
      "https://i.ibb.co/541knqp/photo-2021-08-21-02-54-24.jpg"
    );
    await logger.fromContext(context, "homework", {
      sendText: "https://i.ibb.co/541knqp/photo-2021-08-21-02-54-24.jpg"
    });
  });

  bot.command("joke", async (context) => {
    const bigGroup = await isBigGroup(context);
    const homeGroup = isHomeGroup(context);
    if (bigGroup && !homeGroup) return;

    try {
      const cached = await cache.findOne({ key: "jokes:total" });
      let total = cached?.total;
      if (!total || cached?.ttl < Date.now()) {
        const { body } = await got.get(
          "https://jokesbapak2.reinaldyrafli.com/api/total",
          {
            headers: DEFAULT_HEADERS,
            http2: true,
            responseType: "json",
            timeout: {
              request: 60_000
            },
            retry: {
              limit: 1
            }
          }
        );
  
        await cache.update(
          { key: "jokes:total" },
          {
            key: "jokes:total",
            total: String(body.message),
            ttl: Date.now() + 1000 * 60 * 60 * 12
          },
          { upsert: true }
        );
  
        total = Number.parseInt(body.message);
      }
  
      const id = randomNumber(0, Number.parseInt(total));
  
      await context.telegram.sendPhoto(
        context.message.chat.id,
        `https://jokesbapak2.reinaldyrafli.com/api/id/${id.toString()}`
      );
      await logger.fromContext(context, "joke", {
        sendText: `https://jokesbapak2.reinaldyrafli.com/api/id/${id.toString()}`
      });
    } catch (error) {
      if (error instanceof TimeoutError) {
        Sentry.addBreadcrumb({
          type: "default",
          level: "warning",
          category: "http.request",
          message: "HTTP request timeout",
          data: error
        });

        Sentry.captureException(error, {
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
        return;
      }

      throw error;
    }
  });

  return [
    {
      command: "hilih",
      description: "Arnold Poernomo ngomong hilih"
    },
    {
      command: "joke",
      description: "Get random jokes bapack2."
    },
    {
      command: "kktbsys",
      description: "Kenapa kamu tanya begitu, siapa yang suruh?"
    },
    {
      command: "yntkts",
      description: "Yo ndak tahu! Kok tanya saya."
    },
    {
      command: "kerjakerjakerja",
      description: "Meme untuk menyemangati para pemuda yang suka bermalas-malasan dan menunda pekerjaan, dan juga bagus untuk membubarkan debat kusir"
    },
    {
      command: "homework",
      description: "Ini PR ya ngab?"
    },
    {
      command: "illuminati",
      description: "Please don't."
    }
  ];
}
