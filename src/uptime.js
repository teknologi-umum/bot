import dotenv from "dotenv";
import got from "got";
import * as Sentry from "@sentry/node";
import { pathTo } from "#utils/path.js";

dotenv.config({ path: pathTo(import.meta.url, "../.env") });

const UPTIME_MONITOR_URL = process.env.UPTIME_MONITOR_URL;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(url) {
  const searchParams = new URLSearchParams();
  searchParams.set("msg", "OK");
  searchParams.set("ping", "0");
  searchParams.set("status", "up");

  await got.get(url + "?" + searchParams.toString());
}

for (;;) {
  // Don't start the uptime service if the monitor url is empty.
  if (!UPTIME_MONITOR_URL) {
    break;
  }

  let done = false;
  
  // eslint-disable-next-line no-await-in-loop
  await run(UPTIME_MONITOR_URL)
    .catch((error) => {
      Sentry.captureException(error);
    })
    .finally(() => {
      done = true;
    });
  
  while (!done) {
    // wait
    await sleep(1000);
  }

  // How long do we need to sleep
  const now = new Date();
  const nextTime = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes() + 1, 0, 0);

  // eslint-disable-next-line no-await-in-loop
  await sleep(nextTime.getTime() - now.getTime());
}
