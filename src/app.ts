import { memoryUsage } from "process";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import mongoose from "mongoose";
import redis from "redis";

import { sentry } from "#utils/logger/sentry";
import { terminal } from "#utils/logger/terminal";
import { logger } from "#utils/logger/logtail";
import { pathTo } from "#utils/path";

import * as poll from "./services/poll/index";
import * as meme from "./services/meme/index";
import * as help from "./services/help/index";
import * as quote from "./services/quote/index";
import * as covid from "./services/covid/index";
import * as snap from "./services/snap/index";
import * as blidingej from "./services/bliding-ej/index";
import * as evalBot from "./services/eval/index";
import * as blog from "./services/devread/index";
import * as quiz from "./services/quiz/index";
import * as search from "./services/search/index";
import * as dukun from "./services/dukun/index";
import * as laodeai from "./services/laodeai/index";
import * as analytics from "./services/analytics/index";
import * as pastebin from "./services/pastebin/index";
import * as news from "./services/news/index";

dotenv.config({ path: pathTo(import.meta.url, "../.env") });

const bot = new Telegraf(String(process.env.BOT_TOKEN));
const cache = redis.createClient(String(process.env.REDIS_URL));
const mongo = mongoose.createConnection(String(process.env.MONGO_URL), {
  useNewUrlParser: true
});

async function main() {
  const commands = [
    meme.register(bot, cache),
    help.register(bot),
    quote.register(bot),
    covid.register(bot, cache),
    poll.register(bot, cache),
    snap.register(bot),
    blidingej.register(bot),
    evalBot.register(bot),
    blog.register(bot, cache),
    quiz.register(bot, mongo, cache),
    search.register(bot, mongo),
    dukun.register(bot, mongo, cache),
    laodeai.register(bot),
    analytics.register(bot, mongo),
    pastebin.register(bot),
    news.register(bot)
  ]
    .filter((v) => Array.isArray(v))
    .flat();

  bot.telegram.setMyCommands(commands);

  bot.catch(async (error, context) => {
    sentry.captureException(error, (scope) => {
      scope.setContext("chat", {
        chat_id: context.message.chat.id,
        chat_title: context.message.chat.title,
        chat_type: context.message.chat.type,
        chat_username: context.message.chat.username,
        text: context.message.text,
        update_type: context.updateType,
        isReplyTo: context.message?.reply_to_message.id !== undefined,
        replyToText: context.message?.reply_to_message.text,
        caption: context.message?.caption
      });
      scope.setContext("from", {
        from_id: context.message.from.id,
        from_username: context.message.from.username,
        is_bot: context.message.from.is_bot,
        from_name: `${context.message.from.first_name} ${context.message.from.last_name}`
      });
      scope.setTags({
        chat_id: context.message.chat.id,
        from_id: context.message.from.id,
        from_username: context.message.from.username
      });
      return scope;
    });
    if (process.env.NODE_ENV !== "production") terminal.error(error);
    await Promise.all([
      context.reply(
        "Uh oh, something went wrong. Ask the devs to check their logs."
      ),
      logger.log({
        message: "Uh oh, something went wrong. Ask the devs to check their logs.",
        command: "error"
      })
    ]);
  });

  // For more information about what this is, please refer to:
  // https://nodejs.org/api/process.html#process_process_memoryusage
  terminal.log(
    `Heap total: ${memoryUsage().heapTotal / 1000000} MB. Heap used: ${
      memoryUsage().heapUsed / 1000000
    } MB. Resident Set Size: ${memoryUsage().rss / 1000000} MB.`
  );

  await logger.log({ message: "Launching bot..", command: "launch" });
  terminal.info("Launching bot..");
  await bot.launch();
}

main();

function terminate(caller: string) {
  const t = Date.now();
  mongo.close((err) => {
    err && terminal.error(err);
  });
  cache.QUIT();
  bot.stop(caller);
  terminal.info(`${caller}: ${Date.now() - t}ms`);
}

// Enable graceful stop
process.once("SIGINT", () => terminate("SIGINT"));
process.once("SIGTERM", () => terminate("SIGTERM"));
