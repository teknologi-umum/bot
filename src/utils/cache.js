/**
 * Semaphor is a class that provides a simple Semaphor implementation.
 */
export class Semaphore {
  constructor() {
    this._queue = [];
  }

  async wait() {
    const promiseQueue = this._queue.map((entry) => entry.promise);
    let release;
    const promise = new Promise((resolve) => {
      release = resolve;
    });
    this._queue.push({ promise, release });
    if (promiseQueue.length > 0) {
      await Promise.all(promiseQueue);
    }
  }

  release() {
    if (this._queue.length === 0) throw new Error("Semaphore queue is empty");
    const entry = this._queue.shift();
    entry.release();
  }
}

/**
 * SingleValueCache is a class that provides a simple cache implementation.
 */
export class SingleValueCache {
  /**
   * @param {Number=} ttl Time to live in milliseconds. No TTL means no expiry
   */
  constructor(ttl = null) {
    this.ttl = ttl;
    this.lastUpdated = 0;
    this.semaphore = new Semaphore();
  }

  /**
   * getOrCreate is a method to create a value to be cached.
   * @param {Function} valueFactory A function that produces a value to be cached
   * @returns value
   */
  async getOrCreate(valueFactory) {
    await this.semaphore.wait();
    try {
      if (
        (this.ttl !== null && Date.now() - this.lastUpdated >= this.ttl) ||
        (this.ttl === null && this.lastUpdated === 0)
      ) {
        this.value = await valueFactory();
        this.lastUpdated = Date.now();
      }
      return this.value;
    } finally {
      this.semaphore.release();
    }
  }

  /**
   * set is a method to set a new cached value.
   * @param {any} value The new cached value.
   */
  async set(value) {
    await this.semaphore.wait();
    this.value = value;
    this.lastUpdated = Date.now();
    this.semaphore.release();
  }
}
