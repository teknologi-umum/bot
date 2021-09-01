import got from 'got';
import { defaultHeaders } from '../../utils/http.js';

export async function generateImage(code) {
  if (!code) return Promise.reject('code must be supplied');

  const lineNumbers = (code.match(/\n/g) || []).length;

  const { body } = await got.post('https://carbonara.vercel.app/api/cook', {
    headers: defaultHeaders,
    json: {
      code,
      theme: 'one-dark',
      paddingVertical: '20px',
      paddingHorizontal: '20px',
      lineNumbers: lineNumbers > 5,
      exportSize: '3x',
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
