import * as path from 'path';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';

const group = path.parse(__filename).name;

const despair: Command = {
  name: 'despair',
  group,
  description: 'Gets current amount of despair.',
  async execute(message) {
    const despairAmount = await redisCollectorService.getKeyValue('despair');
    return message.channel.send(despairAmount);
  },
};

const pray: Command = {
  name: 'pray',
  group,
  description: 'Gets current amount of prayers.',
  async execute(message) {
    const despairAmount = await redisCollectorService.getKeyValue('pray');
    return message.channel.send(despairAmount);
  },
};

const nakirium: Command = {
  name: 'nakirium',
  group,
  description: 'Gets current amount of refilled Nakirium.',
  async execute(message) {
    const despairAmount = await redisCollectorService.getKeyValue('nakirium');
    return message.channel.send(despairAmount);
  },
};

export default [despair, pray, nakirium];
