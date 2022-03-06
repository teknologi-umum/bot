/**
 * sizeInBytes is a function to measure string size in bytes.
 *
 * Thanks stack overflow! https://stackoverflow.com/a/34332105
 * @param {String} str String
 * @returns {Number} in bytes
 */
export function sizeInBytes(str) {
  if (str === null || str === undefined) {
    throw TypeError("String is required!");
  }

  return new TextEncoder().encode(str).length;
}
