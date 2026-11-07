import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      console.warn('[Redis] Connection not available. Running in degraded mode without background queue.');
      return null;
    }
    return Math.min(times * 100, 2000);
  }
});

redis.on('connect', () => {
  console.log('✅ [Redis] Connected to cache & queue server');
});

redis.on('error', (err) => {
  // Silent warning for local dev if Redis is offline
  if ((err as any).code === "ECONNREFUSED") {
    // Expected when running without redis daemon
  } else {
    console.warn('[Redis Error]:', err.message);
  }
});

export const redisClient = redis;
export default redis;
