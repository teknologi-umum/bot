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
  
  if (text.startsWith(`/${cmd}@${context.me}`)) {
    return text.substring(cmd.length + context.me.length + 2)
      .split("")
      .map(char => {
        if (INVALID_CHAR_CODES.includes(char.charCodeAt(0))) {
          return "";
        }
        
        return char;
      })
      .join("")
      .trim();
  }
  
  if (text.startsWith(`/${cmd}`)) {
    return text.substring(cmd.length + 1)
      .split("")
      .map(char => {
        if (INVALID_CHAR_CODES.includes(char.charCodeAt(0))) {
          return "";
        }
        
        return char;
      })
      .join("")
      .trim();
  }

  return context.message.text;
};
