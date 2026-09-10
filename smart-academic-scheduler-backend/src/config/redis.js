const Redis = require('ioredis');
const logger = require('./logger');

class MemoryCacheFallback {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    if (this.ttls.has(key)) {
      const exp = this.ttls.get(key);
      if (Date.now() > exp) {
        this.store.delete(key);
        this.ttls.delete(key);
        return null;
      }
    }
    const data = this.store.get(key);
    return data ? JSON.stringify(data) : null;
  }

  async set(key, value, mode, duration) {
    let parsed = value;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      // already string or object
    }
    this.store.set(key, parsed);
    if (mode === 'EX' && typeof duration === 'number') {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.ttls.delete(key);
    return 1;
  }

  async flushdb() {
    this.store.clear();
    this.ttls.clear();
    return 'OK';
  }
}

let redisClient = null;
let isRedisAvailable = false;
const memoryFallback = new MemoryCacheFallback();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) {
        logger.warn('Redis connection retry limit reached. Falling back to In-Memory Cache.');
        return null; // Stop retrying
      }
      return 1000;
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('Connected to Redis Server successfully');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    logger.warn(`Redis Client Warning: ${err.message}. Operating in In-Memory fallback mode.`);
  });

  redisClient.connect().catch((err) => {
    isRedisAvailable = false;
    logger.warn(`Initial Redis connection skipped: ${err.message}. Using In-Memory fallback.`);
  });
} catch (error) {
  isRedisAvailable = false;
  logger.warn(`Redis initialization failed: ${error.message}. Using In-Memory fallback.`);
}

async function getCache(key) {
  try {
    if (isRedisAvailable && redisClient.status === 'ready') {
      return await redisClient.get(key);
    }
  } catch (err) {
    logger.warn(`Redis GET failed: ${err.message}`);
  }
  return memoryFallback.get(key);
}

async function setCache(key, value, ttlSeconds = 300) {
  const valString = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    if (isRedisAvailable && redisClient.status === 'ready') {
      await redisClient.set(key, valString, 'EX', ttlSeconds);
      return;
    }
  } catch (err) {
    logger.warn(`Redis SET failed: ${err.message}`);
  }
  await memoryFallback.set(key, valString, 'EX', ttlSeconds);
}

async function deleteCache(key) {
  try {
    if (isRedisAvailable && redisClient.status === 'ready') {
      await redisClient.del(key);
    }
  } catch (err) {
    logger.warn(`Redis DEL failed: ${err.message}`);
  }
  await memoryFallback.del(key);
}

async function flushCache() {
  try {
    if (isRedisAvailable && redisClient.status === 'ready') {
      await redisClient.flushdb();
    }
  } catch (err) {
    logger.warn(`Redis FLUSH failed: ${err.message}`);
  }
  await memoryFallback.flushdb();
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  flushCache,
  isRedisActive: () => isRedisAvailable,
};
