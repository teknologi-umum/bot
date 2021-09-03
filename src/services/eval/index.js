import { safeEval } from './parser.js';
import { getCommandArgs } from '../../utils/command.js';
import { resolveStocks } from './superpowers.js';

/**
 *
 * @param {import('telegraf').Context} context
 */
async function evalCommand(context) {
  const source = getCommandArgs('eval', context);

  const output = safeEval(source, [resolveStocks]);

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
}

/**
 * Evaluate javascript expression.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('eval', evalCommand);

  return [
    {
      command: 'eval',
      description: 'Evaluate javascript expression.',
    },
  ];
}
