import QRCode from "qrcode";
import { getCommandArgs } from "#utils/command.js";
import { logger } from "#utils/logger/logtail.js";

/**
 * Generate QR Code
 * 
 * @param {String} text 
 * @returns {base64: String}
 */
async function generateQR(text) {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    logger.log({
      message: err,
      command: "qr"
    });
    return false;
  }
}

/**
 * Handling /qr command
 * 
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function qr(context) {
  const query = getCommandArgs("qr", context);
  
  if (query === "") {
    await context.telegram.sendMessage(
      context.message.chat.id,
      "Cara pakai ketik: /qr &lt;teks/link yang mau diubah jadi QR Code&gt;\n\nContoh: \n<code>/qr https://google.com</code>",
      { parse_mode: "HTML" }
    );
    return;
  }

  const image = await generateQR(query);

  if (!image) {
    await context.telegram.sendMessage(
      context.message.chat.id,
      "Oppss.. Service sedang error.."
    );
  } else {  
    const buffer = Buffer.from(image.split(",")[1], "base64");
    
    await context.telegram.sendPhoto(
      context.message.chat.id,
      { source: buffer },
      { caption: query }
    );  
  }

  await logger.fromContext(context, "qr");
}

/**
 * Register QRCode to command
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */
export function register(bot) {
  bot.command("qr", qr);

  return [
    {
      command: "qr",
      description: "Generate QRCode"
    }
  ];
}
