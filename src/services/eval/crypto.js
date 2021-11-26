import got from "got";

export async function fetchCryptoCurrency(cryptoSymbol) {
  if (typeof cryptoSymbol !== "string") {
    throw "Simbol mata uang crypto harus berupa string";
  }
  if (!/^[A-Z]{3,8}(?:IDR|USDT)$/.test(cryptoSymbol)) {
    throw `Simbol mata uang crypto ${cryptoSymbol} tidak valid`;
  }

  const { statusCode, body } = await got.get(
    `https://indodax.com/api/ticker/${cryptoSymbol.toLowerCase()}`,
    {
      responseType: "json",
      throwHttpErrors: false
    }
  );

  if (statusCode !== 200) {
    throw `Gagal mendapatkan data crypto ${cryptoSymbol}`;
  }


  if (body.error_description !== undefined) {
    throw body.error_description;
  }


  return {
    last: parseFloat(body.ticker.last),
    buy: parseFloat(body.ticker.buy),
    sell: parseFloat(body.ticker.sell),
    high: parseFloat(body.ticker.high),
    low: parseFloat(body.ticker.low)
  };
}
