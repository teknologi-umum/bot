import dayjs from 'dayjs';
import redisClient from '../utlis/redis.js';

/**
 * Process poll created by user to not
 * @param {import('telegraf').Context<import('telegraf/typings/core/types/typegram').Update>} context
 * @param {import('redis').RedisClient} cache
 * @returns {Promise<void>}
 */
async function poll(context, cache) {
  try {
    const redis = redisClient(cache);
    const currentTime = dayjs().add(7, 'hours').toISOString();

    const [getLastMessageContent, lastPinnedMessage, lastPollDate] = await redis.MGET(
      `poll:${String(context.message.chat.id)}:message:content`,
      `poll:${String(context.message.chat.id)}:message:id`,
      `poll:${String(context.message.chat.id)}:date`,
    );
    let lastMessageContent = JSON.parse(getLastMessageContent);

    if (!lastMessageContent || dayjs(lastPollDate).diff(currentTime, 'day') !== 0) {
      lastMessageContent = { survey: [], quiz: [] };
    }

    const poll = context.message.poll;

    if (poll.type === 'regular') {
      lastMessageContent.survey.push({ id: context.message.message_id, text: poll.question });
    } else if (poll.type === 'quiz') {
      lastMessageContent.quiz.push({ id: context.message.message_id, text: poll.question });
    }

    const chat = await context.getChat();
    const chatLink = `https://t.me/${chat.username}`;

    const preformatMessage =
      `*${dayjs().format('DD MMMM YYYY')}*\n\n` +
      `Quiz\n` +
      `${lastMessageContent.quiz.map((i) => `[${i.text}](${chatLink}/${i.id})`).join('\n')}\n\n` +
      `Survey\n` +
      `${lastMessageContent.survey.map((i) => `[${i.text}](${chatLink}/${i.id})`).join('\n')}\n`;

    if (lastPollDate && dayjs(lastPollDate).diff(currentTime, 'day') === 0) {
      // append to existing message
      await context.telegram.editMessageText(context.message.chat.id, Number(lastPinnedMessage), '', preformatMessage, {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      });
      await redis.MSET(`poll:${String(context.message.chat.id)}:message:content`, JSON.stringify(lastMessageContent));
    } else {
      // create new message
      const response = await context.telegram.sendMessage(context.message.chat.id, preformatMessage, {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      });

      await redis.MSET(
        `poll:${String(context.message.chat.id)}:message:id`,
        String(response.message_id),
        `poll:${String(context.message.chat.id)}:message:content`,
        JSON.stringify(lastMessageContent),
        `poll:${String(context.message.chat.id)}:date`,
        currentTime,
      );
      await context.telegram.pinChatMessage(context.message.chat.id, response.message_id, {
        disable_notification: false,
      });
    }
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export default poll;
