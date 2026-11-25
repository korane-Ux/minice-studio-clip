import type { BibleContext, ScriptDraft } from '../schemas';
import { jsonInstruction } from './context';

export function buildSummaryPrompt(ctx: BibleContext, script: ScriptDraft): string {
  const scenes = script.scenes.map((s, i) => `${i + 1}. ${s.visual} ${s.dialogue}`).join('\n');
  return [
    `Tu tiens le résumé du feuilleton du compte TikTok « ${ctx.account.name} ».`,
    `Résumé actuel : ${ctx.summary.trim() || 'Début du feuilleton, aucun épisode encore.'}`,
    `Nouvel épisode : ${script.title}\n${scenes}\nLeçon : ${script.lesson}`,
    'Mets à jour le résumé en français pour qu’il intègre ce nouvel épisode. Garde les personnages, ce qui leur est arrivé et les fils en suspens. 1200 caractères maximum.',
    jsonInstruction({ summary: 'Le résumé mis à jour' }),
  ].join('\n\n');
}
