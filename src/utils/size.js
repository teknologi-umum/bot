/**
 * Measure string size in bytes
 * @param {String} str String
 * @returns {Number} in bytes
 * Thanks stack overflow! https://stackoverflow.com/a/34332105
 */
export function sizeInBytes(str) {
  return new TextEncoder().encode(str).length;
}
