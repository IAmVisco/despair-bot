import * as path from 'path';
import * as moment from 'moment-timezone';
import { redis } from '../helpers/redis';
import { KEYWORDS } from '../helpers/consts';
import { embedFactory } from '../services/EmbedFactoryService';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';

const group = path.parse(__filename).name;

const keywordCommands = KEYWORDS.map(({ name, description, aliases }): Command => ({
  name,
  group,
  description,
  aliases,
  async execute(message) {
    const statValue = await redisCollectorService.getKeyValue(name);
    return message.channel.send(statValue);
  },
}));

const poyoArmy: Command = {
  name: 'poyoarmy',
  group,
  description: 'Shows taken Poyoyo numbers.',
  async execute(message) {
    if (!message.guild) {
      return message.channel.send('Cannot execute command in DMs!');
    }
    const usernames = message.guild.members.cache.map((member) => {
      if (member.nickname?.startsWith('Poyoyo')) {
        return member.nickname.split(' ')[0].replace('Poyoyo', '');
      }
      if (member.user.username.startsWith('Poyoyo')) {
        return member.user.username.split(' ')[0].replace('Poyoyo', '');
      }
      return '';
    }).map((x) => parseInt(x, 10)).filter((x) => x).sort((a, b) => a - b);

    const duplicates = usernames?.reduce<number[]>((acc, el, i, arr) => {
      if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
      return acc;
    }, []);

    if (usernames.length) {
      const embed = embedFactory.getEmbedBase(message.client.user, 'Poyoyo army list')
        .setDescription('Full list of taken Poyoyo numbers.')
        .addField('Army size', usernames.length, true)
        .addField('Heretics', message.guild.memberCount - usernames.length, true)
        .addField('Numbers taken', usernames.join(', '));

      return message.channel.send(duplicates.length
        ? embed.addField('Duplicates', duplicates.join(', '))
        : embed);
    }

    return message.channel.send('None!');
  },
};

const context: Command = {
  name: 'ctx',
  group,
  description: 'Resets context counter and shows time since last reset',
  aliases: ['context'],
  async execute(message, args) {
    const lastReset = moment(await redis.get('context'));
    const fromNow = moment().diff(lastReset);
    const embed = embedFactory.getEmbedBase(message.client.user, 'Context timer')
      .setDescription('Pass \'check\' as an argument to avoid reset.')
      .addField('Time since last time context was mentioned', embedFactory.formatDuration(moment.duration(fromNow)));
    if (!(args && args.pop() === 'check')) {
      embed.setFooter('Counter reset!');
      await redis.set('context', moment().toISOString());
    }
    return message.channel.send(embed);
  },
};

export default keywordCommands.concat([poyoArmy, context]);
