/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function help(context) {
  try {
    await context.reply(
      `Hi there! I can't do much right now. I only could pin and manage poll on this channel.\n\n` +
        `For feature request please refer to the <a href="https://github.com/teknologi-umum/bot">Github repository</a>.`,
      {
        parse_mode: 'HTML',
        reply_to_message_id: context.message.chat.id,
      },
    );
    return Promise.resolve();
  } catch (error) {
    Promise.reject(error);
  }
}

export default help;
