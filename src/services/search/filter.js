import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema(
  {
    value: String,
  },
  { collection: 'badstuff' },
);

/**
 * Only output clean array or search results
 * @param {Array<{href: string, text: string}>} search
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<Array<{href: string, text: string}>>}
 */
export async function cleanFilter(search, mongo) {
  const Words = mongo.model('Words', wordSchema, 'badstuff');
  const tempAggregate = [];

  for (let i = 0; i < search.length; i++) {
    const { href, text } = search[i];
    const textArray = text.split(/[^A-Za-z0-9]/gi);
    const url = new URL(href);
    const urlArray = [url.hostname.replace(/www[A-Za-z0-9]*\./i, ''), ...url.pathname.split('/')];
    tempAggregate.push(...textArray, ...urlArray);
  }

  const results = tempAggregate.reduce((s, w) => {
    s.add(w.toLowerCase());
    return s;
  }, new Set());

  const matches = await Words.aggregate([{ $match: { value: { $in: Array.from(results) } } }]);
  const dedupeMatches = matches.map((m) => m.value);

  const result = search.filter((o) => {
    for (const match of dedupeMatches) {
      if (o.href.includes(match) || o.text.includes(match)) {
        return false;
      }
    }

    return true;
  });
  return result;
}

/**
 * Check if input is clean or not
 * @param {string} input
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<Boolean>}
 */
export async function isClean(input, mongo) {
  const Words = mongo.model('Words', wordSchema, 'badstuff');
  const words = input
    .split(/\s+/)
    .map((w) => w.toLowerCase())
    .reduce((s, w) => {
      s.add(w);
      return s;
    }, new Set());
  const matches = await Words.aggregate([{ $match: { value: { $in: Array.from(words) } } }]);
  return matches.length === 0;
}
