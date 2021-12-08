import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

/**
 * A oneline solution for resolving path.resolve(__dirname, 'something.js') to an absolute path.
 * I created this as a replacement for desm, because you don't need another
 * npm package just for resolving this one.
 * @param {ImportMeta.url} url import.meta.url
 * @param {String} path
 * @returns {import("fs").PathLike} Absolute path from the given path string
 * @example
 * // Say we call the function from src/app.js
 * const envPath = resolve('../env') // returns the full .env path outside the src dir
 * const redisPath = resolve('./utils/redis.js') // returns what you expect.
 */
export function pathTo(url, path) {
  return resolve(dirname(fileURLToPath(url)), path);
}
