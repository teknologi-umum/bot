import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { pathTo } from '../src/utils/path.js';
import { join } from 'path';

test('should return current path', () => {
  const path = pathTo(import.meta.url, '.');
  assert.equal(path, join(process.cwd(), 'tests'));
});

test('should return custom relative path', () => {
  const path = pathTo(import.meta.url, '../src/utils/redis.js');
  assert.equal(path, join(process.cwd(), 'src', 'utils', 'redis.js'));
});

test.run();
