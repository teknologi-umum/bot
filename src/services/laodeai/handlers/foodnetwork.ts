/**
 * Process Food Network from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function foodnetwork($) {
  const output = $(".o-Recipe")
    .map((_, el) => {
      const title = $(el)
        .find(
          ".recipe-lead .m-RecipeSummary .assetTitle .o-AssetTitle__a-HeadlineText"
        )
        .first()
        .text();
      // This part might be useful later, I'm not deleting it for now.
      // const meta = $(el)
      //   .find('.recipe-lead .recipeInfo .o-RecipeInfo > ul > li')
      //   .map((_, el) => $(el).text().trim().replace(/\n/g, ''))
      //   .toArray()
      //   .join('\n');
      const ingredients = $(el)
        .find(
          ".recipe-body .bodyLeft .o-Ingredients__m-Body .o-Ingredients__a-Ingredient--CheckboxLabel"
        )
        .map((_, el) => $(el).text())
        .toArray();
      const directions = $(el)
        .find(".recipe-body .bodyRight .o-Method__m-Body > ol > li")
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
            .filter((v) => v.toLowerCase() !== "deselect all")
            .map((v, i) => `${i + 1}. ${v}`)
            .join("\n")}\n\n<b>Directions:</b>\n${o.directions
            .map((v, i) => `${i + 1}. ${v.trim()}`)
            .join("\n")}`
      )
      .join("");
    return {
      type: "text",
      content: formatted.replace(/\r\n/g, "\n")
    };
  }

  return {
    type: "error",
    content: ""
  };
}
