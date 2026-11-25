import type { BibleContext } from '../schemas';
import { bibleBlock, jsonInstruction, rulesBlock, SCRIPT_EXAMPLE } from './context';

export function buildBatchPrompt(ctx: BibleContext, count: number): string {
  return [
    'Tu écris des mini-séries dramatiques pour TikTok, générées par IA, qui transmettent une leçon de vie.',
    bibleBlock(ctx),
    rulesBlock(ctx.account),
    `Écris ${count} épisodes qui se suivent dans le feuilleton. Une histoire peut durer 1 à 3 épisodes : les premiers finissent sur un suspense, le dernier sur la leçon.`,
    jsonInstruction({ episodes: [SCRIPT_EXAMPLE] }),
  ].join('\n\n');
}
