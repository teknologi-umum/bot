import got from "got";
import { sanitize } from "#utils/sanitize.js";

async function getStories() {
  const response = await got.get("https://hacker-news.firebaseio.com/v0/topstories.json", {
    headers: {
      Accept: "application/json"
    },
    responseType: "json"
  });

  return response.body;
}

async function getItem(id) {
  const response = await got.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
    headers: {
      Accept: "application/json"
    },
    responseType: "json"
  });

  return response.body;
}

/**
 * 
 * @param {import('telegraf').Telegraf<Context<Update>>} context 
 */
export async function run(context) {
  // Get all stories
  const allStories = await getStories();

  // Create an array for resulting stories
  const resultingStories = [];

  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  // Iterate each story
  for (const story of allStories) {
    // If the resultingStories' length is 10, we'll stop.
    if (resultingStories.length === 10) break;

    // eslint-disable-next-line no-await-in-loop
    const item = await getItem(story);
    if (item === undefined) continue;
    // We only want stories. Not job, comment, or poll
    if (item.type !== "story") continue;
    // We only want stories that's high in rating
    if (item.score !== undefined && item.score < 100) continue;
    // It's useless if it's dead.
    if (item.dead) continue;
    // We don't want old stories to come up. Limit this to last 24 hours.
    if (item.time !== undefined && (item.time * 1000) < last24Hours.getTime()) continue;

    resultingStories.push(item);
  }

  // Now we build the message
  let message = "<b>Today's Hacker News</b>\n\n";
  for (let i = 1; i <= resultingStories.length; i++) {
    const story = resultingStories[i-1];

    message += `${i}. <a href="${story.url}">${story.title}</a>\n`;
    if (story?.text) {
      message += sanitize(story.text, true);
      message += "\n";
    }

    if (i !== resultingStories.length) {
      message += "\n";
    }
  }

  // Finally, send the message
  await context.telegram.sendMessage(
    process.env.HOME_GROUP_ID, 
    message, 
    { parse_mode: "HTML", disable_web_page_preview: false }
  );
}