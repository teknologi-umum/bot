/**
 * @file temporal.js
 * @fileoverview I found one bug on Dayjs and I can't handle that anymore lol
 */

/**
 * Temporal is a class that provides date and time manipulation methods.
 */
export class Temporal {
  /**
   * @param {Date} date javascript new Date() object
   */
  constructor(date) {
    if (typeof date !== "object" || !(date instanceof Date)) {
      throw new TypeError("date must be a type of Date");
    }

    this._date = date;
  }

  /**
   * Check whether or not current time (from the constructor)
   * is equal to given date
   * @param {Date} dateToCompare javascript new Date() object
   * @param {'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'} unit Date unit
   * @returns {Boolean}
   */
  compare(dateToCompare, unit) {
    if (typeof dateToCompare !== "object" || !(dateToCompare instanceof Date)) {
      throw new TypeError("Come on bro, niat ga sih?");
    }

    switch (unit) {
    case "month": {
      return this._date.getMonth() === dateToCompare.getMonth();
    }
    case "week": {
      return this.#getWeek(this._date) === this.#getWeek(dateToCompare);
    }
    case "day": {
      return this._date.getDay() === dateToCompare.getDay();
    }
    case "hour": {
      return this._date.getHours() === dateToCompare.getHours();
    }
    case "minute": {
      return this._date.getMinutes() === dateToCompare.getMinutes();
    }
    case "second": {
      return this._date.getSeconds() === dateToCompare.getSeconds();
    }
    default: {
      throw new TypeError("unit is required!");
    }
    }
  }

  /**
   * Format Date from constructor into a.. uh.. formatted string.
   * @param {String} locale Defaults to en-US. See https://www.science.co.il/language/Locale-codes.php
   * @param {String} timezone Defaults to UTC. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * @param {Boolean} withTime Defaults to false. Whether or not you want to print time
   * @param {Boolean} withDay Defaults to false. Whether or not you want to print day
   * @returns {String}
   */
  formatDate(
    locale = "en-US",
    timezone = "UTC",
    withTime = false,
    withDay = false
  ) {
    if (
      typeof locale !== "string" ||
      typeof timezone !== "string" ||
      typeof withTime !== "boolean" ||
      typeof withDay !== "boolean"
    ) {
      throw new TypeError(
        "locale, timezone, withTime, or withDay was given with a wrong type"
      );
    }

    const intl = new Intl.DateTimeFormat(locale, {
      dateStyle: withDay ? "full" : "long",
      timeZone: timezone,
      timeStyle: withTime ? "long" : undefined
    }).format(this._date);

    return intl;
  }

  /**
   * Increase or decrease a date with given duration and unit.
   *
   * NOTE: This does not mutate the date object from the constructor
   * @param {Number} duration
   * @param {'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'} unit
   * @returns {Date}
   */
  add(duration, unit) {
    if (typeof duration !== "number") {
      throw new Error("duration must be a type of number");
    }

    switch (unit) {
    case "month": {
      const tempDate = new Date(this._date);
      tempDate.setMonth(this._date.getMonth() + duration);
      return tempDate;
    }
    case "week": {
      const tempDate = new Date(this._date);
      tempDate.setDate(this._date.getDate() + 7 * duration);
      return tempDate;
    }
    case "day": {
      const tempDate = new Date(this._date);
      tempDate.setDate(this._date.getDate() + duration);
      return tempDate;
    }
    case "hour": {
      const tempDate = new Date(this._date);
      tempDate.setHours(this._date.getHours() + duration);
      return tempDate;
    }
    case "minute": {
      const tempDate = new Date(this._date);
      tempDate.setMinutes(this._date.getMinutes() + duration);
      return tempDate;
    }
    case "second": {
      const tempDate = new Date(this._date);
      tempDate.setSeconds(this._date.getSeconds() + duration);
      return tempDate;
    }
    default: {
      throw new TypeError("unit is required!");
    }
    }
  }
  /**
   * Get current week
   * @param {Date} date
   * @returns {Number} The week of the year
   * @private
   */
  #getWeek(date) {
    if (!date || !(date instanceof Date)) {
      throw new Error("*face palms*");
    }

    const firstJanuary = new Date(new Date().getFullYear(), 0, 1);
    return Math.ceil(
      ((date - firstJanuary) / 86400000 + firstJanuary.getDay() + 1) / 7
    );
  }
}
