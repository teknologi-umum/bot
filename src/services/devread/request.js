import got from "got";
import { DEFAULT_HEADERS } from "#utils/http.js";

/**
 * requestDataByMedia is a function to get the devread data.
 * @param {"web" | "tulisan" | "podcast" |"video"} mediaType The media type for devread.
 * @param {string} query The query for devread.
 * @returns 
 */
async function requestDataByMedia(mediaType, query) {
  const { body } = await got.get("https://api.pulo.dev/v1/contents", {
    searchParams: {
      page: 1,
      media: mediaType,
      query
    },
    headers: DEFAULT_HEADERS,
    responseType: "json",
    timeout: {
      request: 20_000
    },
    retry: {
      limit: 3
    }
  });

  return body.data;
}

export async function getTheDevRead(query) {
  const tulisan = await requestDataByMedia("tulisan", query);
  const media = await requestDataByMedia("web", query);

  return tulisan.concat(media);
}
