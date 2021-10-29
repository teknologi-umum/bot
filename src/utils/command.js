/**
 * Helper function to get the command arguments
 * @param {string} cmd - Command name
 * @param {import("telegraf").Context} context - The Telegraf context
 * @return {string} command argument, empty string if no params are supplied
 */
export const getCommandArgs = (cmd, context) => {
  const {
    message: { text },
  } = context;

  if (text.startsWith(`/${cmd}`)) {
    const result = text.split(" ");
    result.shift();
    return result.length > 0 ? result.join(" ") : "";
  }

  return context.message.text;
};
