import { logger } from '../helpers/logger';
import { redis } from '../helpers/redis';

class RedisCollectorService {
  private readonly keywordsDictionary = {
    despair: /(ayame_?despair|ayame_?why)/ig,
    pray: /(ayame_?pray|ayame_?blessing)/ig,
    nakirium: /(ayame_?cry|o+jo{2,}u{2,})/ig,
    phone: /(ayame_?phone)/ig,
    ayame: /(ayame|ojou)/ig,
    poyoyo: /poyoyo/ig,
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
