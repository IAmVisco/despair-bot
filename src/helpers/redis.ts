import * as Redis from 'ioredis';

const redis = new Redis();
redis.config('SET', 'notify-keyspace-events', 'KEA');
export { redis };
