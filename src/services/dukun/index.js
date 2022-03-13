import mongoose from "mongoose";
import { getCommandArgs } from "#utils/command.js";
import { renderTemplate } from "#utils/template.js";
import { logger } from "#utils/logger/index.js";

/**
 * @typedef {Object} Dukun
 * @property {Number} userID
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} userName
 * @property {Number} points
 * @property {Boolean=} master
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const dukunSchema = new mongoose.Schema(
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
  { collection: "dukun" }
);

const MAX_POINT_INC = 10;
const MAX_POINT_DEC = -10;

/**
 * Fetch upstream data, then store to cache.
 * @param {import('mongoose').Model} dukunModel
 * @param {import('@teknologi-umum/nedb-promises')} cache - This type is wrong atm. Might fix this later.
 * @param {Dukun} updatedData
 * @returns {Promise<void>}
 */
async function fetchUpstream(dukunModel, cache, updatedData) {
  const allDukun = await dukunModel.find({}, null, { sort: { points: -1 } });
  await cache.update(
    { key: "dukun:all" },
    {
      key: "dukun:all",
      value: JSON.stringify(allDukun)
    },
    { upsert: true }
  );
  if (updatedData.master) {
    await cache.update(
      { key: "dukun:master" },
      {
        key: "dukun:master",
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
async function dukun(context, mongo, cache) {
  // Reject private and channels
  if (
    context.message.chat.type === "private" ||
    context.message.chat.type === "channel"
  ) {
    await context.reply("Dukun is only available on groups.");
    return;
  }

  const argument = getCommandArgs("dukun", context);

  const Dukun = mongo.model("Dukun", dukunSchema, "dukun");
  const dukunData = await cache.findOne({ key: "dukun:all" });
  const data = dukunData?.value || "[]";
  /**  @type {Dukun[]} */
  const dukunDataParsed = JSON.parse(data);

  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const isOwner = context.message.from.id === replyMessage.from.id;
    if (isOwner) {
      const MESSAGE =
        "Poin dukun hanya bisa diberikan oleh orang lain. Najis banget dah self-claimed🙄";
      await Promise.all([
        context.reply(MESSAGE),
        logger.fromContext(context, "dukun", {
          sendText: MESSAGE
        })
      ]);
      return;
    }

    if (replyMessage.from.id === 136817688 || replyMessage.from.is_bot) {
      const MESSAGE = "Cuma boleh buat orang-orang yang tidak fiktif.";
      await Promise.all([
        context.reply(MESSAGE),
        logger.fromContext(context, "dukun", {
          sendText: MESSAGE
        })
      ]);
      return;
    }

    const dukunMaster = await cache.findOne({ key: "dukun:master" });
    if (dukunMaster === null || dukunMaster === undefined) {
      /** @type {Dukun} */
      const master = await Dukun.findOne({ master: true });
      await cache.update(
        { key: "dukun:master" },
        {
          key: "dukun:master",
          id: String(master.userID),
          points: String(master.points)
        },
        { upsert: true }
      );
      dukunMaster.id = master.userID;
      dukunMaster.points = master.points;
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
      await context.reply("Poin dukun nggak valid. Nggak jadi ditambah.");
      return;
    }

    // Check if submitted dukun's a dukun master
    if (dukunMaster.id === String(replyMessage.from.id)) {
      // Allow insertion
      /** @type {Dukun} */
      const updatedData = await Dukun.findOneAndUpdate(
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
        `Dukun master <a href="tg://user?id=${replyMessage.from.id}">${
          replyMessage.from.first_name
        }${
          replyMessage.from.last_name !== undefined
            ? " " + replyMessage.from.last_name
            : ""
        }</a> points: ${updatedData.points}`,
        { parse_mode: "HTML" }
      );

      await fetchUpstream(Dukun, cache, updatedData);
      await logger.fromContext(context, "dukun", {
        sendText: sentMessage.text
      });
      return;
    }

    // Check submitted dukun's current point
    const submittedDukun =
      dukunDataParsed.find((d) => d.userID === replyMessage.from.id)?.points ??
      0;
    if (submittedDukun + point >= Number.parseInt(dukunMaster.points)) {
      // Only may increment up to dukunMasterPoint - 1
      point =
        point -
        (submittedDukun + point - Number.parseInt(dukunMaster.points)) -
        1;
    }

    // Add dukun point
    /** @type {Dukun} */
    const updatedData = await Dukun.findOneAndUpdate(
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
      `Dukun <a href="tg://user?id=${replyMessage.from.id}">${
        replyMessage.from.first_name
      }${
        replyMessage.from.last_name !== undefined
          ? " " + replyMessage.from.last_name
          : ""
      }</a> points: ${updatedData.points}`,
      { parse_mode: "HTML" }
    );

    await fetchUpstream(Dukun, cache, updatedData);
    await logger.fromContext(context, "dukun", { sendText: sentMessage.text });
    return;
  }

  // Dukun leaderboard LOL.
  if (!dukunData?.value) {
    await context.telegram.sendMessage(
      context.chat.id,
      "No dukun data available. Try to ngedukun and ask someone to reply your message with /dukun +1. Jangan lupa dipasang sesajennya.",
      { parse_mode: "HTML" }
    );
    await logger.fromContext(context, "dukun", {
      sendText:
        "No dukun data available. Try to ngedukun and ask someone to reply your message with /dukun +1. Jangan lupa dipasang sesajennya."
    });
    return;
  }

  const leaderboard = dukunDataParsed.sort((a, b) => b.points - a.points);
  const sentMessage = await context.telegram.sendMessage(
    context.chat.id,
    renderTemplate("dukun/dukun.template.hbs", {
      dukun: leaderboard.slice(0, 15),
      others: leaderboard.length - 15
    }),
    { parse_mode: "HTML" }
  );
  await logger.fromContext(context, "dukun", { sendText: sentMessage.text });
}

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @param {import('@teknologi-umum/nedb-promises')} cache
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo, cache) {
  bot.command("dukun", (context) => dukun(context, mongo, cache));

  return [
    {
      command: "dukun",
      description: "Siapa yang paling dukun disini"
    }
  ];
}
