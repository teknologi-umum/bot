import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { getCommandArgs } from '../src/utils/command.js';

test('should get argument if command is invoked without username', () => {
  const fakeContext = {
    message: '/foo some random text',
    me: 'teknologiumumbot',
  };

  const argument = getCommandArgs('foo', fakeContext);

  assert.equal(argument, 'some random text');
});

test('should get argument if command is invoked with username', () => {
  const fakeContext = {
    message: '/foo@teknologiumumbot some random text',
    me: 'teknologiumumbot',
  };

  const argument = getCommandArgs('foo', fakeContext);

  assert.equal(argument, 'some random text');
});

test('should return original message if not a valid command', () => {
  const fakeContext = {
    message: 'some random text',
    me: 'teknologiumumbot',
  };

  const argument = getCommandArgs('foo', fakeContext);

  assert.equal(argument, 'some random text');
});

test.run();
