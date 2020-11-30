import * as Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_PORT);
redis.config('SET', 'notify-keyspace-events', 'KEA');

export { redis };
