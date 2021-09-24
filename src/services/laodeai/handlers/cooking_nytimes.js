/**
 * Process Cooking NYTimes from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function cookingNytimes($) {
  const output = $('#container #content .recipe')
    .map((_, el) => {
      const title = $(el).find('header .title-container h1.title').first().text().trim();
      const ingredients = $(el)
        .find('.recipe-instructions .recipe-ingredients-wrap ul.recipe-ingredients li')
        .map((_, el) => {
          const qty = $(el).find('span.quantity').text().trim();
          const name = $(el).find('span.ingredient-name').text().trim();
          return `${qty}${qty ? ' ' : ''}${name}`;
        })
        .toArray();
      const directions = $(el)
        .find('.recipe-instructions .recipe-steps-wrap ol.recipe-steps li')
        .map((_, el) => $(el).text())
        .toArray();
      return { title, ingredients, directions };
    })
    .toArray();

  if (output && Object.values(output).length > 0) {
    const formatted = output
      .map(
        (o) =>
          `<b>${o.title}</b>\n\n<b>Ingredients:</b>\n${o.ingredients
            .filter((v) => v)
            .map((v, i) => `${i + 1}. ${v}`)
            .join('\n')}\n\n<b>Directions:</b>\n${o.directions.map((v, i) => `${i + 1}. ${v.trim()}`).join('\n')}`,
      )
      .join('');
    return { type: 'text', content: formatted.replace(/\r\n/g, '\n') };
  }

  return {
    type: 'error',
    content: '',
  };
}
