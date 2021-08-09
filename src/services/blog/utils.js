import { compile } from 'tempura';
import { readFileSync } from 'fs';
import { join } from 'desm';
import { randomNumber, shuffle } from 'carret';

/**
 * Render tempura template into HTML string
 * @returns {any}
 */
function renderTemplate(data) {
  const file = readFileSync(join(import.meta.url, 'template.hbs'), { encoding: 'utf8' });
  return compile(file)(data);
}

/**
 * Shuffle the array with carret, then return the result.
 * @param {Array<any>} items
 * @param {Number} length
 * @returns {Array<any>}
 */
function randomArray(items, length) {
  const shuffled = shuffle(items);
  const result = [];
  for (let i = 0; i < length; i++) {
    const index = randomNumber(0, shuffled.length);
    result.push(shuffled[index]);
  }
  return result;
}

export { renderTemplate, randomArray };
