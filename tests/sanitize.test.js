import { test } from "uvu";
import * as assert from "uvu/assert";
import { sanitize } from "../src/utils/sanitize.js";

test("should sanitize without clean mode", () => {
  const output = sanitize("<body><b>Tak blyat</b></body>");
  assert.equal(output, "<b>Tak blyat</b>");
});

test("should strip all html gibberish", () => {
  const output = sanitize("<body><b>Tak blyat</b></body>", true);
  assert.equal(output, "Tak blyat");
});

test.run();
