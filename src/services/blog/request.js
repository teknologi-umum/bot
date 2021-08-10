import got from 'got';
import { defaultHeaders } from '../../utils/http.js';

async function getTheDevRead(query) {
  const tulisan = await requestDataByMedia('tulisan', query);
  const media = await requestDataByMedia('web', query);

  return [...tulisan, ...media];
}

async function requestDataByMedia(mediaType, query) {
  const { body } = await got.get('https://api.pulo.dev/v1/contents', {
    searchParams: {
      page: 1,
      media: mediaType,
      query,
    },
    headers: defaultHeaders,
    responseType: 'json',
    timeout: {
      request: 20_000,
    },
    retry: {
      limit: 3,
    },
  });
  return body.data;
}

export { getTheDevRead };
