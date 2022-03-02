import { readFileSync } from "fs";
import { resolve } from "path";
import { compile } from "tempura";

/**
 * Helper function to render the template
 * @param {string} path - The template path, relative to the project `src/services` directory
 * @param {Object} data - Data you want to pass to the template
 * @return {Promise<string>}
 */
export function renderTemplate(path, data) {
  if (path === null || path === undefined) {
    throw TypeError("Path is required!");
  }

  const templatePath = resolve("src", "services", path);
  const template = readFileSync(templatePath, { encoding: "utf8" });
  return compile(template)(data);
}
