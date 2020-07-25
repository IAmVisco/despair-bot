import { MessageEmbed } from 'discord.js';
import * as path from 'path';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';
import { KEYWORDS } from '../helpers/consts';

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
      const embed = new MessageEmbed()
        .setTitle('Poyoyo army list')
        .setDescription('Full list of taken Poyoyo numbers.')
        .addField('Numbers taken', usernames.join(', '))
        .setTimestamp();

      return message.channel.send(duplicates.length
        ? embed.addField('Duplicates', duplicates.join(', '))
        : embed);
    }

    return message.channel.send('None!');
  },
};

export default keywordCommands.concat([poyoArmy]);
