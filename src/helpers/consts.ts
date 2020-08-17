import { StatsCommand } from '../types';
import * as pkg from '../../package.json';

export const BOT_VERSION = pkg.version;
export const BOT_DESCRIPTION = pkg.description;
export const GITHUB_LINK = pkg.repository;

export const KEYWORDS: StatsCommand[] = [
  {
    name: 'despair',
    aliases: ['why'],
    regex: /(ayame_?despair|ayame_?why)/gi,
    description: 'Gets current amount of despair.',
  },
  {
    name: 'pray',
    aliases: ['bless'],
    regex: /(ayame_?pray|ayame_?blessing)/gi,
    description: 'Gets current amount of prayers.',
  },
  {
    name: 'nakirium',
    regex: /(ayame_?cry|o+jo{2,}u{2,})/gi,
    description: 'Gets current amount of refilled Nakirium.',
  },
  {
    name: 'phone',
    regex: /(ayame_?phone)/gi,
    description: 'Gets current amount of phones, pointed at people.',
  },
  {
    name: 'ayame',
    aliases: ['ojou'],
    regex: /(ayame|ojou)/gi,
    description: 'Gets current amount of Ojou mentions.',
  },
  {
    name: 'poyoyo',
    regex: /poyoyo/gi,
    description: 'Gets current amount of Poyoyo mentions.',
  },
  {
    name: 'zoom',
    regex: /(ayame_?zoom)/gi,
    description: 'Gets current amount of zoomed Ayames.',
  },
];
