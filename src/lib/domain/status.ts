export type EpisodeStatus = 'idee' | 'scenes' | 'montage' | 'a_valider' | 'valide' | 'publie' | 'rejete';

export type EpisodeEvent =
  | { type: 'SCRIPT_IMPORTED' }
  | { type: 'CLIPS_CHANGED'; allPresent: boolean }
  | { type: 'VIDEO_ASSEMBLED' }
  | { type: 'APPROVED' }
  | { type: 'REDO_SCENE' }
  | { type: 'REJECTED' }
  | { type: 'PUBLISHED' };

export class InvalidTransitionError extends Error {
  constructor(status: EpisodeStatus, event: EpisodeEvent['type']) {
    super(`Transition impossible : ${event} depuis ${status}`);
    this.name = 'InvalidTransitionError';
  }
}

export function transition(status: EpisodeStatus, event: EpisodeEvent): EpisodeStatus {
  switch (event.type) {
    case 'SCRIPT_IMPORTED':
      if (status === 'idee') return 'scenes';
      break;
    case 'CLIPS_CHANGED':
      if (status === 'scenes' || status === 'montage') return event.allPresent ? 'montage' : 'scenes';
      break;
    case 'VIDEO_ASSEMBLED':
      if (status === 'montage') return 'a_valider';
      break;
    case 'APPROVED':
      if (status === 'a_valider') return 'valide';
      break;
    case 'REDO_SCENE':
      if (status === 'a_valider') return 'scenes';
      break;
    case 'REJECTED':
      if (status === 'idee' || status === 'scenes' || status === 'montage' || status === 'a_valider') return 'rejete';
      break;
    case 'PUBLISHED':
      if (status === 'valide') return 'publie';
      break;
  }
  throw new InvalidTransitionError(status, event.type);
}

export type StatusTone = 'attente' | 'pret' | 'en_cours' | 'publie' | 'rejete';

export function statusLabel(status: EpisodeStatus, clips?: { done: number; total: number }): { label: string; tone: StatusTone } {
  switch (status) {
    case 'idee':
      return { label: 'Script à préparer', tone: 'en_cours' };
    case 'scenes':
      return { label: clips ? `Scènes ${clips.done} / ${clips.total}` : 'Scènes', tone: 'en_cours' };
    case 'montage':
      return { label: 'Prêt pour le montage', tone: 'en_cours' };
    case 'a_valider':
      return { label: 'À valider', tone: 'attente' };
    case 'valide':
      return { label: 'Prêt à publier', tone: 'pret' };
    case 'publie':
      return { label: 'Publié', tone: 'publie' };
    case 'rejete':
      return { label: 'Rejeté', tone: 'rejete' };
  }
}
