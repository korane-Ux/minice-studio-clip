import type { BibleContext, Idea } from '../schemas';
import { bibleBlock, jsonInstruction, rulesBlock, SCRIPT_EXAMPLE } from './context';

export function buildScriptPrompt(ctx: BibleContext, idea: Idea): string {
  return [
    'Tu écris des mini-séries dramatiques pour TikTok, générées par IA, qui transmettent une leçon de vie.',
    bibleBlock(ctx),
    rulesBlock(ctx.account),
    `Idée retenue :\nTitre : ${idea.title}\nHistoire : ${idea.pitch}\nLeçon : ${idea.lesson}`,
    'Écris le script de cet épisode, découpé en scènes. Pour chaque scène : ce qu’on voit, la réplique, la durée en secondes, et les personnages présents.',
    jsonInstruction(SCRIPT_EXAMPLE),
  ].join('\n\n');
}
