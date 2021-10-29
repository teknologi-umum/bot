/**
 * Provides default headers for a HTTP request
 */
export const defaultHeaders = {
  Accept: "application/json,*/*",
  "User-Agent": "Teknologi Umum Bot <teknologi.umum@gmail.com>",
};

/**
 * Clean DuckDuckGo URL
 * @param {string} url - Raw URL from duckduckgo
 * @return {string} Clean and valid URL
 */
export const cleanURL = (url) =>
  url.replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, "").replace(/&rut=.*$/, "");

/**
 * Fetch result from DuckDuckGo
 * @param {import('got').Got} got - Got instance
 * @param {string} query - Your query
 * @return {Promise<import('got').Response>} Result
 */
export const fetchDDG = async (got, query) => {
  const response = await got.get("https://html.duckduckgo.com/html/", {
    searchParams: {
      kp: 1, // safe search // 1: strict | -1: moderate | 2: off
      q: query,
    },
    headers: {
      Accept: "text/html",
    },
    responseType: "text",
  });

  return response;
};
