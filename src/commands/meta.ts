import * as path from 'path';
import * as moment from 'moment-timezone';
import { MessageEmbed } from 'discord.js';
import { despairService } from '../services/DespairService';
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
      .setDescription('Uploads your stuff to Dropbox.')
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

const despair: Command = {
  name: 'despair',
  group,
  description: 'Gets current amount of despair.',
  async execute(message) {
    const despairAmount = await despairService.getDespairAmount();
    return message.channel.send(despairAmount);
  },
};

export default [help, ping, despair];
