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
    await this.client.set(key, value, "EX", expiryInSeconds);
  }

  async invalidate(key) {
    await this.client.del(key);
  }
}

module.exports = new CacheService();
