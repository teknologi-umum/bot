import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { randomNumber } from 'carret';
import redisClient from '../utils/redis.js';
import { poll } from './poll.js';
import { isHomeGroup } from '../utils/home.js';

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
    updatedAt: Date,
  },
  { collection: 'quiz' },
);

/**
 *
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('redis').RedisClient} cache
 * @returns
 */
async function quiz(context, mongo, cache) {
  if (!isHomeGroup(context)) return;

  const redis = redisClient(cache);
  const currentTime = dayjs().add(7, 'hours').toISOString();
  const chatID = context.message.chat.id;

  if (context.message.chat.type === 'private') {
    await context.telegram.sendMessage(chatID, 'Quiz is only available for groups', { parse_mode: 'HTML' });
    return;
  }

  const Poll = mongo.model('Poll', pollSchema, 'quiz');

  // Check if today's quiz is already posted.
  const lastQuizDate = await redis.GET(`quiz:${String(chatID)}:date`);

  if (lastQuizDate && dayjs(lastQuizDate).diff(currentTime, 'day') === 0) {
    context.telegram.sendMessage(
      chatID,
      `You can't request another new quiz for today. Wait for tomorrow, then ask a new one &#x1F61A`,
      {
        parse_mode: 'HTML',
      },
    );
    return;
  }

  const quizes = await Poll.find({ posted: false });
  const pickQuiz = quizes[randomNumber(0, quizes.length - 1)];

  if (pickQuiz?.code) {
    await context.telegram.sendPhoto(chatID, pickQuiz.code);
  }

  const question =
    pickQuiz.question.length > 200 ? `${pickQuiz.question.substring(0, 20)}... (question above)` : pickQuiz.question;

  if (pickQuiz.question.length > 200) {
    // Send the question as a separate message
    await context.telegram.sendMessage(chatID, pickQuiz.question, { parse_mode: 'HTML' });
  }

  if (pickQuiz.type === 'quiz') {
    const response = await context.telegram.sendQuiz(
      chatID,
      question,
      pickQuiz.choices.map((o) => String(o)),
      {
        allows_multiple_answers: pickQuiz.multipleAnswer ?? false,
        explanation: pickQuiz.explanation ?? '',
        is_anonymous: pickQuiz.anonymous ?? false,
        correct_option_id: pickQuiz.answer - 1,
      },
    );

    // Pin the message if it's a supergroup type
    if (context.message.chat.type === 'supergroup') {
      await poll(context, cache, { question, type: pickQuiz.type }, response.message_id);
    }
  } else if (pickQuiz.type === 'survey') {
    const response = await context.telegram.sendPoll(
      chatID,
      question,
      pickQuiz.choices.map((o) => String(o)),
      {
        allows_multiple_answers: pickQuiz.multipleAnswer ?? false,
        explanation: pickQuiz.explanation ?? '',
        is_anonymous: pickQuiz.anonymous ?? false,
      },
    );

    // Pin the message if it's a supergroup type
    if (context.message.chat.type === 'supergroup') {
      await poll(context, cache, { question, type: pickQuiz.type }, response.message_id);
    }
  }

  await Poll.findByIdAndUpdate(pickQuiz['_id'], { posted: true }, { useFindAndModify: false });
  await redis.MSET(`quiz:${String(chatID)}:date`, currentTime);
}

export function register(bot, mongo, cache) {
  bot.command('quiz', (context) => quiz(context, mongo, cache));

  return [
    {
      command: 'quiz',
      description: 'Sends daily quiz to your group!',
    },
  ];
}
