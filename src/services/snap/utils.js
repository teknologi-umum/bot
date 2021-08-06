import { request } from 'undici';

export function generateImage(code) {
  const lineNumbers = (code.match(/\n/g) || []).length;

  return request('https://carbonara.vercel.app/api/cook', {
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
  }).then((res) => res.body);
}
