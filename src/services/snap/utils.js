import { request } from 'undici';

export async function generateImage(code) {
  if (!code) return Promise.reject('code must be supplied');

  const lineNumbers = (code.match(/\n/g) || []).length;

  const res = await request('https://carbonara.vercel.app/api/cook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      code,
      theme: 'one-dark',
      paddingVertical: '20px',
      paddingHorizontal: '20px',
      lineNumbers: lineNumbers > 5,
      exportSize: '3x',
    }),
  });

  return res.body;
}
