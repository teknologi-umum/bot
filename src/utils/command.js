/**
 * Helper function to get the command arguments
 * @param {string} cmd - Command name
 * @param {import("telegraf").Context} context - The Telegraf context
 * @return {string} command argument, empty string if no params are supplied
 */
export const getCommandArgs = (cmd, context) => {
  const {
    message: { text }
  } = context;

  if (text.startsWith(`/${cmd}`)) {
    const results = text.split(" ");
    results.shift();
    const result = results.join(" ").split("").filter((t)=>![8203, 8204, 8206, 8207].includes(t.charCodeAt(0)));
    return result.length > 0 ? result.join(""): "";
  }
  return context.message.text;
};
