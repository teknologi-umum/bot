import { request } from 'undici';

async function getTheDevRead(query) {
  const tulisan = await requestDataByMedia("tulisan", query);
  const media = await requestDataByMedia("web", query);

  return [...tulisan, ...media];
}

async function requestDataByMedia(mediaType, query) {
  const url = new URL('https://api.pulo.dev/v1/contents');
  url.searchParams.append('page', 1);
  url.searchParams.append('media', mediaType);
  url.searchParams.append('query', query);

  const { body } = await request(url.toString());
  const { data } = await body.json();
  return data;
}

export { getTheDevRead };
