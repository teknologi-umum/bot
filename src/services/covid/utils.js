import { compile } from 'tempura';
import { readFileSync } from 'fs';
import { pathTo } from '../../utils/path.js';

const templates = {
  country: readFileSync(pathTo(import.meta.url, 'country.template.hbs'), {
    encoding: 'utf8',
  }),
  global: readFileSync(pathTo(import.meta.url, 'global.template.hbs'), {
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
