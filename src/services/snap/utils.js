import got from 'got';
import { defaultHeaders } from '../../utils/http.js';

export async function generateImage(code) {
  if (!code) return Promise.reject('code must be supplied');

  const { body } = await got.post('https://teknologi-umum-graphene.fly.dev/api', {
    headers: defaultHeaders,
    json: {
      code,
      theme: 'github-dark',
      upscale: 3,
    },
    responseType: 'buffer',
    timeout: {
      request: 30_000,
    },
    retry: {
      limit: 3,
      methods: ['POST'],
      statusCodes: [429, 500, 502, 503, 504],
    },
  });

  return body;
}
