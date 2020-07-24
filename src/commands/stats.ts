import * as path from 'path';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';
import { KEYWORDS } from '../helpers/consts';

const group = path.parse(__filename).name;

export default KEYWORDS.map(({ name, description, aliases }): Command => ({
  name,
  group,
  description,
  aliases,
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue(name);
    return message.channel.send(statValue);
  },
}));
