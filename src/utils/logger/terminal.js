import { inspect } from "util";
import { stderr, stdout } from "process";
import kleur from "kleur";

function getTimestamp() {
  return `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
}

export const terminal = {
  log(message) {
    const insp = inspect(message);
    stdout.write(`${kleur.gray(`[${getTimestamp()}]`)} ${kleur.white(insp)}\n`);
  },
  warn(message) {
    const insp = inspect(message);
    stdout.write(
      `${kleur.gray(`[${getTimestamp()}]`)} ${kleur.yellow(insp)}\n`
    );
  },
  error(message) {
    const insp = inspect(message);
    stderr.write(`${kleur.gray(`[${getTimestamp()}]`)} ${kleur.red(insp)}\n`);
  },
  info(message) {
    const insp = inspect(message);
    stdout.write(`${kleur.gray(`[${getTimestamp()}]`)} ${kleur.blue(insp)}\n`);
  },
  success(message) {
    const insp = inspect(message);
    stdout.write(`${kleur.gray(`[${getTimestamp()}]`)} ${kleur.green(insp)}\n`);
  }
};
