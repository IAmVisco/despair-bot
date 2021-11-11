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

export const contextMessageBody = `**When we say "please give context" we mean:**
  ・Where, in detail, did you encounter the word, phrase, or sentence? 
  ・Was it a video, anime, manga, or website? If so, which one?
  ・What was the situation?
  ・Who said it? To whom?
  ・Do you have a link to the video or website where you encountered it? How about a screenshot? Audio clip?

***Please answer all of the above before proceeding.***`;

export const dictionaryMessageBody = `
Most "what does this word mean" questions can be answered with a dictionary! There are links to a couple below.
If you checked a dictionary and still have questions, please be specific.
What did you not understand? Do you need an example of how to use the word?
In the meantime, try these dictionaries:
・https://jisho.org/
・https://takoboto.jp/
`;
