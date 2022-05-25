import Redis from 'ioredis';

const redis = new Redis(parseInt(process.env.REDIS_PORT as string, 10) || 6379);
redis.config('SET', 'notify-keyspace-events', 'KEA');

export { redis };
