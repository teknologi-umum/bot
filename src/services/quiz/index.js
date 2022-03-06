import mongoose from "mongoose";
import { randomNumber } from "carret";
import { poll } from "#services/poll/index.js";
import { isHomeGroup } from "#utils/home.js";
import { Temporal } from "#utils/temporal.js";
import { sanitize } from "#utils/sanitize.js";
import { logger } from "#utils/logger/index.js";
import {
  ERR_EXHAUSTED as ERR_DAILY_EMPTY,
  ERR_NOT_IN_GROUP,
  ERR_NO_QUIZ as ERR_QUIZ_EMPTY
} from "./constants";

const pollSchema = new mongoose.Schema(
  {
    type: String,
    creator: String,
    question: String,
    code: String,
    answer: Number,
    choices: [],
    explanation: String,
    multipleAnswers: Boolean,
    anonymous: Boolean,
    posted: Boolean,
    createdAt: Date,
    updatedAt: Date
  },
  { collection: "quiz" }
);

/**
 *
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {Promise<void>}
 */
async function quiz(context, mongo, cache) {
  if (!isHomeGroup(context)) return;

  const currentTime = new Temporal(new Date());
  const chatID = context.message.chat.id;

  if (context.message.chat.type === "private") {
    await context.telegram.sendMessage(chatID, ERR_NOT_IN_GROUP, {
      parse_mode: "HTML"
    });
    await logger.fromContext(context, "quiz", { sendText: ERR_NOT_IN_GROUP });
    return;
  }

  const Poll = mongo.model("Poll", pollSchema, "quiz");

  // Check if today's quiz is already posted.
  const { value: quizByChatID } = await cache.findOne({
    key: `quiz:${String(chatID)}`
  });

  if (quizByChatID && currentTime.compare(new Date(quizByChatID.date), "day")) {
    await context.telegram.sendMessage(chatID, ERR_DAILY_EMPTY, {
      parse_mode: "HTML"
    });
    await logger.fromContext(context, "quiz", { sendText: ERR_DAILY_EMPTY });
    return;
  }

  const polls = await Poll.find({ posted: false });
  if (polls.length < 1) {
    await context.telegram.sendMessage(chatID, ERR_QUIZ_EMPTY, {
      parse_mode: "HTML"
    });
    await logger.fromContext(context, "quiz", { sendText: ERR_QUIZ_EMPTY });
    return;
  }
  const chosenPoll = polls[randomNumber(0, polls.length - 1)];

  if (chosenPoll?.code) {
    await context.telegram.sendPhoto(chatID, chosenPoll.code);
  }

  const question =
    chosenPoll.question.length > 200
      ? `${chosenPoll.question.substring(0, 20)}... (question above)`
      : chosenPoll.question;

  if (chosenPoll.question.length > 200) {
    // Send the question as a separate message

    await context.telegram.sendMessage(chatID, sanitize(chosenPoll.question), {
      parse_mode: "HTML"
    });
  }

  if (chosenPoll.type === "quiz") {
    const response = await context.telegram.sendQuiz(
      chatID,
      sanitize(question),
      chosenPoll.choices.map((o) => String(o)),
      {
        allows_multiple_answers: chosenPoll.multipleAnswer ?? false,
        explanation: chosenPoll.explanation ?? "",
        is_anonymous: chosenPoll.anonymous ?? false,
        correct_option_id: chosenPoll.answer - 1
      }
    );
    await logger.fromContext(context, "quiz", {
      actions: `Sent a poll with id ${response.message_id}`,
      sendText: chosenPoll?.question ?? "",
      sendImage: chosenPoll?.code ?? ""
    });

    // Pin the message if it's a supergroup type
    if (context.message.chat.type === "supergroup") {
      await poll(
        context,
        cache,
        { question, type: chosenPoll.type },
        response.message_id
      );
    }
  } else if (chosenPoll.type === "survey") {
    const response = await context.telegram.sendPoll(
      chatID,
      sanitize(question),
      chosenPoll.choices.map((o) => String(o)),
      {
        allows_multiple_answers: chosenPoll.multipleAnswer ?? false,
        explanation: chosenPoll.explanation ?? "",
        is_anonymous: chosenPoll.anonymous ?? false
      }
    );
    await logger.fromContext(context, "quiz", {
      actions: `Sent a poll with id ${response.message_id}`,
      sendText: question
    });

    // Pin the message if it's a supergroup type
    if (context.message.chat.type === "supergroup") {
      await poll(
        context,
        cache,
        { question, type: chosenPoll.type },
        response.message_id
      );
    }
  }

  await Poll.findByIdAndUpdate(chosenPoll._id, { posted: true });
  await cache.update(
    { key: `quiz:${String(chatID)}` },
    {
      value: {
        date: currentTime.date.toISOString()
      }
    },
    { upsert: true }
  );
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo, cache) {
  bot.command("quiz", (context) => quiz(context, mongo, cache));

  return [
    {
      command: "quiz",
      description: "Sends daily quiz to your group!"
    }
  ];
}
