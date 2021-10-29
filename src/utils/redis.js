/**
 * @file redis.js
 * @fileoverview Async Redis functions with JSDoc annotations
 */

/**
 *
 * @param {import('redis').RedisClient} client
 * @returns
 */
function redisClient(client) {
  return {
    /**
     * Returns PONG if no argument is provided, otherwise return a copy of the argument as a bulk.
     * This command is often used to test if a connection is still alive, or to measure latency.
     * @returns {Promise<String>} Reply
     * @see Documentation https://redis.io/commands/ping
     */
    async PING() {
      return new Promise((resolve, reject) => {
        client.PING((error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Ask the server to close the connection.
     * The connection is closed as soon as all pending replies have been written to the client.
     * @returns {Promise<String>} "OK"
     * @see Documentation https://redis.io/commands/quit
     */
    async QUIT() {
      return new Promise((resolve, reject) => {
        client.QUIT((error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Get the value of key. If the key does not exist the special value nil is returned.
     * An error is returned if the value stored at key is not a string, because GET only handles string values.
     * @param {String} key Key
     * @returns {Promise<string|null>} The value of key, or nil when key does not exist.
     * @see Documentation https://redis.io/commands/get
     */
    async GET(key) {
      return new Promise((resolve, reject) => {
        client.GET(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns the values of all specified keys.
     * For every key that does not hold a string value or does not exist, the special value nil is returned.
     * Because of this, the operation never fails.
     * @param {Array<string>} key Array of keys
     * @returns {Promise<Array<string>>} List of values at the specified keys.
     * @see Documentation https://redis.io/commands/mget
     */
    async MGET(...key) {
      return new Promise((resolve, reject) => {
        client.MGET(key.flat(99), (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns all keys matching pattern.
     * @param {String} pattern Glob-style pattern
     * @returns {Promise<Array<string>>} list of keys matching pattern.
     * @see Documentation https://redis.io/commands/keys
     */
    async KEYS(pattern) {
      return new Promise((resolve, reject) => {
        client.KEYS(pattern, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Set key to hold the string value.
     * If key already holds a value, it is overwritten, regardless of its type.
     * Any previous time to live associated with the key is discarded on successful SET operation.
     * @param {String} key Key
     * @param {String} value Value
     * @param {SetOptions} options
     * @returns {Promise<string|undefined>} "OK"
     * @see Documentation https://redis.io/commands/set
     */
    async SET(key, value, options) {
      return new Promise((resolve, reject) => {
        client.SET(
          key,
          value,
          options?.mode ?? "",
          options?.flag ?? "",
          options?.duration ?? 0,
          (error, reply) => {
            if (error) return reject(error);
            return resolve(reply);
          }
        );
      });
    },
    /**
     * Put a key and value to Redis if not exists
     * @param {String} key Key
     * @param {String} value Value
     * @returns {Promise<Number>} 1 if key was set, 0 if key wasn't set
     * @see Documentation https://redis.io/commands/setnx
     */
    async SETNX(key, value) {
      return new Promise((resolve, reject) => {
        client.SETNX(key, value, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Set key to hold the string value and set key to timeout after a given number of seconds.
     * @param {String} key Key
     * @param {Number} seconds Expiry time in seconds
     * @param {String} value Value
     * @returns {Promise<String>} "OK"
     * @see Documentation https://redis.io/commands/setex
     */
    async SETEX(key, seconds, value) {
      return new Promise((resolve, reject) => {
        client.SETEX(key, seconds, value, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Sets the given keys to their respective values.
     * @param {Array<String>} keys Keys and Values
     * @returns {Promise<boolean>} True if the all the keys were set. False if no key was set (at least one key already existed).
     * @see Documentation https://redis.io/commands/mset
     */
    async MSET(...keys) {
      return new Promise((resolve, reject) => {
        client.MSET(keys.flat(99), (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Sets the given keys to their respective values.
     * MSETNX will not perform any operation at all even if just a single key already exists.
     * @param {Array<String>} keys Keys and Values
     * @returns {Promise<boolean>} True if the all the keys were set. False if no key was set (at least one key already existed).
     * @see Documentation https://redis.io/commands/msetnx
     */
    async MSETNX(...keys) {
      return new Promise((resolve, reject) => {
        client.MSETNX(keys.flat(99), (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns if key exists.
     * @param {String} key Key
     * @returns {Promise<Number>} 1 if key exists, 0 is key doesn't exist.
     * @see Documentation https://redis.io/commands/exists
     */
    async EXISTS(key) {
      return new Promise((resolve, reject) => {
        client.EXISTS(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Renames key to newkey. It returns an error when key does not exist.
     * If newkey already exists it is overwritten, when this happens RENAME executes an implicit DEL operation,
     * so if the deleted key contains a very big value it may cause high latency
     * even if RENAME itself is usually a constant-time operation.
     * @param {String} key Old Key
     * @param {String} newkey New Key
     * @returns {Promise<String>} "OK"
     * @see Documentation https://redis.io/commands/rename
     */
    async RENAME(key, newkey) {
      return new Promise((resolve, reject) => {
        client.RENAME(key, newkey, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Set a timeout on key. After the timeout has expired, the key will automatically be deleted.
     * A key with an associated timeout is often said to be volatile in Redis terminology.
     * @param {String} key Key
     * @param {Number} seconds Expiry time in seconds
     * @returns {Promise<number>} 1 is timeout was set. 0 if key does not exist.
     * @see Documentation https://redis.io/commands/expire
     */
    async EXPIRE(key, seconds) {
      return new Promise((resolve, reject) => {
        client.EXPIRE(key, seconds, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns the remaining time to live of a key that has a timeout.
     * This introspection capability allows a Redis client to check how many seconds a given key
     * will continue to be part of the dataset.
     * @param {String} key Key
     * @returns {Promise<number>} TTL in seconds, or a negative value in order to signal an error.
     * @see Documentation https://redis.io/commands/ttl
     */
    async TTL(key) {
      return new Promise((resolve, reject) => {
        client.TTL(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Remove the existing timeout on key, turning the key from volatile (a key with an expire set)
     * to persistent (a key that will never expire as no timeout is associated).
     * @param {String} key Key
     * @returns {Promise<Number>} 1 if the timeout was removed. 0 if key does not exist or does not have an associated timeout.
     * @see Documentation https://redis.io/commands/persist
     */
    async PERSIST(key) {
      return new Promise((resolve, reject) => {
        client.PERSIST(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns the string representation of the type of the value stored at key.
     * The different types that can be returned are: string, list, set, zset, hash and stream.
     * @param {String} key Key
     * @returns {Promise<String>} type of key, or none when key does not exist.
     * @see Documentation https://redis.io/commands/type
     */
    async TYPE(key) {
      return new Promise((resolve, reject) => {
        client.TYPE(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Increments the number stored at key by one.
     * If the key does not exist, it is set to 0 before performing the operation.
     * An error is returned if the key contains a value of the wrong type or contains a string
     * that can not be represented as integer.
     * This operation is limited to 64 bit signed integers.
     * @param {String} key Key
     * @returns {Promise<Number>} the value of key after the increment
     * @see Documentation https://redis.io/commands/incr
     */
    async INCR(key) {
      return new Promise((resolve, reject) => {
        client.INCR(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Decrements the number stored at key by one.
     * If the key does not exist, it is set to 0 before performing the operation.
     * An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer.
     * This operation is limited to 64 bit signed integers.
     * @param {String} key Key
     * @returns {Promise<Number>} the value of key after the decrement
     * @see Documentation https://redis.io/commands/decr
     */
    async DECR(key) {
      return new Promise((resolve, reject) => {
        client.DECR(key, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * If key already exists and is a string, this command appends the value at the end of the string.
     * If key does not exist it is created and set as an empty string, so APPEND will be similar to SET in this special case.
     * @param {String} key Key
     * @param {String} value Added value
     * @returns {Promise<Number>} the length of the string after the append operation.
     * @see Documentation https://redis.io/commands/append
     */
    async APPEND(key, value) {
      return new Promise((resolve, reject) => {
        client.APPEND(key, value, (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },
    /**
     * Removes the specified keys. A key is ignored if it does not exist.
     * @param {Array<String>} key Key
     * @returns {Promise<Number>} The number of keys that were removed.
     * @see Documentation https://redis.io/commands/del
     */
    async DEL(...key) {
      return new Promise(function (resolve, reject) {
        client.DEL(key.flat(99), (error, reply) => {
          if (error) return reject(error);
          return resolve(reply);
        });
      });
    },

    /**
     * Returns if field is an existing field in the hash stored at key.
     * @param {String} key
     * @param {String} field
     * @returns {Promise<Number>} 1 if the hash contains field. 0 if the hash does not contain field, or key does not exist.
     * @see Documentation https://redis.io/commands/hexists
     */
    async HEXISTS(key, field) {
      return new Promise(function (resolve, reject) {
        client.HEXISTS(key, field, (err, reply) => {
          if (err) return reject(err);
          return resolve(reply);
        });
      });
    },

    /**
     * Sets field in the hash stored at key to value. If key does not exist, a new key holding a hash is created.
     * If field already exists in the hash, it is overwritten.
     *
     * As of Redis 4.0.0, HSET is variadic and allows for multiple field/value pairs.
     * @param {String} key
     * @param  {...String} hash
     * @returns {Promise<Number>} The number of fields that were added.
     * @see Documentation https://redis.io/commands/hset
     */
    async HSET(key, ...hash) {
      return new Promise(function (resolve, reject) {
        client.HSET(key, ...hash, (err, reply) => {
          if (err) return reject(err);
          return resolve(reply);
        });
      });
    },

    /**
     * Returns the values associated with the specified fields in the hash stored at key.
     *
     * For every field that does not exist in the hash, a nil value is returned.
     * Because non-existing keys are treated as empty hashes, running HMGET against a non-existing key
     * will return a list of nil values.
     * @param {String} key
     * @param  {String[]} hash
     * @returns {Promise<String[]>} list of values associated with the given fields, in the same order as they are requested.
     * @see Documentation https://redis.io/commands/hmget
     */
    async HMGET(key, ...hash) {
      return new Promise(function (resolve, reject) {
        client.HMGET(key, ...hash, (err, reply) => {
          if (err) return reject(err);
          return resolve(reply);
        });
      });
    },
    /**
     * Returns all fields and values of the hash stored at key. In the returned value,
     * every field name is followed by its value, so the length of the reply is twice the size of the hash.
     * @param {String} key
     * @returns {Promise<Record<string, string>>} list of fields and their values stored in the hash, or an empty list when key does not exist.
     * @see Documentation https://redis.io/commands/hgetall
     */
    async HGETALL(key) {
      return new Promise((resolve, reject) => {
        client.HGETALL(key, (err, reply) => {
          if (err) return reject(err);
          return resolve(reply);
        });
      });
    },
  };
}

export default redisClient;
