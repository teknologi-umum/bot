import { readFileSync } from 'fs';
import { pathTo } from '../../utils/path.js';
import { compile } from 'tempura';

/**
 * Render tempura template into HTML string
 * @returns {any}
 */
export function renderTemplate(data) {
  const file = readFileSync(pathTo(import.meta.url, 'search.template.hbs'), { encoding: 'utf8' });
  return compile(file)(data);
}
