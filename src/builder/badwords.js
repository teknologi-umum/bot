import mongoose from 'mongoose';
import { terminal } from '../utils/logger.js';
// import { Trie } from './trie.js';

const wordSchema = new mongoose.Schema(
  {
    value: String,
  },
  { collection: 'badstuff' },
);

/**
 * Initialize the bad words
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<Set>}
 */
export async function initialize(mongo) {
  const Words = mongo.model('Words', wordSchema, 'badstuff');
  const wordList = await Words.find({}, 'value', { sort: { value: 1 } });

  const array = [];
  for (const word of wordList) {
    array.push(word.value);
  }

  terminal.success('Array was built');
  return array;
}
