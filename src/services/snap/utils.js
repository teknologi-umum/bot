import { request } from 'undici';

export function generateImage(code) {
  return request('https://carbonara.vercel.app/api/cook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      code,
      theme: 'One Dark',
      paddingVertical: '20px',
      paddingHorizontal: '20px',
      lineNumbers: true,
      exportSize: '3x',
    }),
  }).then((res) => res.body);
}
