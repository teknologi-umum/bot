import got from "got";

export async function fetchStock(stockCode) {
  if (typeof stockCode !== "string") throw "Kode saham harus berupa string";
  if (!/^[A-Z]{4}(?:-[A-Z][A-Z\d]{0,2})?$/.test(stockCode)) {
    throw `Kode saham ${stockCode} tidak valid`;
  }

  const requestSearchParams = new URLSearchParams();
  requestSearchParams.set("stockCode", stockCode);

  const { statusCode, body } = await got.get(
    `https://gold.teknologiumum.com/stock?${requestSearchParams.toString()}`,
    {
      responseType: "json",
      throwHttpErrors: false
    }
  );

  if (statusCode !== 200) {
    throw `Gagal mendapatkan data saham ${stockCode}`;
  }

  const response = {
    name: body.symbol,
    close: body.close,
    previous: body.open,
    high: body.high,
    low: body.low,
    volume: body.volume,
    value: body.close
  };


  if (response.name === "") throw stockCode;

  return response;
}
