/**
 * Helper function to get the command arguments
 *
 * @param {string} cmd - Command name
 * @param {string} message - The original message
 * @return {string} command argument
 */
export const getCommandArgs = (cmd, context) => {
  const { message, me } = context;
  const cmdLength = cmd.length;

  if (message.startsWith(`/${cmd} `)) {
    return message.substring(cmdLength + 2);
  }

  if (message.startsWith(`/${cmd}@${me} `)) {
    return message.substring(cmdLength + me.length + 3);
  }

  return context.message;
};
