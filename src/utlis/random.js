/**
 * Stolen from https://github.com/sindresorhus/random-item
 * @param {any[]} array
 * @returns {any}
 * @author Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 */
function randomItem(array) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array');
  }

  return array[Math.floor(Math.random() * array.length)];
}

export { randomItem };
