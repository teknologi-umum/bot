/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function help(context) {
  await context.telegram.sendMessage(
    context.message.chat.id,
    `Hi there! For available commands, type / and browse through the autocomplete.\n\n` +
      `I'm also an open source bot! If you want to add me into your group or have any feature request, ` +
      `please refer to the <a href="https://github.com/teknologi-umum/bot">Github repository</a>.`,
    {
      parse_mode: 'HTML',
    },
  );
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('help', help);

  return [
    {
      command: 'help',
      description: 'Get help information.',
    },
  ];
}
