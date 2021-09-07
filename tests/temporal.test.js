import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Temporal } from '../src/utils/temporal.js';

const DATE = new Date('December 17, 1995 03:24:00');

test('should be able to compare dates', () => {
  assert.is(new Temporal(DATE).compare(DATE, 'month'), true);
  assert.is(new Temporal(DATE).compare(DATE, 'week'), true);
  assert.is(new Temporal(DATE).compare(DATE, 'day'), true);
  assert.is(new Temporal(DATE).compare(DATE, 'hour'), true);
  assert.is(new Temporal(DATE).compare(DATE, 'minute'), true);
  assert.is(new Temporal(DATE).compare(DATE, 'second'), true);
});

test('should throw error on comparing dates', () => {
  assert.throws(() => new Temporal(DATE).compare(), 'Come on bro, niat ga sih?');
  assert.throws(() => new Temporal(DATE).compare(DATE), 'unit is required!');
});

test('should be able to format date', () => {
  assert.is(new Temporal(DATE).formatDate(), 'December 16, 1995');
  assert.is(new Temporal(DATE).formatDate('en-US', 'UTC', true, false), 'December 16, 1995 at 8:24:00 PM UTC');
  assert.is(new Temporal(DATE).formatDate('en-US', 'UTC', true, true), 'Saturday, December 16, 1995 at 8:24:00 PM UTC');
  assert.is(new Temporal(DATE).formatDate('en-US', 'UTC', false, true), 'Saturday, December 16, 1995');
});

test('should throw error on format date', () => {
  assert.throws(
    () => new Temporal(DATE).formatDate(false),
    'locale, timezone, withTime, or withDay was given with a wrong type',
  );
});

test('should be able to add duration', () => {
  assert.is(new Temporal(DATE).add(1, 'second').getUTCSeconds(), 1);
  assert.is(new Temporal(DATE).add(1, 'minute').getUTCMinutes(), 25);
  assert.is(new Temporal(DATE).add(1, 'hour').getUTCHours(), 21);
  assert.is(new Temporal(DATE).add(1, 'day').getUTCDate(), 17);
  assert.is(new Temporal(DATE).add(1, 'month').getUTCMonth(), 0);
});

test('should throw error on add duration', () => {
  assert.throws(() => new Temporal(DATE).add(false), 'duration must be a type of number');
  assert.throws(() => new Temporal(DATE).add(1), 'unit is required!');
});

test('should throw error on getWeek', () => {
  assert.throws(() => new Temporal().compare(DATE, 'week'), '*face palms*');
});

test.run();
