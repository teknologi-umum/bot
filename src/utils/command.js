/**
 * Helper function to get the command arguments
 *
 * @param {string} cmd - Command name
 * @param {import("telegraf").Context} context - The Telegraf context
 * @return {string} command argument
 */
export const getCommandArgs = (cmd, context) => {
  const {
    message: { text },
    me,
  } = context;
  const cmdLength = cmd.length;

  if (text.startsWith(`/${cmd} `)) {
    return text.substring(cmdLength + 2);
  }

  if (text.startsWith(`/${cmd}@${me} `)) {
    return text.substring(cmdLength + me.length + 3);
  }

  return context.message.text;
};
