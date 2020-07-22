import { CustomMessage } from '../types';
import { logger } from '../helpers/logger';
import { redis } from '../helpers/redis';

class DespairService {
  private readonly redisKey = 'despair';
  private readonly regexKey = /ayamedespair/ig;

  async getDespairAmount(): Promise<number> {
    return parseInt(await redis.get(this.redisKey) || '0', 10);
  }

  countAndIncrementDespair(message: CustomMessage): void {
    try {
      const despairAmount = (message.content.match(this.regexKey) || []).length;
      redis.incrby(this.redisKey, despairAmount);
    } catch (e) {
      logger.error('Cannot increment despair counter.', e);
    }
  }
}

export const despairService = new DespairService();
