export async function fetchStock(stockCode) {
  if (typeof stockCode !== "string") throw "Kode saham harus berupa string";
  if (!/^[A-Z]{4}(?:-[A-Z][A-Z\d]{0,2})?$/.test(stockCode)) {
    throw `Kode saham ${stockCode} tidak valid`;
  }

  const requestSearchParams = new URLSearchParams();
  requestSearchParams.set("stockCode", stockCode);

  const response = await fetch(
    `https://gold.teknologiumum.com/stock?${requestSearchParams.toString()}`
  );

  if (response.status !== 200) {
    throw `Gagal mendapatkan data saham ${stockCode}`;
  }

  const body = await response.json();

  const mappedResponse = {
    name: body.symbol,
    close: body.close,
    previous: body.open,
    high: body.high,
    low: body.low,
    volume: body.volume,
    value: body.close
  };

  if (mappedResponse.name === "") throw stockCode;

  return mappedResponse;
}
