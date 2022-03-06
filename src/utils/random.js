import { shuffle } from "carret";

/**
 * shuffleArray is a function to shuffle an array with carret, then return the result.
 * @param {Array<any>} items
 * @param {Number} length
 * @returns {Array<any>}
 */
export function shuffleArray(items, length) {
  if (items.length < length) return items;

  const shuffled = shuffle(items);
  const result = shuffled.slice(0, length);

  return result;
}
