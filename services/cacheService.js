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
}

module.exports = new CacheService();
