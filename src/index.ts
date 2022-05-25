import 'dotenv/config';
import { Intents } from 'discord.js';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { BOT_VERSION } from './helpers/consts';
import { logger } from './helpers/logger';
import { redisCollectorService } from './services/RedisCollectorService';
import { CustomClient, CustomMessage } from './types';

const client: CustomClient = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});
const prefix = process.env.BOT_PREFIX ?? '!!';
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.match(/^([^.].*)\.(js|ts)$/g));

client.commands = new Discord.Collection();

(async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const file of commandFiles) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const { default: commands } = await import(`./commands/${file}`);
      if (Array.isArray(commands)) {
        commands.forEach((c) => client.commands!.set(c.name, c));
      } else {
        client.commands!.set(commands.name, commands);
      }
    } catch (e) {
      logger.error(`Cannot import ${file}`, e);
    }
  }
})();

client.once('ready', () => {
  logger.info(`===== Despair Bot v${BOT_VERSION} ready =====`);
  logger.info(`Logged in as '${client.user?.tag}' (${client.user?.id})`);
  const usersAmount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  logger.info(`Serving to ${usersAmount} users from ${client.guilds.cache.size} guilds`);
  client.user?.setActivity({
    name: `with Poyoyo | ${prefix}help`,
    type: 'PLAYING',
  });
});

client.on('messageCreate', async (message: CustomMessage) => {
  redisCollectorService.countKeywords(message.content);
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift()!.toLowerCase();

  const command =
    client.commands!.get(commandName) ||
    client.commands!.find((cmd) => !!cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  try {
    redisCollectorService.incrementCommandCount();
    if (message.channel.type !== 'DM') {
      logger.info(
        `Executing command ${message.content} by @${message.author.tag} ` +
          `in #${message.channel.name} (${message.channel.guild.name})`,
      );
    } else {
      logger.info(`Executing command ${message.content} by @${message.author.tag} in DMs`);
    }

    if (command.permissions && !message.member?.permissions.has(command.permissions)) {
      const reply = ':warning: | You need higher permissions to execute this command!';
      message.channel.send(reply);
      return;
    }

    if (command.args && !args.length) {
      const reply =
        "You didn't provide any arguments!" +
        `${command.usage && `\nUsage: ${prefix}${command.name} ${command.usage}`}`;
      message.channel.send(reply);
      return;
    }

    await command.execute(message, args);
    return;
  } catch (error) {
    logger.error(`Command error, Message Snowflake: ${message.id}`, error);
  }
});

client.on('messageReactionAdd', (reaction) => {
  redisCollectorService.countKeywords(reaction.emoji.name);
});

client.on('error', (e) => {
  logger.error(e);
});

client.login(process.env.BOT_TOKEN);
