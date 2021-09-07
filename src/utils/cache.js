export function Semaphore() {
  const queue = [];

  this.wait = async function () {
    const promiseQueue = queue.map((entry) => entry.promise);
    let release;
    const promise = new Promise((resolve) => (release = resolve));
    queue.push({ promise, release });
    if (promiseQueue.length > 0) {
      await Promise.all(promiseQueue);
    }
  };

  this.release = function () {
    if (queue.length === 0) throw new Error('Semaphore queue is empty');
    const entry = queue.shift();
    entry.release();
  };
}

export class SingleValueCache {
  // no TTL means no expiry
  constructor(ttl = null) {
    this.ttl = ttl;
    this.lastUpdated = 0;
    this.semaphore = new Semaphore();
  }

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

  async set(value) {
    await this.semaphore.wait();
    this.value = value;
    this.lastUpdated = Date.now();
    this.semaphore.release();
  }
}
