import { fetchStock } from './stock.js';

export async function resolveStocks(source) {
  // query: $AALI-R.high
  const queries = source.match(/\$[A-Z]{4}(-[A-Z][A-Z0-9]{0,2})?(\.[a-z]+)?\b/g);
  if (queries === null || queries.length === 0) return source;

  // cashtag: $AALI-R
  // stockCode: AALI-R
  const stockCodes = new Set();
  const stockByCode = {};
  for (const query of queries) {
    const [cashtag] = query.split('.');
    stockCodes.add(cashtag.substring(1));
  }

  // 4 or more stockCodes: throw error
  if (stockCodes.size > 3) throw 'Terlalu banyak kode saham';

  let i = 0;
  for (const stockCode of stockCodes) {
    // 1 stockCode: no delay
    // 2 stockCodes: 5000ms delay
    // 3 stockCodes: 2500ms delay
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000 / (stockCodes.size - 1)));
    }
    const stock = await fetchStock(stockCode);
    stockByCode[stockCode] = stock;
    i++;
  }

  // sort descending to prevent shorter queries to be
  // replaced before longer ones are replaced
  queries.sort((a, b) => b.localeCompare(a));
  for (const query of queries) {
    const [cashtag, property] = query.split('.');
    const stockCode = cashtag.substring(1);
    const stock = stockByCode[stockCode];

    if (property === undefined) {
      // no property specified, replace to last
      source = source.replace(query, `(${stock.close})`);
    } else if (stock[property] === undefined) {
      // invalid property
      throw `Saham tidak memiliki property ${property}`;
    } else if (typeof stock[property] === 'string') {
      source = source.replace(query, `("${stock[property].replaceAll(`"`, `\\"`)}")`);
    } else {
      source = source.replace(query, `(${stock[property]})`);
    }
  }

  return source;
}
