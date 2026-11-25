import type { BibleContext } from '../schemas';
import { bibleBlock, jsonInstruction, rulesBlock } from './context';

export function buildIdeasPrompt(ctx: BibleContext, hint?: string): string {
  return [
    'Tu écris des mini-séries dramatiques pour TikTok, générées par IA, qui transmettent une leçon de vie.',
    bibleBlock(ctx),
    rulesBlock(ctx.account),
    hint?.trim() ? `Indication pour le prochain épisode : ${hint.trim()}` : '',
    'Propose 5 idées pour le prochain épisode, qui suivent le feuilleton.',
    jsonInstruction({ ideas: [{ title: 'Titre', pitch: 'L’histoire en deux phrases', lesson: 'La leçon finale' }] }),
  ]
    .filter(Boolean)
    .join('\n\n');
}
