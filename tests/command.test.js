import { test } from "uvu";
import * as assert from "uvu/assert";
import { getCommandArgs, getCommandName } from "../src/utils/command.js";

test("should get argument if command is invoked without username", () => {
  const fakeContext = {
    message: { text: "/foo some random text" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("foo", fakeContext);

  assert.equal(argument, "some random text");
});

test("should get argument if command is invoked with username", () => {
  const fakeContext = {
    message: { text: "/foo@teknologiumumbot some random text" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("foo", fakeContext);

  assert.equal(argument, "some random text");
});

test("should return original message if not a valid command", () => {
  const fakeContext = {
    message: { text: "some random text" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("foo", fakeContext);

  assert.equal(argument, "some random text");
});

test("should return empty string if no params was given", () => {
  const fakeContext = {
    message: { text: "/foo" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("foo", fakeContext);

  assert.equal(argument, "");
});

test("should handle new lines", () => {
  const fakeContext = {
    message: { text: "/foo\nbar\nbaz" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("foo", fakeContext);

  assert.equal(argument, "bar\nbaz");
});

test("should handle complicated new lines", () => {
  const fakeContext = {
    message: { text: "/js\r\nasync function hello() {\n\tconst logger = new Logger();\r\n\tlogger.log(\"Hello world\");\r};\n" },
    me: "teknologiumumbot"
  };

  const argument = getCommandArgs("js", fakeContext);

  assert.equal(argument, "async function hello() {\n\tconst logger = new Logger();\r\n\tlogger.log(\"Hello world\");\r};");
});

test("should be able to parse complicated command name", () => {
  const fakeContext = {
    message: { text: "/laodeai\r\nasync function hello() {\n\tconst logger = new Logger();\r\n\tlogger.log(\"Hello world\");\r};\n" },
    me: "teknologiumumbot"
  };

  const command = getCommandName(fakeContext);

  assert.equal(command, "laodeai");
});

test("should be able to parse command name with name", () => {
  const fakeContext = {
    message: { text: "/dukun@teknologiumumbot" },
    me: "teknologiumumbot"
  };

  const command = getCommandName(fakeContext);

  assert.equal(command, "dukun");
});

test("should return empty string for undefined and null context", () => {
  assert.equal(getCommandName(undefined), "");
  assert.equal(getCommandName(null), "");
});

test("should return empty string for non command", () => {
  const fakeContext = {
    message: { text: "foo bar" },
    me: "teknologiumumbot"
  };

  assert.equal(getCommandName(fakeContext), "");
});

test("should return empty string for just slash", () => {
  const fakeContext = {
    message: { text: "/" },
    me: "teknologiumumbot"
  };

  assert.equal(getCommandName(fakeContext), "");
});

test.run();
