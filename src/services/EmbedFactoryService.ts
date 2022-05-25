import { MessageEmbed, ClientUser, HexColorString } from 'discord.js';
import * as moment from 'moment-timezone';
import { BOT_VERSION } from '../helpers/consts';

class EmbedFactoryService {
  getEmbedBase(user: ClientUser | null, title: string): MessageEmbed {
    const embed = new MessageEmbed()
      .setTitle(title)
      .setAuthor({ name: `${user?.username} v${BOT_VERSION}`, iconURL: user?.avatarURL({ dynamic: true }) || '' })
      .setTimestamp()
      .setColor(EmbedFactoryService.getRandomColor())
      .setFooter({ text: this.getUptime() });

    return embed;
  }

  // TODO: move to proper place
  formatDuration(duration: moment.Duration): string {
    const days = duration.days() ? `${duration.days()} ${duration.days() > 1 ? 'days,' : 'day,'}` : '';
    const hours = duration.hours() ? `${duration.hours()} ${duration.hours() > 1 ? 'hours,' : 'hour,'}` : '';
    const mins = duration.minutes() ? `${duration.minutes()} ${duration.minutes() > 1 ? 'minutes,' : 'minute,'}` : '';
    const secs = duration.seconds() > 1 ? `${duration.seconds()} seconds` : `${duration.seconds()} second`;

    return `${`${days} ${hours} ${mins} ${secs}`.trim()}`;
  }

  private getUptime(): string {
    const uptime = moment.duration(process.uptime(), 'seconds');
    const formattedDuration = this.formatDuration(uptime);

    return `Uptime: ${formattedDuration}`;
  }

  private static getRandomColor(): HexColorString {
    // eslint-disable-next-line no-bitwise
    return `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')}`;
  }
}

export const embedFactory = new EmbedFactoryService();
