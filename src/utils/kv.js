class KV {
  constructor() {
    this.store = {};
  }
  get(key) {
    return this.store[key] || "";
  }
  set(key, value) {
    this.store[key] = value;
  }
}

export const kv = new KV();
