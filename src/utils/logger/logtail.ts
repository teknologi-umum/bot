/**
 * @typedef {Object} FullConfig
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

export interface FullConfig {
  chatID: string
  userID: string
  message: string
  // TODO: might need to refactor this one
  updateType?: "callback_query" | "channel_post" | "chat_member" | "chosen_inline_result" | "edited_channel_post" | "edited_message" | "inline_query" | "message" | "my_chat_member" | "pre_checkout_query" | "poll_answer" | "poll" | "shipping_query"
  chatType?: "channel" | "private" | "group" | "supergroup"
  command?: string
  sendText?: string
  httpRequestUrl?: string
  actions?: string
}

import { Logtail } from "@logtail/node";
import { Context } from "telegraf";

export class Logger {
  token: string;
  /**
   *
   * @param {String} token Loggly Token
   */
  constructor(token: string) {
    this.token = token;
  }

  /**
   * Send a log data to loggly.
   * @param {FullConfig} data
   * @return {Promise<Object>}
   */
  async log(data: FullConfig) {
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
   * @param {FullConfig} additionalData
   * @return {Promise<Object>}
   */
  async fromContext(context: Context, command = "", additionalData = {}) {
    const logged = await this.log({
      chatID: String(context.chat?.id) ?? "",
      userID: String(context.from?.id) ?? "",
      // TODO: add generic type on telegraf.Context to open up message.text
      message: context.message?.text ?? "",
      updateType: context.updateType,
      chatType: context.chat?.type,
      command,
      ...additionalData
    });

    return logged;
  }
}

export const logger = new Logger(String(process.env?.LOGTAIL_TOKEN || ""));
