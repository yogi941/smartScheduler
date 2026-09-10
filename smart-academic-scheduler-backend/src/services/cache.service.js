const { getCache, setCache, deleteCache, flushCache, isRedisActive } = require('../config/redis');

class CacheService {
  static async get(key) {
    const raw = await getCache(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  }

  static async set(key, value, ttlSeconds = 300) {
    return setCache(key, value, ttlSeconds);
  }

  static async del(key) {
    return deleteCache(key);
  }

  static async flush() {
    return flushCache();
  }

  static isRedisConnected() {
    return isRedisActive();
  }
}

module.exports = CacheService;
