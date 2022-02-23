import { logger } from "#utils/logger/logtail.js";
import { isHomeGroup } from "#utils/home.js";
import { Temporal } from "#utils/temporal.js";
import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    content: String,
    createdAt: String
  },
  { collection: "poll" }
);

/**
 * Process poll created by user to not
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @param {any} poll Telegram Poll object
 * @param {any} pollID Telegram ID to poll
 * @returns {Promise<void>}
 */
export async function poll(context, cache, poll, pollID) {
  const currentTime = new Temporal(new Date());
  const Poll = mongoose.model("Poll", pollSchema, "poll");

  // If this is empty, this could be a null value. So this can't be directly destructured.
  let { content, date } = await cache.findOne({ key: `poll:${String(context.message.chat.id)}` });

  if (!content && !date) {
    // If cache is empty, let's find out from the database
    const document = await Poll.findOne({ createdAt:  currentTime.formatDate() });
    if (document && document?.createdAt === currentTime.formatDate()) {
      content = document.content;
      date = document.createdAt;
    }
  }
  /** @type {{ survey: Array<{id: String, text: String}>, quiz: Array<{id: String, text: String}>}} lastMessageContent */
  let lastMessageContent;

  // Check if pollByGroup is null or not
  if (!content || !date) {
    lastMessageContent = { survey: [], quiz: [] };
  } else {
    lastMessageContent = JSON.parse(content);

    if (!lastMessageContent || !currentTime.compare(new Date(date), "day")) {
      lastMessageContent = { survey: [], quiz: [] };
    }
  }

  if (poll.type === "regular") {
    lastMessageContent.survey.push({
      id: pollID,
      text: poll.question.split(/\n/)[0]
    });
  } else if (poll.type === "quiz") {
    lastMessageContent.quiz.push({
      id: pollID,
      text: poll.question.split(/\n/)[0]
    });
  }


  const chat = await context.getChat();
  const chatLink = `https://t.me/${chat.username}`;

  const preformatMessage =
    `<strong>${currentTime.formatDate(
      "id-ID",
      "Asia/Jakarta",
      false,
      false
    )}</strong>\n\n` +
    "Quiz\n" +
    `${lastMessageContent.quiz
      .map((i) => `<a href="${chatLink}/${i.id}">${i.text}</a>`)
      .join("\n")}\n\n` +
    "Survey\n" +
    `${lastMessageContent.survey
      .map((i) => `<a href="${chatLink}/${i.id}">${i.text}</a>`)
      .join("\n")}\n`;

  if (
    date &&
    currentTime.compare(new Date(date), "day")
  ) {
    const { id } = await cache.findOne({ key: `poll:${String(context.message.chat.id)}` });
    // append to existing message
    await Promise.allSettled([
      context.telegram.editMessageText(
        context.message.chat.id,
        Number(id),
        "",
        preformatMessage,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true
        }
      ),
      Poll.updateOne(
        { createdAt: currentTime.formatDate() }, 
        { content: JSON.stringify(lastMessageContent) }
      ),
      cache.update(
        { key: `poll:${String(context.message.chat.id)}` },
        { 
          key: `poll:${String(context.message.chat.id)}`,
          content: JSON.stringify(lastMessageContent)
        },
        { upsert: true }
      ),
      logger.fromContext(context, "poll", {
        actions: `Edited a message: ${Number(id)}`,
        sendText: preformatMessage
      })
    ]);
    return;
  }

  // create new message
  const response = await context.telegram.sendMessage(
    context.message.chat.id,
    preformatMessage,
    {
      parse_mode: "HTML",
      disable_web_page_preview: true
    }
  );

  await Promise.all([
    logger.fromContext(context, "poll", {
      actions: `Message sent: ${response.message_id}`,
      sendText: preformatMessage
    }),
    Poll.create({
      content: JSON.stringify(lastMessageContent),
      createdAt: currentTime.formatDate()
    }),
    cache.update(
      { key: `poll:${String(context.message.chat.id)}` },
      {
        key: `poll:${String(context.message.chat.id)}`,
        id: String(response.message_id),
        content: JSON.stringify(lastMessageContent),
        date: currentTime.date.toISOString()
      },
      { upsert: true }
    ),
    context.telegram.pinChatMessage(
      context.message.chat.id,
      response.message_id,
      {
        disable_notification: false
      }
    )
  ]);

  await logger.fromContext(context, "poll", { actions: "Pinned a message" });
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo, cache) {
  bot.on("message", async (context, next) => {
    // Only works on supergroup
    if (context.message?.poll && context.message?.chat?.type === "supergroup") {
      if (!isHomeGroup(context)) return Promise.resolve();
      await poll(
        context,
        mongo,
        cache,
        context.message.poll,
        context.message.message_id
      );
      return Promise.resolve();
    }

    return next();
  });

  return [];
}

export default poll;
