import got from "got";
import cheerio from "cheerio";

export async function fetchStock(stockCode) {
  if (typeof stockCode !== "string") throw "Kode saham harus berupa string";
  if (!/^[A-Z]{4}(-[A-Z][A-Z\d]{0,2})?$/.test(stockCode))
    throw `Kode saham ${stockCode} tidak valid`;

  const { statusCode, body } = await got.get(
    `https://www.duniainvestasi.com/bei/summaries/${stockCode}`,
    {
      responseType: "text",
      throwHttpErrors: false
    }
  );

  if (statusCode !== 200) 
    throw `Gagal mendapatkan data saham ${stockCode}`;
  

  const $ = cheerio.load(body);
  const name = $("#CONTENT h3").text();

  if (/Kode saham ".*" tidak ditemukan./.test(name)) throw name;

  return {
    name: name,
    close: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(2)>:first-child>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    ),
    previous: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(2)>:nth-child(2)>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    ),
    high: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(2)>:nth-child(5)>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    ),
    low: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(2)>:nth-child(6)>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    ),
    volume: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(3)>:first-child>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    ),
    value: parseInt(
      $(
        "#CONTENT>:first-child>:nth-last-child(2)>:first-child>:nth-child(3)>:nth-child(3)>:last-child>div"
      )
        .text()
        .replaceAll(",", "")
    )
  };
}
