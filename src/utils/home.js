import dotenv from "dotenv";
import { pathTo } from "./path.js";

dotenv.config({ path: pathTo(import.meta.url, "../../.env") });

/**
 * isHomeGroup checks if we are in a home group or not
 * @param {import('telegraf').Context} context
 * @returns {boolean}
 */
export function isHomeGroup(context) {
  return String(context.chat.id) === process.env.HOME_GROUP_ID;
}

/**
 * isBigGroup checks if we are in a big group or not
 * @param {import('telegraf').Context} context
 * @returns {Promise<boolean>}
 */
export async function isBigGroup(context) {
  const num = await context.telegram.getChatMembersCount(context.chat.id);
  if (num > 500) return true;
  return false;
}
