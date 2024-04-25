export async function fetchCryptoCurrency(cryptoSymbol) {
  if (typeof cryptoSymbol !== "string") {
    throw "Simbol mata uang crypto harus berupa string";
  }
  if (!/^[A-Z]{3,8}(?:IDR|USDT)$/.test(cryptoSymbol)) {
    throw `Simbol mata uang crypto ${cryptoSymbol} tidak valid`;
  }
  const requestSearchParams = new URLSearchParams();
  requestSearchParams.set("symbol", cryptoSymbol.toUpperCase());
  const response = await fetch(`https://gold.teknologiumum.com/crypto?${requestSearchParams.toString()}`);

  if (response.status !== 200) {
    throw `Gagal mendapatkan data crypto ${cryptoSymbol}`;
  }

  const body = await response.json();

  return {
    symbol: body.symbol,
    base_currency: body.base_currency,
    quote_currency: body.quote_currency,
    open: parseFloat(body.open),
    high: parseFloat(body.high),
    low: parseFloat(body.low),
    last: parseFloat(body.last),
    volume: parseFloat(body.volume),
    date: new Date(body.date)
  };
}
