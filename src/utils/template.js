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
  const template = readFileSync(resolve("src", "services", path), {
    encoding: "utf8",
  });
  return compile(template)(data);
}
