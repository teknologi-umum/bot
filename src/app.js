import { memoryUsage } from "node:process";
import { fork } from "node:child_process";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Datastore from "@teknologi-umum/nedb-promises";
import * as Sentry from "@sentry/node";

import { terminal, logger } from "#utils/logger/index.js";
import { pathTo } from "#utils/path.js";

import * as poll from "#services/poll/index.js";
import * as meme from "#services/meme/index.js";
import * as help from "#services/help/index.js";
import * as quote from "#services/quote/index.js";
import * as covid from "#services/covid/index.js";
import * as snap from "#services/snap/index.js";
import * as blidingej from "#services/bliding-ej/index.js";
import * as evalBot from "#services/eval/index.js";
import * as blog from "#services/devread/index.js";
import * as quiz from "#services/quiz/index.js";
import * as search from "#services/search/index.js";
import * as dukun from "#services/dukun/index.js";
import * as laodeai from "#services/laodeai/index.js";
import * as analytics from "#services/analytics/index.js";
import * as news from "#services/news/index.js";
import * as qr from "#services/qr/index.js";
import * as pesto from "#services/pesto/index.js";
import { getCommandName } from "#utils/command.js";

dotenv.config({ path: pathTo(import.meta.url, "../.env") });


Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  sampleRate: 1.0,
  tracesSampleRate: 0.2,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Undici(),
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
  ]
});

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = Datastore.create();
const mongo = mongoose.createConnection(String(process.env.MONGO_URL), {
  useNewUrlParser: true
});

// Fork processes
const hackernewsFork = fork(pathTo(import.meta.url, "./hackernews.js"), { detached: true });

async function terminate(caller) {
  const t = Date.now();
  bot.stop(caller);
  hackernewsFork.kill();
  await mongo.close();
  await Sentry.flush();
  terminal.info(`${caller}: ${Date.now() - t}ms`);
}

// Enable graceful stop, register to process;
process.once("SIGINT", () => terminate("SIGINT"));
process.once("SIGTERM", () => terminate("SIGTERM"));


async function main() {
  mongo.on("connected", () => terminal.info("MongoDB connected"));

  bot.use((ctx, next) => {
    if (ctx.from.id === 136817688 || ctx.from.is_bot) {
      return;
    }

    // TODO: Move this somewhere else
    const validCommands = ["blidingej", "covid", "devread", "dukun", "eval", "laodeai", "news", "hilih", "joke", "kktbsys", "yntkts", "kerjakerjakerja", "homework", "illuminati", "c", "cpp", "clisp", "dotnet", "go", "java", "js", "julia", "lua", "php", "python", "ruby", "sqlite3", "ts", "v", "brainfuck", "qr", "quote", "search", "snap"];
    if (ctx.updateType === "message") {
      const command = getCommandName(ctx);
      if (command === "" || !validCommands.includes(command)) {
        next();
        return;
      }

      Sentry.startSpan({
        name: command,
        op: "bot.update",
        data: {
          from_username: ctx.from.username,
          chat_type: ctx.message.chat.type,
          chat_title: ctx.message.chat.title
        }
      }, () => {
        next();
      });
      return;
    }

    next();
  });

  const commands = [
    meme.register(bot, cache),
    help.register(bot),
    quote.register(bot),
    covid.register(bot, cache),
    poll.register(bot, mongo, cache),
    snap.register(bot),
    blidingej.register(bot),
    evalBot.register(bot),
    blog.register(bot, cache),
    quiz.register(bot, mongo, cache),
    search.register(bot, mongo),
    dukun.register(bot, mongo, cache),
    laodeai.register(bot),
    analytics.register(bot, mongo),
    news.register(bot),
    qr.register(bot),
    pesto.register(bot)
  ]
    .filter((v) => Array.isArray(v))
    .flat();

  await bot.telegram.setMyCommands(commands);

  bot.catch(async (error, context) => {
    try {
      Sentry.captureException(error, (scope) => {
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
        context.telegram.sendMessage(
          context.chat.id,
          "Uh oh, something went wrong. Ask the devs to check their logs."
        ),
        logger.log({
          message:
            "Uh oh, something went wrong. Ask the devs to check their logs.",
          command: "error"
        })
      ]);
    } catch (e) {
      terminal.error(e);
    }
  });


  // For more information about what this is, please refer to:
  // https://nodejs.org/api/process.html#process_process_memoryusage
  terminal.log(
    `Heap total: ${memoryUsage().heapTotal / 1000000} MB. Heap used: ${memoryUsage().heapUsed / 1000000
    } MB. Resident Set Size: ${memoryUsage().rss / 1000000} MB.`
  );

  await logger.log({ message: "Launching bot..", command: "launch" });
  terminal.info("Launching bot..");
  await bot.launch();
}

main();
