import * as pkg from '../../package.json';
import * as triggers from '../../triggers.json';
import { StatsCommand } from '../types';

export const BOT_VERSION = pkg.version;
export const BOT_DESCRIPTION = pkg.description;
export const GITHUB_LINK = pkg.repository;

export const KEYWORDS: StatsCommand[] = triggers.map((trigger) => ({
  ...trigger,
  regex: new RegExp(trigger.regex, 'gi'),
}));
