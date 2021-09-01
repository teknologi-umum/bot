import Turndown from 'turndown';

/**
 * Process Github Gist from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'image' | 'error', content: String}}
 */
export function gist($) {
  const markdownOutput = $('.gist-content .file-box .markdown-body').html();
  if (markdownOutput) {
    const turndown = new Turndown({ hr: '---', emDelimiter: '__' });

    return {
      type: 'text',
      content: turndown.turndown(markdownOutput).replace(/\r/g, '\r'),
    };
  }

  const codeOutput = $('.gist-content .file-box .highlight .blob-code')
    .map((i, el) => $(el).text())
    .toArray()
    .join('\n');
  if (codeOutput) {
    return {
      type: 'image',
      content: codeOutput.replace(/\r/g, '\r'),
    };
  }

  return {
    type: 'error',
    content: '',
  };
}
