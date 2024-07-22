import { safeEval } from "./parser.js";
import { getCommandArgs } from "#utils/command.js";
import { logger } from "#utils/logger/logtail.js";

/**
 *
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function evalCommand(context) {
  const source = getCommandArgs("eval", context);

  const output = await safeEval(source, [
    // XXX(reinaldy): Since we're saving cost by reducing the number of VPS we own,
    //     we're disabling these features. They're making a HTTP call to one of our
    //     internal API, which is not available in the current setup.
    // resolveCurrencyRates,
    // resolveStocks,
    // resolveCryptoCurrencies
  ]);

  await context.replyWithMarkdown(`
Code:
\`\`\`
${source}
\`\`\`
Output:
\`\`\`
${output}
\`\`\`
  `);
  await logger.fromContext(context, "eval", { sendText: output });
}

/**
 * Evaluate javascript expression.
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("eval", evalCommand);

  return [
    {
      command: "eval",
      description: "Evaluate javascript expression."
    }
  ];
}
