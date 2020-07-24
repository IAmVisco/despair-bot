import * as path from 'path';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';

const group = path.parse(__filename).name;

const despair: Command = {
  name: 'despair',
  group,
  description: 'Gets current amount of despair.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('despair');
    return message.channel.send(statValue);
  },
};

const pray: Command = {
  name: 'pray',
  group,
  description: 'Gets current amount of prayers.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('pray');
    return message.channel.send(statValue);
  },
};

const nakirium: Command = {
  name: 'nakirium',
  group,
  description: 'Gets current amount of refilled Nakirium.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('nakirium');
    return message.channel.send(statValue);
  },
};

const phone: Command = {
  name: 'phone',
  group,
  description: 'Gets current amount of phones, pointed at people.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('phone');
    return message.channel.send(statValue);
  },
};

const ayame: Command = {
  name: 'ayame',
  aliases: ['ojou'],
  group,
  description: 'Gets current amount of Ojou mentions.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('ayame');
    return message.channel.send(statValue);
  },
};

const poyoyo: Command = {
  name: 'poyoyo',
  group,
  description: 'Gets current amount of Poyoyo mentions.',
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue('poyoyo');
    return message.channel.send(statValue);
  },
};

export default [despair, pray, nakirium, phone, ayame, poyoyo];
