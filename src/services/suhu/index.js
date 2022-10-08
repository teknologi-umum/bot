import mongoose from "mongoose";
import { getCommandArgs } from "#utils/command.js";
import { renderTemplate } from "#utils/template.js";
import { logger } from "#utils/logger/index.js";

/**
 * @typedef {Object} Suhu
 * @property {Number} userID
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} userName
 * @property {Number} points
 * @property {Boolean=} master
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const suhuSchema = new mongoose.Schema(
  {
    userID: Number,
    firstName: String,
    lastName: String,
    userName: String,
    points: Number,
    master: Boolean,
    createdAt: Date,
    updatedAt: Date
  },
  { collection: "suhu" }
);

const MAX_POINT_INC = 10;
const MAX_POINT_DEC = -10;

/**
 * Fetch upstream data, then store to cache.
 * @param {import('mongoose').Model} suhuModel
 * @param {import('@teknologi-umum/nedb-promises')} cache - This type is wrong atm. Might fix this later.
 * @param {Suhu} updatedData
 * @returns {Promise<void>}
 */
async function fetchUpstream(suhuModel, cache, updatedData) {
  const allSuhu = await suhuModel.find({}, null, { sort: { points: -1 } });
  await cache.update(
    { key: "suhu:all" },
    {
      key: "suhu:all",
      value: JSON.stringify(allSuhu)
    },
    { upsert: true }
  );
  if (updatedData.master) {
    await cache.update(
      { key: "suhu:master" },
      {
        key: "suhu:master",
        id: String(updatedData.userID),
        points: String(updatedData.points)
      },
      { upsert: true }
    );
  }
}

/**
 *
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {Promise<void>}
 */
async function suhu(context, mongo, cache) {
  // Reject private and channels
  if (
    context.message.chat.type === "private" ||
    context.message.chat.type === "channel"
  ) {
    await context.reply("Suhu is only available on groups.");
    return;
  }

  const argument = getCommandArgs("suhu", context);

  const Suhu = mongo.model("Suhu", suhuSchema, "suhu");
  const suhuData = await cache.findOne({ key: "suhu:all" });
  const data = suhuData?.value || "[]";
  /**  @type {Suhu[]} */
  const suhuDataParsed = JSON.parse(data);

  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const isOwner = context.message.from.id === replyMessage.from.id;
    if (isOwner) {
      const MESSAGE =
        "Poin suhu hanya bisa diberikan oleh orang lain. Najis banget dah self-claimed🙄";
      await Promise.all([
        context.reply(MESSAGE),
        logger.fromContext(context, "suhu", {
          sendText: MESSAGE
        })
      ]);
      return;
    }

    if (replyMessage.from.id === 136817688 || replyMessage.from.is_bot) {
      const MESSAGE = "Cuma boleh buat orang-orang yang tidak fiktif.";
      await Promise.all([
        context.reply(MESSAGE),
        logger.fromContext(context, "suhu", {
          sendText: MESSAGE
        })
      ]);
      return;
    }

    let suhuMaster = await cache.findOne({ key: "suhu:master" });
    if (suhuMaster === null || suhuMaster === undefined) {
      /** @type {Suhu} */
      const master = await Suhu.findOne({ master: true });
      await cache.update(
        { key: "suhu:master" },
        {
          key: "suhu:master",
          id: String(master.userID),
          points: String(master.points)
        },
        { upsert: true }
      );
      suhuMaster = {};
      suhuMaster.id = master.userID;
      suhuMaster.points = master.points;
    }

    /** @type {Number} point */
    let point;
    if (argument.startsWith("+")) {
      point = Math.abs(Number.parseInt(argument.replace("-", "")));
      if (point > MAX_POINT_INC) point = MAX_POINT_INC;
    } else if (argument.startsWith("-")) {
      point = Math.abs(Number.parseInt(argument.replace("-", ""))) * -1;
      if (point < MAX_POINT_DEC) point = MAX_POINT_DEC;
    } else {
      // No argument was given, +1 by default
      point = 1;
    }

    // yaelah ngapain sih bro
    if (Math.sign(point) === 0) {
      await context.reply("Om, seriusan?");
      return;
    }

    // Validate given point
    if (Number.isNaN(point) && !Number.isFinite(point)) {
      await context.reply("Poin suhu nggak valid. Nggak jadi ditambah.");
      return;
    }

    // Check if submitted suhu's a suhu master
    if (suhuMaster.id === String(replyMessage.from.id)) {
      // Allow insertion
      /** @type {Suhu} */
      const updatedData = await Suhu.findOneAndUpdate(
        { userID: replyMessage.from.id },
        {
          $inc: {
            points: point
          },
          $set: {
            firstName: replyMessage.from?.first_name ?? "",
            lastName: replyMessage.from?.last_name ?? "",
            userName: replyMessage.from?.username ?? "",
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      const sentMessage = await context.telegram.sendMessage(
        context.chat.id,
        `Suhu master <a href="tg://user?id=${replyMessage.from.id}">${
          replyMessage.from.first_name
        }${
          replyMessage.from.last_name !== undefined
            ? " " + replyMessage.from.last_name
            : ""
        }</a> points: ${updatedData.points}`,
        { parse_mode: "HTML" }
      );

      await fetchUpstream(Suhu, cache, updatedData);
      await logger.fromContext(context, "suhu", {
        sendText: sentMessage.text
      });
      return;
    }

    // Check submitted suhu's current point
    const submittedSuhu =
      suhuDataParsed.find((d) => d.userID === replyMessage.from.id)?.points ??
      0;
    if (submittedSuhu + point >= Number.parseInt(suhuMaster.points)) {
      // Only may increment up to suhuMasterPoint - 1
      point =
        point -
        (submittedSuhu + point - Number.parseInt(suhuMaster.points)) -
        1;
    }

    // Add suhu point
    /** @type {Suhu} */
    const updatedData = await Suhu.findOneAndUpdate(
      { userID: replyMessage.from.id },
      {
        $inc: {
          points: point
        },
        $set: {
          firstName: replyMessage.from?.first_name ?? "",
          lastName: replyMessage.from?.last_name ?? "",
          userName: replyMessage.from?.username ?? "",
          updatedAt: new Date()
        },
        $setOnInsert: {
          userID: replyMessage.from.id,
          master: false,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    const sentMessage = await context.telegram.sendMessage(
      context.chat.id,
      `Suhu <a href="tg://user?id=${replyMessage.from.id}">${
        replyMessage.from.first_name
      }${
        replyMessage.from.last_name !== undefined
          ? " " + replyMessage.from.last_name
          : ""
      }</a> points: ${updatedData.points}`,
      { parse_mode: "HTML" }
    );

    await fetchUpstream(Suhu, cache, updatedData);
    await logger.fromContext(context, "suhu", { sendText: sentMessage.text });
    return;
  }

  // Suhu leaderboard LOL.
  if (!suhuData?.value) {
    await context.telegram.sendMessage(
      context.chat.id,
      "No suhu data available. Try to ngesuhu and ask someone to reply your message with /suhu +1. Jangan lupa dipasang sesajennya.",
      { parse_mode: "HTML" }
    );
    await logger.fromContext(context, "suhu", {
      sendText:
        "No suhu data available. Try to ngesuhu and ask someone to reply your message with /suhu +1. Jangan lupa dipasang sesajennya."
    });
    return;
  }

  const leaderboard = suhuDataParsed.sort((a, b) => b.points - a.points);
  const sentMessage = await context.telegram.sendMessage(
    context.chat.id,
    renderTemplate("suhu/suhu.template.hbs", {
      suhu: leaderboard.slice(0, 15),
      others: leaderboard.length - 15
    }),
    { parse_mode: "HTML" }
  );
  await logger.fromContext(context, "suhu", { sendText: sentMessage.text });
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo, cache) {
  bot.command("suhu", (context) => suhu(context, mongo, cache));

  return [
    {
      command: "suhu",
      description: "Siapa yang paling suhu disini"
    }
  ];
}
