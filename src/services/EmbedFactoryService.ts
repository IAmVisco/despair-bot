import { MessageEmbed, ClientUser } from 'discord.js';
import * as moment from 'moment-timezone';
import { BOT_VERSION } from '../helpers/consts';

class EmbedFactoryService {
  getEmbedBase(user: ClientUser | null, title: string): MessageEmbed {
    const embed = new MessageEmbed()
      .setTitle(title)
      .setAuthor(`${user?.username} v${BOT_VERSION}`, user?.avatarURL({ dynamic: true }) || '')
      .setTimestamp()
      .setColor(this.getRandomColor())
      .setFooter(this.getUptime());

    return embed;
  }

  private getUptime(): string {
    const uptime = moment.duration(process.uptime(), 'seconds');
    const days = uptime.days() ? `${uptime.days()} days,` : '';
    const hours = uptime.hours() ? `${uptime.hours()} hours,` : '';
    const mins = uptime.minutes() ? `${uptime.minutes()} minutes,` : '';
    const secs = uptime.seconds() > 1 ? `${uptime.seconds()} seconds` : `${uptime.seconds()} second`;

    return `Uptime: ${`${days} ${hours} ${mins} ${secs}`.trim()}`;
  }

  private getRandomColor(): string {
    // eslint-disable-next-line no-bitwise
    return `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`;
  }
}

export const embedFactory = new EmbedFactoryService();
