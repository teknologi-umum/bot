import mongoose from 'mongoose';
import { getCommandArgs } from '../../utils/command.js';
import redisClient from '../../utils/redis.js';
import { renderTemplate } from '../../utils/template.js';

const dukunSchema = new mongoose.Schema(
  {
    userID: Number,
    firstName: String,
    lastName: String,
    userName: String,
    points: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: 'dukun' },
);

/**
 *
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('redis').RedisClient} cache
 * @returns
 */
async function dukun(context, mongo, cache) {
  // Reject private and channels
  if (context.message.chat.type === 'private' || context.message.chat.type === 'channel') {
    await context.reply('Dukun is only available on groups.');
    return;
  }

  const redis = redisClient(cache);
  const argument = getCommandArgs('dukun', context);
  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const isOwner = context.message.from.id === replyMessage.from.id;
    if (isOwner) {
      await context.reply('Poin dukun hanya bisa diberikan oleh orang lain. Najis banget dah self-claimed🙄');
      return;
    }

    /**
     * @type {Number} point
     */
    let point;
    if (argument.startsWith('+')) {
      point = Math.abs(Number.parseInt(argument.replace('-', '')));
      // Maximum point addition is 10
      if (point > 10) {
        point = 10;
      }
    } else if (argument.startsWith('-')) {
      point = Math.abs(Number.parseInt(argument.replace('-', ''))) * -1;
      // Maximum point subtraction is 10
      if (point < -10) {
        point = -10;
      }
    } else {
      // No argument was given, +1 by default
      point = 1;
    }

    // yaelah ngapain sih bro
    if (Math.sign(point) === 0) {
      await context.reply('Om, seriusan?');
      return;
    }

    // Validate given point
    if (Number.isNaN(point) && !Number.isFinite(point)) {
      await context.reply('Poin dukun nggak valid. Nggak jadi ditambah.');
      return;
    }

    // Add dukun point
    const Dukun = mongo.model('Dukun', dukunSchema, 'dukun');
    const updatedData = await Dukun.findOneAndUpdate(
      { userID: replyMessage.from.id },
      {
        $inc: {
          points: point,
        },
        $setOnInsert: {
          // points: point,
          userID: replyMessage.from.id,
          firstName: replyMessage.from?.first_name ?? '',
          lastName: replyMessage.from?.last_name ?? '',
          userName: replyMessage.from?.username ?? '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, useFindAndModify: false, new: true },
    );

    await context.telegram.sendMessage(
      context.chat.id,
      `Dukun <a href="tg://user?id=${replyMessage.from.id}">${[
        replyMessage.from.first_name,
        replyMessage.from.last_name,
      ].join(' ')}</a> points: ${updatedData.points}`,
      { parse_mode: 'HTML' },
    );

    // Fetch upstream, then store to cache
    const allDukun = await Dukun.find({});
    await redis.MSET('dukun:all', JSON.stringify(allDukun));
    return;
  }

  // Dukun leaderboard LOL.
  const dukunData = await redis.GET('dukun:all');
  if (!dukunData) {
    await context.reply(
      'No dukun data available. Try to ngedukun and ask someone to reply your message with /dukun +1. Jangan lupa dipasang sesajennya.',
      { parse_mode: 'HTML' },
    );
    return;
  }

  /**
   * @type {Record<string, any>[]}
   */
  const dukunDataParsed = JSON.parse(dukunData);
  const leaderboard = dukunDataParsed.sort((a, b) => (a.points < b.points ? 1 : a.points > b.points ? -1 : 0));
  await context.telegram.sendMessage(
    context.chat.id,
    renderTemplate('dukun/dukun.template.hbs', { dukun: leaderboard.slice(0, 14), others: leaderboard.length - 15 }),
    { parse_mode: 'HTML' },
  );
}

export function register(bot, mongo, cache) {
  bot.command('dukun', (context) => dukun(context, mongo, cache));

  return [
    {
      command: 'dukun',
      description: 'Siapa yang paling dukun disini',
    },
  ];
}
