const INVALID_CHAR_CODES = [8203, 8204, 8206, 8207];

/**
 * getCommandArgs is function to get the command arguments from a given message.
 * @param {string} cmd - Command name
 * @param {import("telegraf").Context} context - The Telegraf context
 * @return {string} command argument, empty string if no params are supplied
 */
export const getCommandArgs = (cmd, context) => {
  if (
    cmd === null ||
    cmd === undefined ||
    cmd === "" ||
    context === undefined ||
    context === null
  ) {
    throw TypeError("Empty cmd and context is not allowed!");
  }

  const text = context.message.text;
  
  if (text.startsWith(`/${cmd}`)) {
    const [, ...results] = text.split(" ");
    const result = results
      .join(" ")
      .split("")
      .filter((t) => !INVALID_CHAR_CODES.includes(t.charCodeAt(0)));
    return result.length > 0 ? result.join("") : "";
  }

  return context.message.text;
};
