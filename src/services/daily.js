import mongoose from 'mongoose';
import dayjs from 'dayjs';
import redisClient from '../utlis/redis';
import { randomItem } from '../utlis/random';

/**
 *
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('redis').RedisClient} cache
 * @returns
 */
async function dailyQuiz(context, mongo, cache) {
  try {
    const redis = redisClient(cache);
    const currentTime = dayjs().add(7, 'hours').toISOString();
    const chatID = context.message.chat.id;

    const poll = new mongoose.Schema(
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

    const Poll = mongo.model('Poll', poll, 'quiz');

    // Check if today's quiz is already posted.
    const lastQuizDate = redis.GET(`quiz:${String(chatID)}:date`);

    if (lastQuizDate && dayjs(lastQuizDate).diff(currentTime, 'day') === 0) {
      context.reply(`You can't request another new quiz for today. Wait for tomorrow, then ask a new one &#x1F61A`, {
        parse_mode: 'HTML',
      });
    } else {
      const quizes = await Poll.find({ posted: false });
      const pickQuiz = randomItem(quizes);

      if (pickQuiz?.code) {
        await context.telegram.sendPhoto(chatID, pickQuiz.code);
      }

      const question =
        pickQuiz.question.length > 200
          ? `${pickQuiz.question.substring(0, 20)}... (question above)`
          : pickQuiz.question;

      if (pickQuiz.question.length > 200) {
        // Send the question as a separate message
        await context.telegram.sendMessage(chatID, pickQuiz.question, { parse_mode: 'HTML' });
      }

      if (pickQuiz.type === 'quiz') {
        await context.telegram.sendQuiz(chatID, question, pickQuiz.choices, {
          allows_multiple_answers: pickQuiz.multipleAnswer ?? false,
          explanation: pickQuiz.explanation ?? '',
          is_anonymous: pickQuiz.anonymous ?? false,
          correct_option_id: pickQuiz.answer - 1,
        });
      } else if (pickQuiz.type === 'survey') {
        await context.telegram.sendPoll(chatID, question, pickQuiz.choices, {
          allows_multiple_answers: pickQuiz.multipleAnswer ?? false,
          explanation: pickQuiz.explanation ?? '',
          is_anonymous: pickQuiz.anonymous ?? false,
        });
      }

      await Poll.findByIdAndUpdate(pickQuiz['_id'], { posted: true }, { useFindAndModify: false });
      await redis.SET(`quiz:${String(chatID)}:date`, currentTime);
    }
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export default dailyQuiz;
