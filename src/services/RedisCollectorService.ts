import { logger } from '../helpers/logger';
import { redis } from '../helpers/redis';
import { KEYWORDS } from '../helpers/consts';

class RedisCollectorService {
  async getKeyValue(key: string): Promise<number> {
    return parseInt(await redis.get(key) || '0', 10);
  }

  countKeywords(content: string): void {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const { name, regex } of KEYWORDS) {
        const matchAmount = (content.match(regex) || []).length;
        matchAmount && redis.incrby(name, matchAmount);
      }
    } catch (e) {
      logger.error('Cannot increment Redis counter', e);
    }
  }

  incrementCommandCount(): Promise<number> {
    return redis.incr('commands');
  }
}

export const redisCollectorService = new RedisCollectorService();
