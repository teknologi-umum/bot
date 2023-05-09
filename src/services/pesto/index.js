import { PestoClient } from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({ token: process.env.PESTO_TOKEN });

/**
 * 
 * @param {import('telegraf').Context} context
 * @param {String} language 
 */
async function executeCode(context, language) {
  
}

/**
 * 
 * @param {import('telegraf').Telegraf} bot 
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("c", (context) => executeCode(context, "C"));
  bot.command("cpp", (context) => executeCode(context, "C++"));
  bot.command("clisp", (context) => executeCode(context, "Common Lisp"));
  bot.command("dotnet", (context) => executeCode(context, ".NET"));
  bot.command("go", (context) => executeCode(context, "Go"));
  bot.command("java", (context) => executeCode(context, "Java"));
  bot.command("js", (context) => executeCode(context, "Javascript"));
  bot.command("julia", (context) => executeCode(context, "Julia"));
  bot.command("lua", (context) => executeCode(context, "Lua"));
  bot.command("php", (context) => executeCode(context, "PHP"));
  bot.command("python", (context) => executeCode(context, "Python"));
  bot.command("ruby", (context) => executeCode(context, "Ruby"));
  bot.command("sqlite3", (context) => executeCode(context, "SQLite3"));
  bot.command("v", (context) => executeCode(context, "V"));
  bot.command("brainfuck", (context) => executeCode(context, "Brainfuck"));
}