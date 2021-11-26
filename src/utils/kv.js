class KV {
  constructor() {
    this.store = {};
  }
  get(key) {
    return this.store[key] || "";
  }
  set(key, value) {
    if (value === null || value === "")
      delete this.store[key];
    else
      this.store[key] = value;
  }
}

export const kv = new KV();
