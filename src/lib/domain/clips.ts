import { transition, type EpisodeStatus } from './status';

// Statut d'un épisode après l'ajout ou le retrait d'un clip (lève une erreur hors des étapes Scènes et Montage).
export function statusAfterClips(status: EpisodeStatus, scenes: { clipPath: string | null }[]): EpisodeStatus {
  const allPresent = scenes.length > 0 && scenes.every((s) => !!s.clipPath);
  return transition(status, { type: 'CLIPS_CHANGED', allPresent });
}
