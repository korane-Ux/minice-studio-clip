import type { SceneDraft } from '@/lib/ai/schemas';
import { STYLE_LABELS, type Account, type Character } from '@/lib/domain/types';

// Prompt d'une scène pour l'outil vidéo (spec, section 11 : personnages identiques d'une scène à l'autre).
export function buildScenePrompt(args: { account: Account; scene: SceneDraft; position: number; cast: Character[] }): {
  prompt: string;
  refs: Character[];
} {
  const { account, scene, position, cast } = args;
  const present = new Set(scene.characters.map((n) => n.trim().toLowerCase()));
  const refs = cast.filter((c) => present.has(c.name.trim().toLowerCase())).sort((a, b) => a.position - b.position);

  const parts: string[] = [];
  if (position > 1) parts.push('La scène suit directement la précédente.');
  parts.push(`Style ${STYLE_LABELS[account.style]}, plan vertical 9:16, ${scene.durationS} secondes.`);
  if (refs.length) {
    parts.push(`Personnages joints : ${refs.map((c, i) => `${i + 1}. ${c.name} (${c.description})`).join(', ')}.`);
    parts.push('Garde leur apparence exactement comme sur les images jointes.');
  }
  parts.push(scene.visual.trim());
  parts.push(scene.dialogue.trim() ? `Dialogue en français : ${scene.dialogue.trim()}` : 'Pas de dialogue.');
  return { prompt: parts.join(' '), refs };
}
