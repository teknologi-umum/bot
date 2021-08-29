import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { cleanFilter, isClean } from '../src/services/search/filter.js';
import { Trie } from '../src/builder/trie.js';

test.skip('should output only clean stuffs', () => {
  const trie = new Trie();
  trie.add('murmur', 1);
  trie.add('youtube.com', 2);

  const fakeSearch = [
    {
      href: 'https://github.com/teknologi-umum/bot',
      text: 'teknologi-umum/bot: Bot for a more interactive Teknologi Umum group',
    },
    { href: 'https://www.youtube.com', text: 'YouTube' },
    { href: 'https://asoftmurmur.com', text: 'A Soft Murmur' },
    { href: 'https://www.figma.com', text: 'Figma' },
  ];

  const output = cleanFilter(fakeSearch, trie);
  assert.equal(output, [
    {
      href: 'https://github.com/teknologi-umum/bot',
      text: 'teknologi-umum/bot: Bot for a more interactive Teknologi Umum group',
    },
    { href: 'https://www.figma.com', text: 'Figma' },
  ]);
});

test.skip('should be okay with weebs', () => {
  const trie = new Trie();
  trie.add('Q屋号の由来は', 1);
  trie.add('チャンネル', 2);

  const fakeSearch = [
    {
      href: 'https://www3.nhk.or.jp/news/',
      text: 'Nhkニュース 速報・最新情報',
    },
    { href: 'https://www.youtube.com/user/PokemonCoJp', text: 'ポケモン公式YouTubeチャンネル - YouTube' },
    {
      href: 'https://www.bbc.com/japanese',
      text: 'BBCニュースが伝える世界の動き、BBCニュースならではの視点を日本語でお届けします。世界各地で取材する日々の出来事、世界の人が注目して .',
    },
    {
      href: 'https://store.asalways.jp/',
      text: 'Japanese Ramen Noodle Lab Q屋号の由来は「日本のラーメン研究所」日本が誇る日本食ラーメンを世界の人に知ってもらいたいという想いもあり英語表記にしています。',
    },
  ];

  const output = cleanFilter(fakeSearch, trie);
  assert.equal(output, [
    {
      href: 'https://www3.nhk.or.jp/news/',
      text: 'Nhkニュース 速報・最新情報',
    },
    {
      href: 'https://www.bbc.com/japanese',
      text: 'BBCニュースが伝える世界の動き、BBCニュースならではの視点を日本語でお届けします。世界各地で取材する日々の出来事、世界の人が注目して .',
    },
  ]);
});

test('should know if a given input is clean or not - true', () => {
  const trie = new Trie();
  trie.add('murmur', 1);
  trie.add('youtube.com', 2);
  const fakeInput = ['something fishy'];

  const output = isClean(fakeInput, trie);
  assert.equal(output, true);
});

test('should know if a given input is clean or not - false', () => {
  const trie = new Trie();
  trie.add('murmur', 1);
  trie.add('youtube.com', 2);
  const fakeInput = ['murmur'];

  const output = isClean(fakeInput, trie);
  assert.equal(output, false);
});

test.run();
