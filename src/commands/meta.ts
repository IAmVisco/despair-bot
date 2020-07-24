import * as path from 'path';
import * as moment from 'moment-timezone';
import { MessageEmbed } from 'discord.js';
import { BOT_DESCRIPTION, BOT_VERSION, GITHUB_LINK } from '../helpers/consts';
import { redisCollectorService } from '../services/RedisCollectorService';
import { Command } from '../types';

const group = path.parse(__filename).name;

function getUptime(): string {
  const uptime = moment.duration(process.uptime(), 'seconds');
  const days = uptime.days() ? `${uptime.days()} days,` : '';
  const hours = uptime.hours() ? `${uptime.hours()} hours,` : '';
  const mins = uptime.minutes() ? `${uptime.minutes()} minutes,` : '';
  const secs = uptime.seconds() > 1 ? `${uptime.seconds()} seconds` : `${uptime.seconds()} second`;

  return `${days} ${hours} ${mins} ${secs}`;
}

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
        c.group in commands
          ? commands[c.group].push(c)
          : commands[c.group] = [c];
      } else {
        commands.uncategorized.push(c);
      }
    });
    Object.keys(commands).sort().forEach((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      orderedCommands[capitalizedKey] = commands[key]
        .filter((c) => !c.hidden)
        .sort((a, b) => (a.name > b.name ? 1 : -1));
    });

    const embed = new MessageEmbed()
      .setTitle(`${user?.username} commands list`)
      .setThumbnail(user?.avatarURL({ dynamic: true }) || '')
      .setDescription(BOT_DESCRIPTION)
      .setTimestamp();
    const prefix = process.env.BOT_PREFIX;
    Object.keys(orderedCommands).forEach((k) => {
      if (orderedCommands[k].length) {
        embed.addField('Group', `**${k}**`);
        orderedCommands[k].forEach((c) => {
          const commandName = c.aliases
            ? `${prefix}${c.name} [${c.aliases.join(', ')}]`
            : `${prefix}${c.name}`;
          embed.addField(commandName, c.description, true);
        });
      }
    });

    return message.channel.send(embed);
  },
};

const ping: Command = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message) {
    const msg = await message.channel.send(new MessageEmbed().setTitle('Pong!').setColor('GREEN'));
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));
    const replyEmbed = new MessageEmbed()
      .setTitle('Pong!')
      .setColor('GREEN')
      .setDescription(`:hourglass: Message ping: ${pingTime}ms`
        + `\n:heartbeat: Websocket ping: ${message.client.ws.ping}ms`)
      .setTimestamp();

    return msg.edit(replyEmbed);
  },
};

const invite: Command = {
  name: 'invite',
  group,
  description: 'Retrieves bot invite.',
  async execute(message) {
    // Returns old API link since lib is not updated it yet
    return message.channel.send(`<${await message.client.generateInvite()}>`);
  },
};

const info: Command = {
  name: 'info',
  aliases: ['about'],
  group,
  description: 'Prints bot info.',
  async execute(message) {
    const { user } = message.client;
    const infoEmbed = new MessageEmbed()
      .setAuthor(
        `${user?.username} v${BOT_VERSION}`,
        user?.avatarURL({ dynamic: true }) || '',
        await message.client.generateInvite(),
      )
      .setTitle('Source code')
      .setURL(GITHUB_LINK)
      .setThumbnail(user?.avatarURL({ dynamic: true }) || '')
      .setDescription(BOT_DESCRIPTION)
      .addField('Users known', `${message.client.users.cache.size}`, true)
      .addField('Guilds known', `${message.client.guilds.cache.size}`, true)
      .addField('Commands executed', `${await redisCollectorService.getKeyValue('commands')}`, true)
      .setTimestamp()
      .setFooter(getUptime());

    return message.channel.send(infoEmbed);
  },
};

export default [help, ping, invite, info];
