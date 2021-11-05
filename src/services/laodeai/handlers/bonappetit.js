/**
 * Process Bonappetit from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function bonappetit($) {
  const output = $(".recipe", "#main-content")
    .map((_, el) => {
      const title = $(el)
        .find("h1[data-testid=\"ContentHeaderHed\"]")
        .first()
        .text();
      const ingrs = $(el).find("div[data-testid=\"IngredientList\"] div");
      const ingredientsAmount = $(ingrs)
        .find("p[class*=\"Amount\"]")
        .map((_, el) => $(el).text())
        .toArray();
      const ingredientsDesc = $(ingrs)
        .find("div[class*=\"Description\"]")
        .map((_, el) => $(el).text())
        .toArray();
      const ingredients = ingredientsAmount.map(
        (v, i) => `${v || ""}${v ? " " : ""}${ingredientsDesc[i]}`
      );
      const directions = $(el)
        .find(
          "div[data-testid=\"InstructionsWrapper\"] div[class*=\"InstructionGroupWrapper\"] div[class*=\"InstructionStepWrapper\"]"
        )
        .map((_, el) => $(el).find("div p").text().trim())
        .toArray();
      return { title, ingredients, directions };
    })
    .toArray();

  if (output && Object.values(output).length > 0) {
    const formatted = output
      .map(
        (o) =>
          `<b>${o.title}</b>\n\n<b>Ingredients:</b>\n${o.ingredients
            .map((v, i) => `${i + 1}. ${v}`)
            .join("\n")}\n\n<b>Directions:</b>\n${o.directions
            .map((v, i) => `${i + 1}. ${v.trim()}`)
            .join("\n")}`
      )
      .join("");
    return { type: "text", content: formatted.replace(/\r\n/g, "\n") };
  }

  return {
    type: "error",
    content: ""
  };
}
