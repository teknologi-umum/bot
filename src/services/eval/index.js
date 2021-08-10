import { safeEval } from './parser.js';
import { getCommandArgs } from '../../utils/command.js';

/**
 *
 * @param {import('telegraf').Context} context
 */
async function evalCommand(context) {
  const {
    message: { text },
  } = context;

  const source =
    text.startsWith('```') && text.endsWith('```')
      ? text.substring(3, text.length - 4)
      : getCommandArgs('eval', context);

  const output = safeEval(source);

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
