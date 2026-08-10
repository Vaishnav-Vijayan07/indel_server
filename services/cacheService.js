const Redis = require("ioredis");
require("dotenv").config();

class CacheService {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL);
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value, expiryInSeconds) {
    if (Number.isInteger(expiryInSeconds) && expiryInSeconds > 0) {
      await this.client.set(key, value, "EX", expiryInSeconds);
    } else {
      await this.client.set(key, value); // no expiry
    }
  }

  async invalidate(key) {
    await this.client.del(key);
  }

  // Deletes all keys matching a glob-style pattern (e.g. "banners_*").
  // Uses SCAN instead of KEYS to avoid blocking Redis on large keyspaces.
  async invalidatePattern(pattern) {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length) {
        await this.client.del(...keys);
      }
    } while (cursor !== "0");
  }
}

module.exports = new CacheService();
