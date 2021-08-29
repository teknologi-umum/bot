import mongoose from 'mongoose';
import { terminal } from '../utils/logger.js';
import { Trie } from './trie.js';

const wordSchema = new mongoose.Schema(
  {
    value: String,
  },
  { collection: 'badstuff' },
);

const trie = new Trie();

/**
 * Initialize the bad words
 * @param {import('mongoose').Connection} mongo
 * @returns {Promise<Trie>}
 */
export async function initialize(mongo) {
  let count = 0;
  const Words = mongo.model('Words', wordSchema, 'badstuff');
  const wordList = await Words.find({});

  for (const word of wordList) {
    trie.add(word.value, count);
    count++;
  }

  terminal.success('Trie was built');
  return trie;
}
