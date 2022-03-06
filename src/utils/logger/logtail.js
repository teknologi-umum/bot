import { Logtail } from "@logtail/node";

/**
 * @typedef {Object} LogData
 * @property {String} chatID
 * @property {String} userID
 * @property {String} message
 * @property {"callback_query" | "channel_post" | "chat_member" | "chosen_inline_result" | "edited_channel_post" | "edited_message" | "inline_query" | "message" | "my_chat_member" | "pre_checkout_query" | "poll_answer" | "poll" | "shipping_query"=} updateType
 * @property {"channel" | "private" | "group" | "supergroup"=} chatType
 * @property {String=} command
 * @property {String=} sendText
 * @property {String=} httpRequestUrl
 * @property {String=} actions
 */

/**
 * Logger is a class that provides logging utilities. It is a wrapper around the Logtail library.
 */
export class Logger {
  /**
   *
   * @param {String} token Loggly Token
   */
  constructor(token) {
    if (
      process.env.NODE_ENV === "production" &&
      (token === null || token === undefined || token === "")
    ) {
      throw TypeError("Empty token is not allowed for production environment!");
    }

    this.token = token;
  }

  /**
   * Send a log data to loggly.
   * @param {LogData} data
   * @return {Promise<Object>}
   */
  async log(data) {
    if (!data) {
      return Promise.reject("`data` should not be empty");
    }

    if (!this.token || process.env.NODE_ENV !== "production") {
      return {};
    }

    const logtail = new Logtail(this.token);
    const response = await logtail.info(data.command, { ...data });
    return response;
  }
  /**
   * Send a log data from the given context
   * @param {import('telegraf').Context} context
   * @param {String} command
   * @param {LogData} additionalData
   * @return {Promise<Object>}
   */
  async fromContext(context, command = "", additionalData = {}) {
    const logged = await this.log({
      chatID: context.chat.id,
      userID: context.from.id,
      message: context.message?.text ?? "",
      updateType: context.updateType,
      chatType: context.chat.type,
      command,
      ...additionalData
    });

    return logged;
  }
}

export const logger = new Logger(String(process.env?.LOGTAIL_TOKEN || ""));
