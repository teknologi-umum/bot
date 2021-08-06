import { compile } from 'tempura';
import { readFileSync } from 'fs';
import { join } from 'desm';

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

export { renderTemplate };
