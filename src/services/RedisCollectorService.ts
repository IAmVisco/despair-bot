import { logger } from '../helpers/logger';
import { redis } from '../helpers/redis';

class RedisCollectorService {
  private readonly keywordsDictionary = {
    despair: /(ayamedespair|ayamewhy)/ig,
    pray: /(ayamepray|ayameblessing)/ig,
    nakirium: /(ayamecry|o+jo{2,}u{2,})/ig,
  };

  async getKeyValue(key: string): Promise<number> {
    return parseInt(await redis.get(key) || '0', 10);
  }

  countKeywords(content: string): void {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(this.keywordsDictionary)) {
        const matchAmount = (content.match(value) || []).length;
        matchAmount && redis.incrby(key, matchAmount);
      }
    } catch (e) {
      logger.error('Cannot increment Redis counter', e);
    }
  }
}

export const redisCollectorService = new RedisCollectorService();
