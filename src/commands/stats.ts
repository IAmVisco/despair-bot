import * as moment from 'moment-timezone';
import * as path from 'path';
import type { MessageEmbed } from 'discord.js';
import { contextMessageBody, dictionaryMessageBody, KEYWORDS } from '../helpers/consts';
import { redis } from '../helpers/redis';
import { embedFactory } from '../services/EmbedFactoryService';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command, CustomMessage } from '../types';

const group = path.parse(__filename).name;

const keywordCommands = KEYWORDS.map(
  ({ name, description, aliases }): Command => ({
    name,
    group,
    description,
    aliases,
    async execute(message) {
      const statValue = await redisCollectorService.getKeyValue(name);
      return message.channel.send(statValue.toString());
    },
  }),
);

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const poyoArmy: Command = {
  name: 'poyoarmy',
  group,
  description: 'Shows taken Poyoyo numbers.',
  async execute(message) {
    if (!message.guild) {
      return message.channel.send('Cannot execute command in DMs!');
    }
    const usernames = message.guild.members.cache
      .map((member) => {
        if (member.nickname?.startsWith('Poyoyo')) {
          return member.nickname.split(' ')[0].replace('Poyoyo', '');
        }
        if (member.user.username.startsWith('Poyoyo')) {
          return member.user.username.split(' ')[0].replace('Poyoyo', '');
        }
        return '';
      })
      .map((x) => parseInt(x, 10))
      .filter((x) => x)
      .sort((a, b) => a - b);

    const duplicates = usernames?.reduce<number[]>((acc, el, i, arr) => {
      if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
      return acc;
    }, []);

    if (usernames.length) {
      const embed = embedFactory
        .getEmbedBase(message.client.user, 'Poyoyo army list')
        .setDescription('Full list of taken Poyoyo numbers.')
        .addField('Army size', usernames.length.toString(), true)
        .addField('Heretics', (message.guild.memberCount - usernames.length).toString(), true)
        .addField(
          'How to join',
          'Pick any number that is not listed below and change your nickname **on the server** according to the following format `Poyoyo<number> | <Your Nickname>`',
        );

      while (usernames.length) {
        const namesChunk = [];
        while (namesChunk.join(',').length <= 1000 && usernames.length) {
          namesChunk.push(usernames.shift());
        }
        embed.addField('Numbers taken', namesChunk.join(','));
      }

      if (duplicates.length) {
        embed.addField('Duplicates', duplicates.join(', '));
      }

      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send('None!');
  },
};

const ctx: Command = {
  name: 'ctx',
  group,
  description: 'Resets context counter and shows time since last reset',
  aliases: ['context'],
  async execute(message, args) {
    let newBestSet = false;
    const lastReset = moment(await redis.get('context-reset'));
    const bestResult = Number(await redis.get('context-best'));
    const fromNow = moment.duration(moment().diff(lastReset));
    const embed = embedFactory
      .getEmbedBase(message.client.user, 'Context timer')
      .addField('Time since last time context was mentioned', embedFactory.formatDuration(fromNow));
    if (args && args.pop() === 'reset') {
      embed.setFooter({ text: 'Counter reset!' });
      await redis.set('context-reset', moment().toISOString());
      if (fromNow.asMilliseconds() > bestResult) {
        newBestSet = true;
        embed.setDescription('New best!').addField('Best result', embedFactory.formatDuration(fromNow));
        await redis.set('context-best', fromNow.asMilliseconds());
      }
    } else {
      embed.setDescription("Pass 'reset' as an argument to reset the counter.");
    }
    !newBestSet && embed.addField('Best result', embedFactory.formatDuration(moment.duration(bestResult)));

    return message.channel.send({ embeds: [embed] });
  },
};

const context: Command = {
  name: 'context',
  group,
  description: 'Pulls out "Provide more context!" message',
  async execute(message) {
    const contextRequiredTimes = await redis.incr('context-help');
    const embed = embedFactory
      .getEmbedBase(message.client.user, 'Please, provide more context!')
      .setFooter({
        text: `Context was required ${contextRequiredTimes} ${contextRequiredTimes === 1 ? 'time' : 'times'}`,
      })
      .setDescription(contextMessageBody);

    return message.channel.send({ embeds: [embed] });
  },
};

const dictionary: Command = {
  name: 'dictionary',
  group,
  description: 'Pulls out "Have you tried checking a dictionary?" message',
  aliases: ['dict', 'jisho'],
  async execute(message) {
    const dictionaryNotUsedTimes = await redis.incr('dict-help');
    const embed = embedFactory
      .getEmbedBase(message.client.user, 'Have you tried checking a dictionary first?')
      .setFooter({
        text: `A dictionary was not used ${dictionaryNotUsedTimes} ${dictionaryNotUsedTimes === 1 ? 'time' : 'times'}`,
      })
      .setDescription(dictionaryMessageBody);

    return message.channel.send({ embeds: [embed] });
  },
};

const cancel: Command = {
  name: 'cancel',
  group,
  description: 'Cancels someone',
  aliases: ['cancels'],
  async execute(message, args) {
    const showList = async (msg: CustomMessage): Promise<MessageEmbed> => {
      const embed = embedFactory
        .getEmbedBase(msg.client.user, 'Cancel list')
        .setDescription(`Invoke the command like \`${process.env.BOT_PREFIX}cancel @<user>\` to cancel them!`);
      const usersRange = await redis.zrevrange('cancels', 0, 15, 'WITHSCORES');
      const chunks = 2;
      const userChunks = Array(Math.ceil(usersRange.length / chunks))
        .fill(null)
        .map((_, i) => usersRange.slice(i * chunks, i * chunks + chunks));
      embed.addField(
        'Sorted list',
        userChunks
          .filter(([, cancelAmount]) => +cancelAmount > 1)
          .map(([userId, cancelAmount]) => `<@${userId}> - ${cancelAmount}`)
          .join('\n'),
      );

      return embed;
    };

    const cancelUser = async (msg: CustomMessage): Promise<MessageEmbed> => {
      const embed = embedFactory.getEmbedBase(msg.client.user, 'User canceled!');
      const timesCanceled = await redis.zincrby('cancels', 1, message.mentions.users.first()!.id);
      const firstTime = timesCanceled === '1';
      embed.addField(
        firstTime ? 'Congrats!' : 'Here we go again',
        firstTime ? "It's your first time getting canceled!" : `You've already been canceled ${timesCanceled} times.`,
      );

      return embed;
    };
    const embed = !args?.length || !message.mentions.users.size ? await showList(message) : await cancelUser(message);

    return message.channel.send({ embeds: [embed] });
  },
};

export default keywordCommands.concat([ctx, context, dictionary, cancel]);
