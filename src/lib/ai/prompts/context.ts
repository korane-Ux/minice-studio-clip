import { STYLE_LABELS, type Account } from '@/lib/domain/types';
import type { BibleContext } from '../schemas';

export function bibleBlock(ctx: BibleContext): string {
  const { account } = ctx;
  const characters = [...ctx.characters]
    .sort((a, b) => a.position - b.position)
    .map((c) => `- ${c.name} : ${c.description}`)
    .join('\n');
  return [
    `Compte TikTok : ${account.name}`,
    `Style visuel : ${STYLE_LABELS[account.style]}`,
    `Contenu : ${account.contentFocus}`,
    `Ton : ${account.tone}`,
    `Valeurs à mettre en avant : ${account.coreValues.join(', ')}`,
    `Thèmes : ${account.themes.join(', ')}`,
    `Toujours exclu : ${account.exclusions.join(', ')}`,
    `Personnages (utilise exactement ces noms) :\n${characters || '- aucun pour l’instant'}`,
    `Résumé du feuilleton : ${ctx.summary.trim() || 'Début du feuilleton, aucun épisode encore.'}`,
  ].join('\n');
}

function lessonRule(account: Account): string {
  switch (account.lessonFormat) {
    case 'verset':
      return 'La leçon finale cite un verset biblique dans la traduction Louis Segond 1910, avec sa référence (exemple : Luc 15:24).';
    case 'phrase_personnage':
      return 'La leçon finale est une phrase courte dite par un personnage.';
    case 'phrase_ecran':
      return 'La leçon finale est une phrase courte affichée à l’écran.';
  }
}

export function rulesBlock(account: Account): string {
  return [
    'Règles :',
    '- Écris en français, avec des phrases simples.',
    `- Vidéo verticale 9:16. Épisode de 20 à 40 secondes (cible ${account.targetDurationS} secondes), en 3 à 5 scènes de 8 secondes maximum.`,
    '- Une accroche dans les 2 premières secondes. Le drame sert d’accroche, la leçon arrive à la fin de l’histoire.',
    '- La leçon est courte et bienveillante, jamais lourde ni moralisatrice.',
    '- Valeurs chrétiennes : humilité, honnêteté, pardon, famille, persévérance, foi. Rien d’irrespectueux envers la foi.',
    '- Pas de gore, pas de scène sexuelle, pas de vraies personnes, pas de personnages connus protégés par le droit d’auteur.',
    `- ${lessonRule(account)}`,
  ].join('\n');
}

export function jsonInstruction(example: unknown): string {
  return `Réponds uniquement avec un bloc \`\`\`json contenant un objet de cette forme :\n\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``;
}

export const SCENE_EXAMPLE = {
  visual: 'Ce qu’on voit dans la scène',
  dialogue: 'Nom : « réplique »',
  durationS: 8,
  characters: ['Nom'],
};

export const SCRIPT_EXAMPLE = {
  title: 'Titre de l’épisode',
  lesson: 'La leçon finale',
  caption: 'Légende TikTok qui donne envie de regarder',
  hashtags: ['#histoire', '#leçondevie', '#famille'],
  scenes: [SCENE_EXAMPLE],
};
