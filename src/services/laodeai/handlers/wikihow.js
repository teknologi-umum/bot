/**
 * Process Wikihow from Cheerio readout
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ type: 'text' | 'error', content: String}}
 */
export function wikihow($) {
  const output = $(".steps", ".mw-parser-output")
    .map((_, el) => {
      const block = $(el).find("h3 .altblock").first().text();
      const headline = $(el).find("h3 .mw-headline").first().text();
      const heading = `${block} ${headline}`;
      const steps = $(el)
        .find(".section_text > ol > li")
        .map((_, el) => $(el).find(".step b").text())
        .toArray();
      return { heading, steps };
    })
    .toArray();

  if (output && Object.values(output).length > 0) {
    const formatted = output
      .map(
        (o) =>
          `<b>${o.heading.trim().replace(/\n+/g, " ")}</b>\n${o.steps
            .map((s, i) => `${i + 1}. ${s}`)
            .join("\n")}\n`
      )
      .join("\n");

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
