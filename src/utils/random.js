import { randomNumber, shuffle } from 'carret';

/**
 * Shuffle the array with carret, then return the result.
 * @param {Array<any>} items
 * @param {Number} length
 * @returns {Array<any>}
 */
export function randomArray(items, length) {
  if (items.length < length) return items;

  const shuffled = shuffle(items);
  const result = [];
  for (let i = 0; i < length; i++) {
    const index = randomNumber(0, shuffled.length);
    result.push(shuffled[index]);
  }
  return result;
}
