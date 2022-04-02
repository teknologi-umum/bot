import got from "got";

/**
 * Provides default headers for a HTTP request
 */
export const DEFAULT_HEADERS = {
  Accept: "application/json,*/*",
  "User-Agent": "Teknologi Umum Bot <teknologi.umum@gmail.com>"
};

const DDG_SAFESEARCH_LEVEL = {
  STRICT: 1,
  MODERATE: -1,
  OFF: 2
};

/**
 * Clean DuckDuckGo URL
 * @param {string} url - Raw URL from duckduckgo
 * @return {string} Clean and valid URL
 */
export const cleanURL = (url) => {
  // TODO(elianiva): why do we even need this?
  if (url === undefined) return ""; 
  return url.replace(/^\/\/duckduckgo.com\/l\/\?uddg=/, "").replace(/&rut=.*$/, "");
};

/**
 * Fetch result from DuckDuckGo
 * @param {string} query - Your query
 * @return {Promise<import('got').Response>} Result
 */
export const fetchDDG = async (query) => {
  const response = await got.get("https://html.duckduckgo.com/html/", {
    searchParams: {
      kp: DDG_SAFESEARCH_LEVEL.STRICT,
      q: query
    },
    headers: {
      Accept: "text/html"
    },
    responseType: "text"
  });

  return response;
};
