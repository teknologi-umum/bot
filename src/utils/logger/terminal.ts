import { inspect } from "util";
import { stderr, stdout } from "process";
import kleur from "kleur";

export const terminal = {
  log(message: any): void {
    const insp = inspect(message);
    stdout.write(
      `${kleur.gray(
        `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
      )} ${kleur.white(insp.slice(1, insp.length-1))}\n`
    );
  },
  warn(message: any): void {
    const insp = inspect(message);
    stdout.write(
      `${kleur.gray(
        `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
      )} ${kleur.yellow(insp.slice(1, insp.length-1))}\n`
    );
  },
  error(message: any): void {
    const insp = inspect(message);
    stderr.write(
      `${kleur.gray(
        `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
      )} ${kleur.red(insp.slice(1, insp.length-1))}\n`
    );
  },
  info(message: any): void {
    const insp = inspect(message);
    stdout.write(
      `${kleur.gray(
        `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
      )} ${kleur.blue(insp.slice(1, insp.length-1))}\n`
    );
  },
  success(message: any): void {
    const insp = inspect(message);
    stdout.write(
      `${kleur.gray(
        `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
      )} ${kleur.green(insp.slice(1, insp.length-1))}\n`
    );
  }
};
