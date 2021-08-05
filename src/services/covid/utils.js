import { compile } from 'tempura';
import { readFileSync } from 'fs';
import { join } from 'desm';
import { request } from 'undici';

/**
 * Render tempura template into a HTML string
 * @param {String} type
 * @returns {any}
 */
function renderTemplate(type) {
  return compile(
    readFileSync(join(import.meta.url, `${type}.template.hbs`), {
      encoding: 'utf8',
    }),
  );
}

/**
 * Fetch countries that can be searched and cached.
 * @param {*} redis 
 * @returns {Promise<Object>}
 */
async function fetchCountries(redis) {
  const { body } = await request('https://api.covid19api.com/countries');
  const data = await body.json();
  await redis.SETNX('redis:countries', JSON.stringify(data));
  return data;
}

export { renderTemplate, fetchCountries };
