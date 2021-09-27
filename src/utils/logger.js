/* eslint-disable no-console */

import { inspect } from 'util';
import * as sentry from '@sentry/node';
import kleur from 'kleur';

sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

const terminal = {
  log(message) {
    console.log(
      `${kleur.gray(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`)} ${kleur.white(
        inspect(message),
      )}`,
    );
  },
  warn(message) {
    console.warn(
      `${kleur.gray(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`)} ${kleur.yellow(
        inspect(message),
      )}`,
    );
  },
  error(message) {
    console.error(
      `${kleur.gray(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`)} ${kleur.red(
        inspect(message),
      )}`,
    );
  },
  info(message) {
    console.info(
      `${kleur.gray(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`)} ${kleur.blue(
        inspect(message),
      )}`,
    );
  },
  success(message) {
    console.log(
      `${kleur.gray(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`)} ${kleur.green(
        inspect(message),
      )}`,
    );
  },
};

export { sentry, terminal };
