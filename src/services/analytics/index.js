import mongoose from 'mongoose';

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
        isBot: Boolean,
      },
    ],
    updatedBy: {
      userID: String,
      name: String,
      userName: String,
      isBot: Boolean,
    },
    status: String,
    membersCount: Number,
    joinedAt: Date,
    updatedAt: Date,
  },
  { collection: 'analytics' },
);

/**
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {import('mongoose').Connection} mongo
 * @returns {{command: String, description: String}[]}
 */
export function register(bot, mongo) {
  bot.on('my_chat_member', async (context) => {
    const Analytics = mongo.model('Analytics', analyticsSchema, 'analytics');
    const { chat, from, date, new_chat_member } = context.myChatMember;
    if (chat.type === 'private') return;

    const chatMembers = await context.getChatMembersCount(chat.id);
    const chatAdministrators = await context.getChatAdministrators(chat.id);
    await Analytics.findOneAndUpdate(
      { groupID: chat.id },
      {
        $set: {
          updatedAt: new Date(date),
          title: chat.title,
          username: chat.username ?? '',
          type: chat.type,
          administrators: chatAdministrators.map((o) => ({
            userID: String(o.user.id),
            name: `${o.user.first_name} ${o.user.last_name ?? ''}`,
            userName: o.user.username ?? '',
            isBot: o.user.is_bot,
          })),
          updatedBy: {
            userID: String(from.id),
            name: `${from.first_name} ${from.last_name ?? ''}`,
            userName: from.username ?? '',
            isBot: from.is_bot,
          },
          membersCount: chatMembers,
          status: new_chat_member.status,
        },
        $setOnInsert: {
          groupID: String(chat.id),
        },
      },
      { upsert: true, new: true },
    );
  });

  return [];
}
