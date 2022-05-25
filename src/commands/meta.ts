import * as moment from 'moment-timezone';
import * as path from 'path';
import { BOT_DESCRIPTION, GITHUB_LINK } from '../helpers/consts';
import { embedFactory } from '../services/EmbedFactoryService';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';

const group = path.parse(__filename).name;

const help: Command = {
  name: 'help',
  group,
  aliases: ['commands', 'h'],
  description: 'Prints out this message.',
  execute(message) {
    const { user } = message.client;
    const orderedCommands: { [key: string]: Array<Command> } = {};
    const commands: { [key: string]: Array<Command> } = { uncategorized: [] };
    message.client.commands!.forEach((c) => {
      if (c.group) {
        c.group in commands ? commands[c.group].push(c) : (commands[c.group] = [c]);
      } else {
        commands.uncategorized.push(c);
      }
    });
    Object.keys(commands)
      .sort()
      .forEach((key) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        orderedCommands[capitalizedKey] = commands[key]
          .filter((c) => !c.hidden)
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      });

    const embed = embedFactory
      .getEmbedBase(user, `${user?.username} commands list`)
      .setThumbnail(user?.avatarURL({ dynamic: true }) || '')
      .setDescription(BOT_DESCRIPTION);
    const prefix = process.env.BOT_PREFIX;
    Object.keys(orderedCommands).forEach((k) => {
      if (orderedCommands[k].length) {
        embed.addField('Group', `**${k}**`);
        orderedCommands[k].forEach((c) => {
          const commandName = c.aliases ? `${prefix}${c.name} [${c.aliases.join(', ')}]` : `${prefix}${c.name}`;
          embed.addField(commandName, c.description, true);
        });
      }
    });

    return message.channel.send({ embeds: [embed] });
  },
};

const ping: Command = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message) {
    const msg = await message.channel.send({
      embeds: [embedFactory.getEmbedBase(message.client.user, 'Pong!').setColor('GREEN')],
    });
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));
    const replyEmbed = embedFactory
      .getEmbedBase(message.client.user, 'Pong!')
      .setDescription(
        `:hourglass: Message ping: ${pingTime}ms\n:heartbeat: Websocket ping: ${message.client.ws.ping}ms`,
      )
      .setColor('GREEN')
      .setTimestamp();

    return msg.edit({ embeds: [replyEmbed] });
  },
};

const invite: Command = {
  name: 'invite',
  group,
  description: 'Retrieves bot invite.',
  async execute(message) {
    // Returns an old API link since lib is not updated it yet?
    return message.channel.send(`<${message.client.generateInvite()}>`);
  },
};

const info: Command = {
  name: 'info',
  aliases: ['about'],
  group,
  description: 'Prints bot info.',
  async execute(message) {
    const { user } = message.client;
    const infoEmbed = embedFactory
      .getEmbedBase(user, 'Source code')
      .setURL(GITHUB_LINK)
      .setThumbnail(user?.avatarURL({ dynamic: true }) || '')
      .setDescription(
        `${BOT_DESCRIPTION}\n` +
          'Check out real time counter [here](https://ayamedespair.com).\n' +
          `[Invite this bot to your server](${message.client.generateInvite()}).`,
      )
      .addField('Users known', `${message.client.users.cache.size}`, true)
      .addField('Guilds known', `${message.client.guilds.cache.size}`, true)
      .addField('Commands executed', `${await redisCollectorService.getKeyValue('commands')}`, true);

    return message.channel.send({ embeds: [infoEmbed] });
  },
};

export default [help, ping, invite, info];
