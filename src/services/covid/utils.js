import { compile } from 'tempura';
import { readFileSync } from 'fs';
import { join } from 'desm';
import { request } from 'undici';

const templates = {
  country: readFileSync(join(import.meta.url, 'country.template.hbs'), {
    encoding: 'utf8',
  }),
  global: readFileSync(join(import.meta.url, 'global.template.hbs'), {
    encoding: 'utf8',
  }),
};

/**
 * Render tempura template into a HTML string
 * @param {String} type
 * @returns {any}
 */
function renderTemplate(type) {
  return compile(templates[type]);
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
