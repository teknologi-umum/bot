import { fetchCryptoCurrency } from "./crypto.js";
import { fetchCurrencyRate, getCurrencyQueriesRegex } from "./currency.js";
import { fetchStock } from "./stock.js";

export async function resolveStocks(source) {
  // query: $AALI-R.high
  const queries = source.match(
    /\$[A-Z]{4}(-[A-Z][A-Z\d]{0,2})?(\.[a-z]+)?\b/g
  );
  if (queries === null || queries.length === 0) return source;

  // cashtag: $AALI-R
  // stockCode: AALI-R
  const stockCodes = new Set();
  const stockByCode = {};
  for (const query of queries) {
    const [cashtag] = query.split(".");
    stockCodes.add(cashtag.substring(1));
  }

  // 4 or more stockCodes: throw error
  if (stockCodes.size > 3) throw "Terlalu banyak kode saham";

  let i = 0;
  for (const stockCode of stockCodes) {
    // 1 stockCode: no delay
    // 2 stockCodes: 5000ms delay
    // 3 stockCodes: 2500ms delay
    /* eslint-disable no-await-in-loop */
    if (i > 0) 
      await new Promise((resolve) =>
        setTimeout(resolve, 5000 / (stockCodes.size - 1))
      );
    /* eslint-enable no-await-in-loop */
    
    /* eslint-disable no-await-in-loop */
    const stock = await fetchStock(stockCode);
    /* eslint-enable no-await-in-loop */
    stockByCode[stockCode] = stock;
    i++;
  }

  // sort descending to prevent shorter queries to be
  // replaced before longer ones are replaced
  queries.sort((a, b) => b.localeCompare(a));
  for (const query of queries) {
    const [cashtag, property] = query.split(".");
    const stockCode = cashtag.substring(1);
    const stock = stockByCode[stockCode];

    if (property === undefined) 
      // no property specified, replace to close
      source = source.replaceAll(query, `(${stock.close})`);
    else if (stock[property] === undefined) 
      // invalid property
      throw `Saham tidak memiliki property ${property}`;
    else if (typeof stock[property] === "string") 
      source = source.replaceAll(
        query,
        `("${stock[property].replaceAll("\"", "\\\"")}")`
      );
    else 
      source = source.replaceAll(query, `(${stock[property]})`);
  }

  return source;
}

export async function resolveCryptoCurrencies(source) {
  // query: $BTCIDR.high
  const queries = source.match(/\$[A-Z]{3,8}(IDR|USDT)(\.[a-z]+)?\b/g);
  if (queries === null || queries.length === 0) return source;

  // cashtag: $BTCIDR
  // symbol: BTCIDR
  const symbols = new Set();
  const rateBySymbol = {};
  for (const query of queries) {
    const [cashtag] = query.split(".");
    symbols.add(cashtag.substring(1));
  }

  // 4 or more symbols: throw error
  if (symbols.size > 3) throw "Terlalu banyak simbol crypto";

  let i = 0;
  for (const symbol of symbols) {
    // 1 symbol: no delay
    // 2 symbols or more: 1000ms delay
    /* eslint-disable no-await-in-loop */
    if (i > 0) 
      await new Promise((resolve) => setTimeout(resolve, 1000));
    /* eslint-enable no-await-in-loop */
    
    /* eslint-disable no-await-in-loop */
    const rate = await fetchCryptoCurrency(symbol);
    /* eslint-enable no-await-in-loop */
    rateBySymbol[symbol] = rate;
    i++;
  }

  // sort descending to prevent shorter queries to be
  // replaced before longer ones are replaced
  queries.sort((a, b) => b.localeCompare(a));
  for (const query of queries) {
    const [cashtag, property] = query.split(".");
    const symbol = cashtag.substring(1);
    const rate = rateBySymbol[symbol];

    if (property === undefined) 
      // no property specified, replace to last
      source = source.replaceAll(query, `(${rate.last})`);
    else if (rate[property] === undefined) 
      // invalid property
      throw `Crypto tidak memiliki property ${property}`;
    else if (typeof rate[property] === "string") 
      source = source.replaceAll(
        query,
        `("${rate[property].replaceAll("\"", "\\\"")}")`
      );
    else 
      source = source.replaceAll(query, `(${rate[property]})`);
  }

  return source;
}

export async function resolveCurrencyRates(source) {
  // cashtag: $USDIDR
  const regex = await getCurrencyQueriesRegex();
  const cashtags = source.match(regex);
  if (cashtags === null || cashtags.length === 0) return source;

  // pair: USDIDR
  const pairs = new Set();
  for (const cashtag of cashtags) 
    pairs.add(cashtag.substring(1));
  

  // resolve rates
  const pairsWithRate = await Promise.all(
    [...pairs].map(async (pair) => {
      const rate = await fetchCurrencyRate(pair);
      return [pair, rate];
    })
  );
  for (const [pair, rate] of pairsWithRate) 
    source = source.replaceAll("$" + pair, `(${rate})`);
  

  return source;
}
