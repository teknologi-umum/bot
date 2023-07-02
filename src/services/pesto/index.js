import { getCommandArgs } from "#utils/command.js";
import { PestoClient } from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({ token: process.env.PESTO_TOKEN });

/**
 * 
 * @param {import('telegraf').Context} context
 * @param {String} command
 * @param {String} language 
 */
async function executeCode(context, command, language) {
  const code = getCommandArgs(command, context);
  if (!code) {
    return;
  }

  const codeResponse = await pestoClient.execute({
    language: language,
    version: "latest",
    code: code
  });

  if (codeResponse.compile.exitCode !== 0) {
    await context.telegram.sendMessage(
      context.chat.id,
      `<code>${codeResponse.compile.output.replace(
        /[\u00A0-\u9999<>&]/gim, 
        (i) => "&#" + i.charCodeAt(0) + ";")}</code>`,
      { 
        parse_mode: "HTML", 
        reply_to_message_id: context.message.message_id, 
        allow_sending_without_reply: true
      }
    );
  } else if (codeResponse.runtime.exitCode !== 0) {
    await context.telegram.sendMessage(
      context.chat.id,
      `<code>${codeResponse.runtime.output.replace(
        /[\u00A0-\u9999<>&]/gim, 
        (i) => "&#" + i.charCodeAt(0) + ";")}</code>`,
      { 
        parse_mode: "HTML", 
        reply_to_message_id: context.message.message_id, 
        allow_sending_without_reply: true
      }
    );
  } else if (codeResponse.runtime.output.length > 1000) {
    await context.telegram.sendMessage(
      context.chat.id,
      "<code>Output is too long</code>",
      { 
        parse_mode: "HTML", 
        reply_to_message_id: context.message.message_id, 
        allow_sending_without_reply: true
      }
    );
  } else {
    await context.telegram.sendMessage(
      context.chat.id,
      `Code:\n<code>${code.replace(
        /[\u00A0-\u9999<>&]/gim, 
        (i) => "&#" + i.charCodeAt(0) + ";")
      }</code>\n\nOutput:\n<code>${
        // Stolen from https://stackoverflow.com/a/23834738/3153224
        codeResponse.runtime.output.replace(
          /[\u00A0-\u9999<>&]/gim, 
          (i) => "&#" + i.charCodeAt(0) + ";")
      }</code>`,
      { 
        parse_mode: "HTML", 
        reply_to_message_id: context.message.message_id, 
        allow_sending_without_reply: true
      }
    );
  }
}

/**
 * 
 * @param {import('telegraf').Telegraf} bot 
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("c", (context) => executeCode(context, "c", "C"));
  bot.command("cpp", (context) => executeCode(context, "cpp", "C++"));
  bot.command("clisp", (context) => executeCode(context, "clisp", "Common Lisp"));
  bot.command("dotnet", (context) => executeCode(context, "dotnet", ".NET"));
  bot.command("go", (context) => executeCode(context, "go", "Go"));
  bot.command("java", (context) => executeCode(context, "java", "Java"));
  bot.command("js", (context) => executeCode(context, "js", "Javascript"));
  bot.command("julia", (context) => executeCode(context, "julia", "Julia"));
  bot.command("lua", (context) => executeCode(context, "lua", "Lua"));
  bot.command("php", (context) => executeCode(context, "php", "PHP"));
  bot.command("python", (context) => executeCode(context, "python", "Python"));
  bot.command("ruby", (context) => executeCode(context, "ruby", "Ruby"));
  bot.command("sqlite3", (context) => executeCode(context, "sqlite3", "SQLite3"));
  bot.command("ts", (context) => executeCode(context, "ts", "Typescript"));
  bot.command("v", (context) => executeCode(context, "v", "V"));
  bot.command("brainfuck", (context) => executeCode(context, "brainfuck", "Brainfuck"));

  return [
    {
      command: "c",
      description: "Execute C code"
    },
    {
      command: "cpp",
      description: "Execute C++ code"
    },
    {
      command: "clisp",
      description: "Execute Common Lisp code"
    },
    {
      command: "dotnet",
      description: "Execute .NET code"
    },
    {
      command: "go",
      description: "Execute Go code"
    },
    {
      command: "java",
      description: "Execute Java code"
    },
    {
      command: "js",
      description: "Execute Javascript code"
    },
    {
      command: "julia",
      description: "Execute Julia code"
    },
    {
      command: "lua",
      description: "Execute Lua code"
    },
    {
      command: "php",
      description: "Execute PHP code"
    },
    {
      command: "python",
      description: "Execute Python code"
    },
    {
      command: "ruby",
      description: "Execute Ruby code"
    },
    {
      command: "sqlite3",
      description: "Execute SQLite3 code"
    },
    {
      command: "ts",
      description: "Execute Typescript code"
    },
    {
      command: "v",
      description: "Execute V code"
    },
    {
      command: "brainfuck",
      description: "Execute Brainfuck code"
    }
  ];
}