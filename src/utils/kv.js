/**
 * KV is a class that provides a simple key-value store.
 */
class KV {
  constructor() {
    this._store = {};
  }

  /**
   * get is a method to get a value from the store.
   * @param {string} key The key to get the value for.
   * @returns value
   */
  get(key) {
    return this._store[key] || "";
  }

  /**
   * set is a method to set a value from the store. 
   * If the value is null or empty string, it will be removed from the store.
   * @param {string} key The key to set the value for.
   * @param {value} value The value to set.
   */
  set(key, value) {
    if (value === null || value === "") {
      delete this._store[key];
    } else {
      this._store[key] = value;
    }
  }
}

export const kv = new KV();
