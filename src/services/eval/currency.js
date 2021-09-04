import got from 'got';
import { SingleValueCache } from '../../utils/cache.js';

// cache TTL: 10 minutes
const cacheTtl = 10 * 60 * 1000;

// value cache
const cache = new SingleValueCache(cacheTtl);

async function getCurrencyDictionary() {
  return await cache.getOrCreate(async () => {
    const { statusCode, body } = await got.get('https://monty.vmasdani.my.id/currencies', {
      responseType: 'json',
      throwHttpErrors: false,
    });

    if (statusCode !== 200) {
      throw 'Gagal mendapatkan data forex';
    }

    return body.reduce((currencyBySymbol, currency) => {
      currencyBySymbol[currency.name] = currency;
      return currencyBySymbol;
    }, {});
  });
}

export async function getCurrencyQueriesRegex() {
  const currencyBySymbol = await getCurrencyDictionary();
  const symbols = Object.keys(currencyBySymbol);
  return new RegExp(
    '\\$(' +
      symbols
        .map((left) =>
          symbols
            .filter((right) => left !== right)
            .map((right) => `${left}${right}`)
            .join('|'),
        )
        .join('|') +
      ')\\b',
    'g',
  );
}

export async function fetchCurrencyRate(currencyPair) {
  if (typeof currencyPair !== 'string') throw 'Pair mata uang harus berupa string';
  if (currencyPair.length !== 6) throw `Pair mata uang ${currencyPair} tidak valid`;
  if (currencyPair.toUpperCase() !== currencyPair) throw `Pair mata uang ${currencyPair} tidak valid`;
  if (currencyPair.substring(0, 3) === currencyPair.substring(3)) return 1;

  const currencyBySymbol = await getCurrencyDictionary();

  const leftCurrency = currencyBySymbol[currencyPair.substring(0, 3)];
  const rightCurrency = currencyBySymbol[currencyPair.substring(3)];
  if (leftCurrency === undefined || rightCurrency === undefined) throw `Pair mata uang ${currencyPair} tidak valid`;

  return rightCurrency.rate / leftCurrency.rate;
}
