import { logger } from "#utils/logger/logtail.js";
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    groupID: String,
    title: String,
    username: String,
    type: String,
    administrators: [
      {
        userID: String,
        name: String,
        userName: String,
        isBot: Boolean
      }
    ],
    updatedBy: {
      userID: String,
      name: String,
      userName: String,
      isBot: Boolean
    },
    status: String,
    membersCount: Number,
    joinedAt: Date,
    updatedAt: Date
  },
  { collection: "analytics" }
);

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo) {
  bot.on("my_chat_member", async (context) => {
    const Analytics = mongo.model("Analytics", analyticsSchema, "analytics");
    const { chat, from, new_chat_member: newChatMember } = context.myChatMember;
    if (chat.type === "private") return;

    const chatMembers =
      newChatMember.status !== "kicked"
        ? await context.getChatMembersCount(chat.id)
        : 0;
    const chatAdministrators =
      newChatMember.status !== "kicked"
        ? await context.getChatAdministrators(chat.id)
        : [];
    await Analytics.findOneAndUpdate(
      { groupID: chat.id },
      {
        $set: {
          updatedAt: new Date(),
          title: chat.title,
          username: chat.username ?? "",
          type: chat.type,
          administrators: chatAdministrators.map((o) => ({
            userID: String(o.user.id) ?? "",
            name: `${o.user.first_name} ${o.user.last_name ?? ""}`,
            userName: o.user.username ?? "",
            isBot: o.user.is_bot ?? false
          })),
          updatedBy: {
            userID: String(from.id),
            name: `${from.first_name} ${from.last_name ?? ""}`,
            userName: from.username ?? "",
            isBot: from.is_bot
          },
          membersCount: chatMembers,
          status: newChatMember.status
        },
        $setOnInsert: {
          groupID: String(chat.id),
          joinedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    await logger.fromContext(context, "analytics", {
      actions: `I got updated to ${newChatMember.status}`
    });
  });

  return [];
}
